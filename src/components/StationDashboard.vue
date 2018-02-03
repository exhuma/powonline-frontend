<template>
  <div id="Dashboard">
    <v-card v-for="(state, idx) in states" class="mb-2" :key="idx">
      <v-card-title>
        <span>{{ state.team }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-layout row wrap class="bigrow">
            <v-flex xs2 class="clickable" @click="advanceState(state)" elevation-1>
              <v-container v-ripple fill-height>
                <v-layout row align-center>
                  <v-flex xs6>
                    <state-icon :state="state.state"></state-icon>
                  </v-flex>
                  <v-flex xs6>
                    <span>{{ state.state }}</span>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-flex>
            <v-flex xs10>
              <v-container>
                <v-layout row align-center>
                  <v-flex xs2>
                    Score:
                  </v-flex>
                  <v-flex xs8 text-xs-left>
                    <input :value="state.score" type="number" @change="updateScore" :data-team="state.team" placeholder="score" />
                  </v-flex>
                  <v-flex xs2>
                    <v-btn @click="saveChanges" success><v-icon>save</v-icon></v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
    </v-card>
    <v-snackbar top="true" timeout="2000" color="success" v-model="snackbar"> {{snacktext}} <v-btn flat @click="snackbar = false">Close</v-btn></v-snackbar>
  </div>
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
    advanceState: function (state) {
      this.$store.dispatch('advanceState', {
        teamName: state['team'],
        stationName: this.$route.params.stationName})
    },
    updateScore: function (event) {
      const teamName = event.target.getAttribute('data-team')
      this.$store.dispatch('setStationScore', {
        teamName: teamName,
        stationName: this.$route.params.stationName,
        score: event.target.value})
      this.snacktext = 'Changes saved'
      this.snackbar = true
    },
    saveChanges: function (state) {
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
