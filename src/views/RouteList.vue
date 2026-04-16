<template>
  <center-col id="RouteList">
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Route"
    >
      <v-row class="text-xs-left">
        <v-col cols="12">
          <v-text-field
            name="route-input"
            @keyup.enter="onDialogConfirmed"
            type="text"
            v-model="selectedRoute.name"
            label="Enter a new route name"
          />
        </v-col>
      </v-row>
      <v-row class="text-xs-left" style="min-height: 30em">
        <v-col cols="3">Color</v-col>
        <v-col cols="9">
          <v-color-picker v-model="selectedRoute.color" mode="hex" />
        </v-col>
      </v-row>
    </popup-dialog>

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-list v-else lines="two">
      <route-block
        v-for="route in sortedRoutes"
        :route="route"
        :key="route.name"
        @deleted="onRouteDeleted(route)"
      ></route-block>
    </v-list>

    <v-list-item v-if="hasRole(['admin'])">
      <v-spacer />
      <v-list-item-action>
        <v-btn @click="openCreateDialog">Add new Route</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import model from '@/model'
import type { Route } from '@/remote/model/route'
import type { Session } from '@/App.vue'

const RouteList = defineComponent({
  name: 'route_list',
  components: {},
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      routes: [] as Route[],
      isAddBlockVisible: false,
      selectedRoute: model.route.makeEmpty() as any,
      sendMode: model.SEND_MODE.CREATE,
      SEND_MODE: model.SEND_MODE
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

  async created() {
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
      this.selectedRoute = model.route.makeEmpty()
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    async onDialogConfirmed() {
      const eventId = (this as any).getSelectedEventId()
      const route = this.selectedRoute

      if (this.sendMode === model.SEND_MODE.CREATE) {
        try {
          const created = await api.addRoute(route, eventId)
          this.routes.push(created)
        } catch (e) {
          console.error('Failed to add route', e)
        }
      } else {
        console.warn('Updating routes is not implemented yet!')
      }

      this.selectedRoute = model.route.makeEmpty()
      this.isAddBlockVisible = false
    },
    onRouteDeleted(route: Route) {
      this.routes = this.routes.filter((r) => r.name !== route.name)
    }
  }
})
export default RouteList
</script>

<style scoped>
#RouteList {
  padding-bottom: 5em;
}
</style>
