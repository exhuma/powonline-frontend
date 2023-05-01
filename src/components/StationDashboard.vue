<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col cols="1" class="quick-stat-column left" v-ripple @click="goTo('previous')">
        <state-icon
          v-for="state in previousStates"
          :state="state.state"
          :key="`${state.team}-previous`"
        ></state-icon>
      </v-col>
      <v-col cols="10" md="4">
        <h1 style="text-align: center">{{ stationName }}</h1>
        <v-text-field
        v-model="teamFilter"
        append-icon="mdi-magnify"
        clearable
        label="Find a team by name/contact"
        @click:clear="onFilterCleared"
        hint="Filter list of teams by name and/or contact"
        ></v-text-field>

        <v-layout row>
          <v-flex xs-4>
            <v-checkbox class="ml-4" name="showFinished" label="Show finished teams" v-model="showFinished" />
          </v-flex>
        </v-layout>

        <small-station-dashboard-item
            v-for="(state, idx) in allTeams"
            class="mb-4"
            @scoreUpdated="onScoreUpdated"
            @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
            @saveClicked="onSaveClicked"
            @stateAdvanced="onStateAdvanced"
            v-if="selectedStates.includes(state.state)"
            :state="state"
            :key="'small' + idx"></small-station-dashboard-item>
        <v-snackbar :top="true" :timeout="2000" :color="snackColor" v-model="snackbar"> {{snacktext}} <v-btn text @click="snackbar = false">Close</v-btn></v-snackbar>
      </v-col>
      <v-col cols="1" class="quick-stat-column right" v-ripple @click="goTo('next')">
        <state-icon
          v-for="state in nextStates"
          :state="state.state"
          :key="`${state.team}-next`"
        ></state-icon>
      </v-col>
    </v-row>
  </v-container>
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
      teamFilter: '',
      showPending: true,
      showArrived: true,
      showFinished: false,
      previousStates: {},
      nextStates: {},
      previousStation: '',
      nextStation: ''
    }
  },
  computed: {
    selectedStates () {
      let output = []
      if (this.showPending) {
        output.push('unknown')
      }
      if (this.showArrived) {
        output.push('arrived')
      }
      if (this.showFinished) {
        output.push('finished')
      }
      return output
    },
    stationName() {
      return this.$route.params.stationName
    },
    allTeams () {
      const output = []
      this.$store.state.global_dashboard.forEach(teamInfo => {
        teamInfo.stations.forEach(stationState => {
          if (stationState.name !== this.stationName) {
            return // skip states from other stations
          }
          if (stationState.state === 'unreachable') {
            // This team cannot reach the current sation (not assigned)
            return
          }
          output.push({
            team: teamInfo.team,
            station: this.stationName,
            state: stationState.state,
            score: stationState.score
          })
        })
      })
      let filtered = this.filteredTeams(output)
      return filtered
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Dashboard for ' + this.stationName)
    this.$store.dispatch('fetchQuestionnaireScores')
    this.refresh()
  },
  methods: {
    goTo(relation) {
      switch (relation) {
        case 'previous':
          if (this.previousStation !== '') {
            this.$router.push(`/station/${this.previousStation}`)
            this.refresh();
          } else {
            console.warn(`No station "before" ${this.stationName}`);
          }
          break;
        case 'next':
          if (this.nextStation !== '') {
            this.$router.push(`/station/${this.nextStation}`)
            this.refresh();
          } else {
            console.warn(`No station "after" ${this.stationName}`);
          }
          break;
        default:
          throw new Error(`Unknown relation: ${relation}`)
      }
    },
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
        let teamData = this.$store.getters.findTeam(item.team)
        let contactMatches = teamData.contact.toLowerCase().includes(fltr)
        let nameMatches = item.team.toLowerCase().includes(fltr)
        return nameMatches || contactMatches
      })
      return filtered
    },
    onStateAdvanced: function (state) {
      this.$store.dispatch('advanceState', {
        teamName: state.team,
        stationName: this.stationName})
    },
    onScoreUpdated: function (state, newScore) {
      this.$store.dispatch('setStationScore', {
        teamName: state.team,
        stationName: this.stationName,
        score: newScore}).then(evt => {
      })
    },
    onQuestionnaireScoreUpdated: function (payload) {
      const data = {
        teamName: payload.team,
        stationName: this.stationName,
        score: payload.score
      }
      this.$store.dispatch('setQuestionnaireScore', data)
    },
    onSaveClicked: function (state) {
      this.snacktext = 'Changes saved'
      this.snackColor = 'success'
      this.snackbar = true
    },
    async refresh () {
      this.previousStates = []
      this.nextStates = []
      try {
        const previousStates = await this.$remoteProxy.fetchRelatedTeams(
          this.stationName,
          'previous'
        )
        this.previousStates = previousStates
      } catch (error) {
        console.error(
          `Unable to fetch 'previous' station states for ${this.stationName} (${error})`
        )
      }

      try {
        const nextStates = await this.$remoteProxy.fetchRelatedTeams(
          this.stationName,
          'next'
        )
        this.nextStates = nextStates
      } catch (error) {
        console.error(
          `Unable to fetch 'next' station states for ${this.stationName} (${error})`
        )
      }

      try {
        this.previousStation = await this.$remoteProxy.fetchRelatedStation(
          this.stationName,
          'previous'
        )
      } catch (error) {
        console.error(
          `Unable to fetch 'previous' station for ${this.stationName} (${error})`
        )
      }

      try {
        this.nextStation = await this.$remoteProxy.fetchRelatedStation(
          this.stationName,
          'next'
        )
      } catch (error) {
        console.error(
          `Unable to fetch 'next' station for ${this.stationName} (${error})`
        )
      }
    }
  }
}
</script>

<style scoped>
.quick-stat-column {
  padding: 0;
  padding-top: 1em;
  background-color: #151515;
  display: flex;
  flex-direction: column;
  justify-items: center;
  cursor: pointer;
}
.quick-stat-column:hover {
  background-color: #181818;
}
.quick-stat-column.left {
  border-right: 1px solid #272727;
}
.quick-stat-column.right {
  border-left: 1px solid #272727;
}

.bigrow {
  padding: 1em 0;
}
</style>
