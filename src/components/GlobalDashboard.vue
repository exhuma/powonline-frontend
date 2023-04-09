<template>
  <v-container id="GlobalDashboard">
    <combined-dashboard :routes="routes"></combined-dashboard>
  </v-container>
</template>

<script>
export default {
  name: 'global_dashboard',
  computed: {
    routes () {
      return this.$store.state.routes
    }
  },
  created () {
    this.$store.dispatch('refreshGlobalDashboard')
    this.$store.dispatch('fetchQuestionnaireScores')
    this.$store.commit('changeTitle', 'Global Dashboard')
  }
}
</script>
