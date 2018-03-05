<template>
  <center-col id="Dashboard">
    <small-station-dashboard-item
        v-for="(state, idx) in states"
        class="mb-4"
        @scoreUpdated="onScoreUpdated"
        @saveClicked="onSaveClicked"
        @stateAdvanced="onStateAdvanced"
        :state="state"
        :key="'small' + idx"></small-station-dashboard-item>
    <v-snackbar :top="true" :timeout="2000" :color="snackColor" v-model="snackbar"> {{snacktext}} <v-btn flat @click="snackbar = false">Close</v-btn></v-snackbar>
  </center-col>
</template>

<script>
export default {
  name: 'station_dashboard',
  data () {
    return {
      snackbar: false,
      snacktext: '',
      snackColor: 'success'
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
      this.$store.state.global_dashboard.forEach(teamInfo => {
        teamInfo.stations.forEach(stationState => {
          if (stationState.name !== this.$route.params.stationName) {
            return // skip states from other stations
          }
          if (stationState.state === 'unreachable') {
            // This team cannot reach the current sation (not assigned)
            return
          }
          let container = outputUnknown
          switch (stationState.state) {
            case 'unknown':
              container = outputUnknown
              break
            case 'arrived':
              container = outputArrived
              break
            case 'finished':
              container = outputFinished
              break
            default:
              console.error('Unknown state: ' + stationState.state)
          }
          container.push({
            team: teamInfo.team,
            state: stationState.state,
            score: stationState.score
          })
        })
      })
      return outputUnknown.concat(outputArrived).concat(outputFinished)
    }
  },
  created () {
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
        score: newScore}).then(evt => {
        this.snacktext = 'Changes saved'
        this.snackColor = 'success'
      }).catch(err => {
        this.snacktext = `Error: ${err.response.data}`
        this.snackColor = 'error'
      })
      this.snackbar = true
    },
    onSaveClicked: function (state) {
      this.snacktext = 'Changes saved'
      this.snackColor = 'success'
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
