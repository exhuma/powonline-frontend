<template>
  <div id="RouteList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <RouteTable
            v-if="!$vuetify.display.smAndDown"
            :routes="sortedRoutes"
            :all-teams="allTeams"
            :all-stations="allStations"
            :assignments="assignments"
            :toggling-teams="togglingTeams"
            :toggling-stations="togglingStations"
            :loading="loading"
            :can-edit="hasRole(['admin'])"
            @open-create="openCreateDialog"
            @open-delete="confirmDelete"
            @toggle-team="toggleTeam"
            @toggle-station="toggleStation"
            @set-color="setRouteColor"
          />
          <RouteCards
            v-else
            :routes="sortedRoutes"
            :all-teams="allTeams"
            :all-stations="allStations"
            :assignments="assignments"
            :toggling-teams="togglingTeams"
            :toggling-stations="togglingStations"
            :loading="loading"
            :can-edit="hasRole(['admin'])"
            @open-create="openCreateDialog"
            @open-delete="confirmDelete"
            @toggle-team="toggleTeam"
            @toggle-station="toggleStation"
            @set-color="setRouteColor"
          />
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
import RouteTable from '@/components/management/desktop/RouteTable.vue'
import RouteCards from '@/components/management/mobile/RouteCards.vue'

export default defineComponent({
  name: 'RouteList',
  components: { RouteTable, RouteCards },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      routes: [] as Route[],
      allTeams: [] as Team[],
      allStations: [] as Station[],
      assignments: { teams: {}, stations: {} } as AssignmentMap,
      togglingTeams: new Set<string>(),
      togglingStations: new Set<string>(),
      showCreateDialog: false,
      showDeleteDialog: false,
      newRoute: model.route.makeEmpty() as any,
      deletingRoute: null as Route | null
    }
  },

  computed: {
    sortedRoutes(): Route[] {
      return this.routes
        .slice()
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
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

    async toggleTeam(route: Route, team: Team, assign: boolean) {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      const key = `${route.name}:${team.name}`
      this.togglingTeams = new Set([...this.togglingTeams, key])
      try {
        if (assign) {
          await api.addTeamToRoute(route.name, team, eventId)
          if (!this.assignments.teams[route.name])
            this.assignments.teams[route.name] = []
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
          if (!this.assignments.stations[route.name])
            this.assignments.stations[route.name] = []
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
