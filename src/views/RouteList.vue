<template>
  <div id="RouteList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-map-marker-path</v-icon>
            <v-toolbar-title>Route Management</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn
              v-if="hasRole(['admin'])"
              color="primary"
              @click="openCreateDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              New Route
            </v-btn>
          </v-toolbar>
          <v-data-table
            :headers="headers"
            :items="sortedRoutes"
            :items-per-page="15"
            :loading="loading"
            class="elevation-0"
          >
            <template v-slot:item.color="{ item }">
              <span
                class="d-inline-block rounded"
                :style="{
                  width: '24px',
                  height: '24px',
                  backgroundColor: item.color || '#000000',
                  verticalAlign: 'middle'
                }"
              ></span>
              <span class="ml-2">{{ item.color }}</span>
            </template>
            <template v-slot:item.actions="{ item }">
              <RowActions>
                <template #pinned>
                  <v-menu
                    v-if="hasRole(['admin'])"
                    :close-on-content-click="false"
                  >
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        v-bind="menuProps"
                        :style="{ color: item.color || undefined }"
                        title="Change color"
                      >
                        <v-icon>mdi-palette</v-icon>
                      </v-btn>
                    </template>
                    <v-color-picker
                      :model-value="item.color"
                      @update:model-value="(c) => setRouteColor(item, c)"
                      mode="hex"
                    />
                  </v-menu>
                  <v-btn
                    v-if="hasRole(['admin'])"
                    icon
                    size="small"
                    variant="text"
                    @click="openAssignments(item)"
                    title="Manage assignments"
                  >
                    <v-icon>mdi-puzzle</v-icon>
                  </v-btn>
                </template>
                <v-list-item
                  v-if="hasRole(['admin'])"
                  prepend-icon="mdi-delete"
                  title="Delete"
                  class="text-error"
                  @click="confirmDelete(item)"
                />
              </RowActions>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500px">
      <v-card>
        <v-card-title>New Route</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newRoute.name"
            label="Route name"
            @keyup.enter="onCreateConfirmed"
          />
          <v-row style="min-height: 30em">
            <v-col cols="3" class="d-flex align-center">Color</v-col>
            <v-col cols="9">
              <v-color-picker v-model="newRoute.color" mode="hex" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onCreateConfirmed">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assignments dialog -->
    <v-dialog v-model="showAssignmentsDialog" max-width="600px">
      <v-card v-if="assigningRoute">
        <v-card-title>
          <v-icon class="mr-2">mdi-puzzle</v-icon>
          Assignments for
          <em class="ml-1">{{ assigningRoute.name }}</em>
        </v-card-title>
        <v-card-text>
          <RouteAssignments :route="assigningRoute" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showAssignmentsDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete Route</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ deletingRoute && deletingRoute.name }}</strong
          >? This will remove the route and all related information.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import model from '@/model'
import type { Route } from '@/remote/model/route'
import type { Session } from '@/App.vue'
import RowActions from '@/components/RowActions.vue'
import RouteAssignments from '@/components/forms/RouteAssignments.vue'

export default defineComponent({
  name: 'RouteList',
  components: { RowActions, RouteAssignments },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      routes: [] as Route[],
      showCreateDialog: false,
      showDeleteDialog: false,
      showAssignmentsDialog: false,
      newRoute: model.route.makeEmpty() as any,
      deletingRoute: null as Route | null,
      assigningRoute: null as Route | null,
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Color', key: 'color', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
      ]
    }
  },

  computed: {
    sortedRoutes(): Route[] {
      return this.routes.slice().sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }
  },

  async mounted() {
    await this.fetchRoutes()
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    async fetchRoutes() {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        this.routes = await api.fetchRoutes(eventId)
      } catch (e) {
        console.error('Failed to fetch routes', e)
      } finally {
        this.loading = false
      }
    },
    openCreateDialog() {
      this.newRoute = model.route.makeEmpty()
      this.showCreateDialog = true
    },
    openAssignments(route: Route) {
      this.assigningRoute = route
      this.showAssignmentsDialog = true
    },
    confirmDelete(route: Route) {
      this.deletingRoute = route
      this.showDeleteDialog = true
    },
    async onCreateConfirmed() {
      const eventId = (this as any).getSelectedEventId()
      try {
        const created = await api.addRoute(this.newRoute, eventId)
        this.routes.push(created)
      } catch (e) {
        console.error('Failed to add route', e)
      }
      this.newRoute = model.route.makeEmpty()
      this.showCreateDialog = false
    },
    async setRouteColor(route: Route, newColor: string) {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      try {
        await api.setRouteColor(route.name, newColor, eventId)
        route.color = newColor
      } catch (e) {
        console.error('Failed to set route color', e)
      }
    },
    async doDelete() {
      this.showDeleteDialog = false
      if (!this.deletingRoute) return
      const eventId = (this as any).getSelectedEventId()
      try {
        await api.deleteRoute(this.deletingRoute.name, eventId)
        this.routes = this.routes.filter(
          (r) => r.name !== this.deletingRoute!.name
        )
      } catch (e) {
        console.error('Failed to delete route', e)
      }
      this.deletingRoute = null
    }
  }
})
</script>
