<template>
  <v-container id="GlobalDashboard">
    <v-tabs v-model="activeTab" grow>
      <v-tab>Combined Dashboard</v-tab>
      <v-tab>Separate Dashboard</v-tab>
      <v-tab>Legacy Dashboard</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab" class="pa-5">
      <v-tab-item>
        <combined-dashboard
          :routes="routes"
          :teams="teams"
          :global-dashboard="globalDashboard"
        ></combined-dashboard>
      </v-tab-item>
      <v-tab-item>
        <route-dashboard
          v-for="route in routes"
          :key="route.name"
          :route="route"
          :global-dashboard="globalDashboard"
          :route-teams="routeTeams"
          :route-stations="routeStations"
          :teams="teams"
        ></route-dashboard>
      </v-tab-item>
      <v-tab-item>
        <div class="grey--text text-right">
          <strong class="mr-3">Legend:</strong>
          <state-icon state="unknown"></state-icon>
          Not arrived yet
          <state-icon state="arrived"></state-icon>
          Arrived/Playing
          <state-icon state="finished"></state-icon>
          Finished
        </div>
        <route-dashboard-legacy
          v-for="route in routes"
          :key="route.name"
          :route="route"
          :global-dashboard="globalDashboard"
          :route-teams="routeTeams"
          :route-stations="routeStations"
          :teams="teams"
        ></route-dashboard-legacy>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script lang="ts">
import RouteDashboardLegacy from '@/components/RouteDashboardLegacy.vue'
import RouteDashboard from '@/components/RouteDashboard.vue'
import CombinedDashboard from '@/components/CombinedDashboard.vue'
import Vue from 'vue'
import { api } from '@/main'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { DashboardRow } from '@/remote/model/dashboardRow'

const AUTO_REFRESH_INTERVAL_SECONDS =
  Number((import.meta as any).env?.VITE_DASHBOARD_REFRESH) || 0

export default Vue.extend({
  name: 'GlobalDashboard',
  components: {
    'route-dashboard-legacy': RouteDashboardLegacy,
    'route-dashboard': RouteDashboard,
    'combined-dashboard': CombinedDashboard
  },
  inject: ['getSelectedEventId'],
  data() {
    return {
      refreshId: null as number | null,
      pctUntilNextRefresh: 100.0,
      activeTab: 0,
      routes: [] as Route[],
      teams: [] as Team[],
      globalDashboard: [] as DashboardRow[],
      // teams per route: { [routeName]: Team[] }
      routeTeams: {} as { [routeName: string]: Team[] },
      // stations per route: { [routeName]: Station[] }
      routeStations: {} as { [routeName: string]: Station[] }
    }
  },
  created() {
    this.refresh()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    async refresh() {
      // @ts-expect-error inject
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        const [routes, teams, dashboard, assignments] = await Promise.all([
          api.fetchRoutes(eventId),
          api.fetchTeams(eventId),
          api.fetchDashboard(eventId),
          api.fetchAssignments(eventId)
        ])
        this.routes = routes
        this.teams = teams
        this.globalDashboard = dashboard
        this.routeTeams = assignments.teams || {}
        this.routeStations = assignments.stations || {}
      } catch (e) {
        console.error('Unable to refresh global dashboard data', e)
      }
    },
    autoRefreshTick() {
      const tickPercent = 100.0 / AUTO_REFRESH_INTERVAL_SECONDS
      this.pctUntilNextRefresh -= tickPercent
      this.$emit('refresh-progress-updated', {
        progress: this.pctUntilNextRefresh
      })
      if (this.pctUntilNextRefresh <= 0) {
        this.refresh()
        this.pctUntilNextRefresh = 100.0
      }
    },
    startAutoRefresh() {
      if (AUTO_REFRESH_INTERVAL_SECONDS > 0) {
        this.refreshId = window.setInterval(this.autoRefreshTick, 1000)
      }
    },
    stopAutoRefresh() {
      if (this.refreshId !== null) {
        window.clearInterval(this.refreshId)
        this.$emit('refresh-progress-updated', { progress: 0.0 })
      }
    }
  }
})
</script>
