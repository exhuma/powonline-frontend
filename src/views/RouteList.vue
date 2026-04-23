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

            <template v-slot:item.assignedTeams="{ item }">
              <v-menu :close-on-content-click="false" max-height="300">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    variant="outlined"
                    size="small"
                    v-bind="menuProps"
                    :color="
                      assignedTeamNames(item).length > 0 ? 'primary' : undefined
                    "
                  >
                    <v-icon start>mdi-account-group</v-icon>
                    {{ assignedTeamNames(item).length }}
                    <v-icon end>mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item v-if="allTeams.length === 0">
                    <v-list-item-title class="text-disabled"
                      >No teams available</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item
                    v-for="team in allTeams"
                    :key="team.name"
                    :value="team.name"
                    @click.stop
                  >
                    <template #prepend>
                      <v-checkbox-btn
                        :model-value="isTeamAssigned(item, team.name)"
                        :loading="isTeamToggling(item, team.name)"
                        @update:model-value="
                          (val) => toggleTeam(item, team, val)
                        "
                        @click.stop
                      />
                    </template>
                    <v-list-item-title>{{ team.name }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <template v-slot:item.assignedStations="{ item }">
              <v-menu :close-on-content-click="false" max-height="300">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    variant="outlined"
                    size="small"
                    v-bind="menuProps"
                    :color="
                      assignedStationNames(item).length > 0
                        ? 'primary'
                        : undefined
                    "
                  >
                    <v-icon start>mdi-map-marker</v-icon>
                    {{ assignedStationNames(item).length }}
                    <v-icon end>mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item v-if="allStations.length === 0">
                    <v-list-item-title class="text-disabled"
                      >No stations available</v-list-item-title
                    >
                  </v-list-item>
                  <v-list-item
                    v-for="station in sortedStations"
                    :key="station.name"
                    :value="station.name"
                    @click.stop
                  >
                    <template #prepend>
                      <v-checkbox-btn
                        :model-value="isStationAssigned(item, station.name)"
                        :loading="isStationToggling(item, station.name)"
                        @update:model-value="
                          (val) => toggleStation(item, station, val)
                        "
                        @click.stop
                      />
                    </template>
                    <v-list-item-title>
                      <span class="text-caption text-disabled mr-1"
                        >#{{ station.order }}</span
                      >
                      {{ station.name }}
                      <v-chip
                        v-if="station.is_start"
                        size="x-small"
                        color="success"
                        class="ml-1"
                        >S</v-chip
                      >
                      <v-chip
                        v-if="station.is_end"
                        size="x-small"
                        color="error"
                        class="ml-1"
                        >E</v-chip
                      >
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
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
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { AssignmentMap } from '@/remote/model/assignmentMap'
import type { Session } from '@/App.vue'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'RouteList',
  components: { RowActions },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      routes: [] as Route[],
      allTeams: [] as Team[],
      allStations: [] as Station[],
      assignments: { teams: {}, stations: {} } as AssignmentMap,
      // tracks in-flight toggles to show loading state: "routeName:itemName"
      togglingTeams: new Set<string>(),
      togglingStations: new Set<string>(),
      showCreateDialog: false,
      showDeleteDialog: false,
      newRoute: model.route.makeEmpty() as any,
      deletingRoute: null as Route | null,
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Color', key: 'color', sortable: false },
        { title: 'Assigned Teams', key: 'assignedTeams', sortable: false },
        {
          title: 'Assigned Stations',
          key: 'assignedStations',
          sortable: false
        },
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
    },
    sortedStations(): Station[] {
      return this.allStations.slice().sort((a, b) => a.order - b.order)
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },

    async fetchData() {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        const [routes, teams, stations, assignments] = await Promise.all([
          api.fetchRoutes(eventId),
          api.fetchTeams(eventId),
          api.fetchStations(eventId),
          api.fetchAssignments(eventId)
        ])
        this.routes = routes
        this.allTeams = teams
        this.allStations = stations
        this.assignments = assignments
      } catch (e) {
        console.error('Failed to fetch route management data', e)
      } finally {
        this.loading = false
      }
    },

    assignedTeamNames(route: Route): string[] {
      return (this.assignments.teams[route.name] || []).map((t) => t.name)
    },

    assignedStationNames(route: Route): string[] {
      return (this.assignments.stations[route.name] || []).map((s) => s.name)
    },

    isTeamAssigned(route: Route, teamName: string): boolean {
      return this.assignedTeamNames(route).includes(teamName)
    },

    isStationAssigned(route: Route, stationName: string): boolean {
      return this.assignedStationNames(route).includes(stationName)
    },

    isTeamToggling(route: Route, teamName: string): boolean {
      return this.togglingTeams.has(`${route.name}:${teamName}`)
    },

    isStationToggling(route: Route, stationName: string): boolean {
      return this.togglingStations.has(`${route.name}:${stationName}`)
    },

    async toggleTeam(route: Route, team: Team, assign: boolean) {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      const key = `${route.name}:${team.name}`
      this.togglingTeams = new Set([...this.togglingTeams, key])
      try {
        if (assign) {
          await api.addTeamToRoute(route.name, team, eventId)
          if (!this.assignments.teams[route.name]) {
            this.assignments.teams[route.name] = []
          }
          if (
            !this.assignments.teams[route.name].find(
              (t) => t.name === team.name
            )
          ) {
            this.assignments.teams[route.name].push(team)
          }
        } else {
          await api.unassignTeamFromRoute(route.name, team.name, eventId)
          this.assignments.teams[route.name] = (
            this.assignments.teams[route.name] || []
          ).filter((t) => t.name !== team.name)
        }
      } catch (e) {
        console.error('Failed to toggle team assignment', e)
      } finally {
        const next = new Set(this.togglingTeams)
        next.delete(key)
        this.togglingTeams = next
      }
    },

    async toggleStation(route: Route, station: Station, assign: boolean) {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      const key = `${route.name}:${station.name}`
      this.togglingStations = new Set([...this.togglingStations, key])
      try {
        if (assign) {
          await api.assignStationToRoute(route.name, station, eventId)
          if (!this.assignments.stations[route.name]) {
            this.assignments.stations[route.name] = []
          }
          if (
            !this.assignments.stations[route.name].find(
              (s) => s.name === station.name
            )
          ) {
            this.assignments.stations[route.name].push(station)
          }
        } else {
          await api.unassignStationFromRoute(route.name, station.name, eventId)
          this.assignments.stations[route.name] = (
            this.assignments.stations[route.name] || []
          ).filter((s) => s.name !== station.name)
        }
      } catch (e) {
        console.error('Failed to toggle station assignment', e)
      } finally {
        const next = new Set(this.togglingStations)
        next.delete(key)
        this.togglingStations = next
      }
    },

    openCreateDialog() {
      this.newRoute = model.route.makeEmpty()
      this.showCreateDialog = true
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
