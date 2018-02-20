<template>
  <center-col id="Dashboard">
    <small-station-dashboard-item
        v-for="(state, idx) in states"
        @scoreUpdated="onScoreUpdated"
        @saveClicked="onSaveClicked"
        @stateAdvanced="onStateAdvanced"
        :state="state"
        :key="'small' + idx"></small-station-dashboard-item>
    <v-snackbar :top="true" :timeout="2000" color="success" v-model="snackbar"> {{snacktext}} <v-btn flat @click="snackbar = false">Close</v-btn></v-snackbar>
  </center-col>
</template>

<script>
export default {
  name: 'station_dashboard',
  data () {
    return {
      snackbar: false,
      snacktext: ''
    }
  },
  computed: {
    states () {
      // We want a custom ordering. First, we want to see teams with "unknown"
      // state, then those which have "arrived", and finally the "finished"
      // teams.  As second sort criteria we use the internal ordering (as
      // stored in the db-column "order").
      const outputUnknown = []
      const outputArrived = []
      const outputFinished = []
      this.$store.state.dashboard.forEach(item => {
        switch (item.state) {
          case 'unknown':
            outputUnknown.push(item)
            break
          case 'arrived':
            outputArrived.push(item)
            break
          case 'finished':
            outputFinished.push(item)
            break
        }
      })
      return outputUnknown.concat(outputArrived).concat(outputFinished)
    }
  },
  created () {
    this.$store.dispatch('fetchDashboard', this.$route.params.stationName)
    this.$store.commit('changeTitle', 'Dashboard for ' + this.$route.params.stationName)
  },
  methods: {
    onStateAdvanced: function (state) {
      this.$store.dispatch('advanceState', {
        teamName: state.team,
        stationName: this.$route.params.stationName})
    },
    onScoreUpdated: function (state, newScore) {
      this.$store.dispatch('setStationScore', {
        teamName: state.team,
        stationName: this.$route.params.stationName,
        score: newScore})
      this.snacktext = 'Changes saved'
      this.snackbar = true
    },
    onSaveClicked: function (state) {
      this.snacktext = 'Changes saved'
      this.snackbar = true
    }
  }
}
</script>

<style scoped>
.bigrow {
  padding: 1em 0;
}
</style>
