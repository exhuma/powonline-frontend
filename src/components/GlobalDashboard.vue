<template>
  <v-container id="GlobalDashboard">
    <combined-dashboard :routes="routes()"></combined-dashboard>
  </v-container>
</template>

<script>
const AUTO_REFRESH_INTERVAL_SECONDS = 10
export default {
  name: 'global_dashboard',
  data () {
    return {
      refreshId: null,
      pctUntilNextRefresh: 100.0
    }
  },
  methods: {
    routes () {
      return this.$store.state.routes
    },
    refresh () {
      this.$store.dispatch('refreshGlobalDashboard')
      this.$store.dispatch('refreshRoutes')
      this.$store.dispatch('refreshTeams')
      this.$store.dispatch('fetchQuestionnaireScores')
    },
    autoRefreshTick () {
      let tickPercent = 100.0 / AUTO_REFRESH_INTERVAL_SECONDS
      this.pctUntilNextRefresh -= tickPercent
      this.$emit('refresh-progress-updated', {progress: this.pctUntilNextRefresh})
      if (this.pctUntilNextRefresh <= 0) {
        this.refresh()
        this.pctUntilNextRefresh = 100.0
      }
    },
    startAutoRefresh () {
      this.refreshId = window.setInterval(this.autoRefreshTick, 1000)
    },
    stopAutoRefresh () {
      if (this.refreshId) {
        window.clearInterval(this.refreshId)
        this.$emit('refresh-progress-updated', {progress: 0.0})
      }
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Global Dashboard')
    this.refresh()
    this.startAutoRefresh()
  },
  beforeDestroy () {
    this.stopAutoRefresh()
  }
}
</script>
