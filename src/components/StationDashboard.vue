<template>
  <center-col id="Dashboard">

    <v-text-field
      v-model="teamFilter"
      append-icon="search"
      clearable
      label="Filter"
      @click:clear="onFilterCleared"
      hint="Filter list of teams by name and/or contact"
      ></v-text-field>

    <v-tabs
      v-model="activeTab">

      <v-tabs-bar>
        <v-tabs-item href="#pending" key="pending" ripple>Pending</v-tabs-item>
        <v-tabs-item href="#arrived" key="arrived" ripple>Arrived</v-tabs-item>
        <v-tabs-item href="#finished" key="finished" ripple>Finished</v-tabs-item>
        <v-tabs-slider color="accent" />
      </v-tabs-bar>

      <v-tabs-items>
        <v-tabs-content key="pending" id="pending">
        <small-station-dashboard-item
            v-for="(state, idx) in pendingTeams"
            class="mb-4"
            @scoreUpdated="onScoreUpdated"
            @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
            @saveClicked="onSaveClicked"
            @stateAdvanced="onStateAdvanced"
            :state="state"
            :key="'small' + idx"></small-station-dashboard-item>
        </v-tabs-content>
        <v-tabs-content key="arrived" id="arrived">
        <small-station-dashboard-item
            v-for="(state, idx) in arrivedTeams"
            class="mb-4"
            @scoreUpdated="onScoreUpdated"
            @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
            @saveClicked="onSaveClicked"
            @stateAdvanced="onStateAdvanced"
            :state="state"
            :key="'small' + idx"></small-station-dashboard-item>
        </v-tabs-content>
        <v-tabs-content key="finished" id="finished">
        <small-station-dashboard-item
            v-for="(state, idx) in finishedTeams"
            class="mb-4"
            @scoreUpdated="onScoreUpdated"
            @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
            @saveClicked="onSaveClicked"
            @stateAdvanced="onStateAdvanced"
            :state="state"
            :key="'small' + idx"></small-station-dashboard-item>
        </v-tabs-content>
      </v-tabs-items>

    </v-tabs>

    <v-snackbar :top="true" :timeout="2000" :color="snackColor" v-model="snackbar"> {{snacktext}} <v-btn flat @click="snackbar = false">Close</v-btn></v-snackbar>
  </center-col>
</template>

<script>
export default {
  name: 'station_dashboard',
  data () {
    return {
      activeTab: 'pending',
      snackbar: false,
      snacktext: '',
      snackColor: 'success',
      teamFilter: ''
    }
  },
  computed: {
    pendingTeams () {
      return this.limitedStates('unknown')
    },
    arrivedTeams () {
      return this.limitedStates('arrived')
    },
    finishedTeams () {
      return this.limitedStates('finished')
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Dashboard for ' + this.$route.params.stationName)
    this.$store.dispatch('fetchQuestionnaireScores')
  },
  methods: {
    onFilterCleared (e) {
      this.teamFilter = ''
    },
    filteredTeams: function (teams) {
      let all = teams
      if (!this.teamFilter || this.teamFilter.length < 3) {
        return all
      }
      let filtered = all.filter((item) => {
        let fltr = this.teamFilter.toLowerCase()
        let nameMatches = item.team.toLowerCase().includes(fltr)
        return nameMatches
      })
      return filtered
    },
    limitedStates: function (state) {
      const output = []
      this.$store.state.global_dashboard.forEach(teamInfo => {
        teamInfo.stations.forEach(stationState => {
          if (stationState.name !== this.$route.params.stationName) {
            return // skip states from other stations
          }
          if (stationState.state === 'unreachable') {
            // This team cannot reach the current sation (not assigned)
            return
          }
          if (stationState.state !== state) {
            return // We skip everything that is not of the selected tate in this window
          }
          output.push({
            team: teamInfo.team,
            station: this.$route.params.stationName,
            state: stationState.state,
            score: stationState.score
          })
        })
      })
      let filtered = this.filteredTeams(output)
      return filtered
    },
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
        this.snackColor = 'error'
        if (!err.response) {
          this.snacktext = `Error: ${err.message}`
        } else {
          this.snacktext = `Error: ${err.response.data}`
        }
      })
      this.snackbar = true
    },
    onQuestionnaireScoreUpdated: function (payload) {
      const data = {
        teamName: payload.team,
        stationName: this.$route.params.stationName,
        score: payload.score
      }
      this.$store.dispatch('setQuestionnaireScore', data).then(evt => {
        this.snacktext = 'Changes saved'
        this.snackColor = 'success'
      }).catch(err => {
        this.snackColor = 'error'
        if (!err.response) {
          this.snacktext = `Error: ${err.message}`
        } else {
          this.snacktext = `Error: ${err.response.data}`
        }
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
