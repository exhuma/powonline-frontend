<template>
  <v-container id="GlobalDashboard">
    <v-tabs v-model="activeTab" grow>
      <v-tab>Combined Dashboard</v-tab>
      <v-tab>Separate Dashboard</v-tab>
      <v-tab>Legacy Dashboard</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab" class="pa-5">
      <v-tab-item>
        <combined-dashboard :routes="routes()"></combined-dashboard>
      </v-tab-item>
      <v-tab-item>
        <route-dashboard
          v-for="route in routes()"
          :key="route.name"
          :route="route"
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
          v-for="route in routes()"
          :key="route.name"
          :route="route"
        ></route-dashboard-legacy>
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import RouteDashboardLegacy from '@/components/RouteDashboardLegacy.vue'
const AUTO_REFRESH_INTERVAL_SECONDS = 10
export default {
  name: 'global_dashboard',
  data() {
    return {
      refreshId: null,
      pctUntilNextRefresh: 100.0,
      activeTab: 0
    }
  },
  methods: {
    routes() {
      return this.$store.state.routes
    },
    refresh() {
      this.$store.dispatch('refreshGlobalDashboard')
      this.$store.dispatch('refreshRoutes')
      this.$store.dispatch('refreshTeams')
      this.$store.dispatch('fetchQuestionnaireScores')
    },
    autoRefreshTick() {
      let tickPercent = 100.0 / AUTO_REFRESH_INTERVAL_SECONDS
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
      this.refreshId = window.setInterval(this.autoRefreshTick, 1000)
    },
    stopAutoRefresh() {
      if (this.refreshId) {
        window.clearInterval(this.refreshId)
        this.$emit('refresh-progress-updated', { progress: 0.0 })
      }
    }
  },
  created() {
    this.$store.commit('changeTitle', 'Global Dashboard')
    this.refresh()
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  components: {
    'route-dashboard-legacy': RouteDashboardLegacy
  }
}
</script>
