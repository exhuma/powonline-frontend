<template>
  <div id="Dashboard">
    <v-card v-for="(state, idx) in states" class="mb-2" :key="idx">
      <v-card-title>
        <span>{{ state.team }}</span>
      </v-card-title>
      <v-card-text v-ripple>
        <div
          class="clickable"
          @click="advanceState(state)">
          <state-icon
            :state="state.state"></state-icon> <span>{{ state.state }}</span>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'station_dashboard',
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
    advanceState: function (state) {
      this.$store.dispatch('advanceState', {
        teamName: state['team'],
        stationName: this.$route.params.stationName})
    }
  }
}
</script>
