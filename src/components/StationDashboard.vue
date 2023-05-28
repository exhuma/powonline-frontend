<template>
  <v-container class="pa-0">
    <v-row justify="center">
      <v-col
        cols="1"
        class="quick-stat-column left"
        v-ripple
        @click="goTo('previous')"
      >
        <state-icon
          v-for="state in dashboard.peekLeft.states"
          :state="state.state"
          :class="state.ageClass"
          :key="`${state.team}-previous`"
        ></state-icon>
      </v-col>
      <v-col cols="10" md="4" class="pa-0">
        <div class="related-stations">
          <div class="left" v-ripple @click="goTo('previous')">
            {{ dashboard.peekLeft.stationName }}
          </div>
          <h2 class="stationName">{{ stationName }}</h2>
          <div class="right" v-ripple @click="goTo('next')">
            {{ dashboard.peekRight.stationName }}
          </div>
        </div>
        <v-text-field
          v-model="teamFilter"
          append-icon="mdi-magnify"
          clearable
          label="Find a team by name/contact"
          @click:clear="onFilterCleared"
          hint="Filter list of teams by name and/or contact"
          class="ml-5 mr-5"
        ></v-text-field>

        <v-layout row class="pl-5 pr-5">
          <v-flex xs-4>
            <v-checkbox
              class="ml-4"
              name="showFinished"
              label="Show finished teams"
              v-model="showFinished"
            />
          </v-flex>
        </v-layout>

        <small-station-dashboard-item
          v-for="(state, idx) in filteredTeams()"
          class="mb-4 ml-5 mr-5"
          @scoreUpdated="onScoreUpdated"
          @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
          @saveClicked="onSaveClicked"
          @stateAdvanced="onStateAdvanced"
          :state="state"
          :key="'small' + idx"
        ></small-station-dashboard-item>
        <v-snackbar
          :top="true"
          :timeout="2000"
          :color="snackColor"
          v-model="snackbar"
        >
          {{ snacktext }}
          <v-btn text @click="snackbar = false">Close</v-btn></v-snackbar
        >
      </v-col>
      <v-col
        cols="1"
        class="quick-stat-column right"
        v-ripple
        @click="goTo('next')"
      >
        <state-icon
          v-for="state in dashboard.peekRight.states"
          :class="state.ageClass"
          :state="state.state"
          :key="`${state.team}-next`"
        ></state-icon>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { StationDashboard } from '@/core/stationDashboard'
export default {
  name: 'station_dashboard',
  data() {
    return {
      snackbar: false,
      snacktext: '',
      snackColor: 'success',
      teamFilter: '',
      showPending: true,
      showArrived: true,
      showFinished: false,
      dashboard: new StationDashboard()
    }
  },
  computed: {
    selectedStates() {
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
    }
  },
  created() {
    // XXX this.$store.dispatch('fetchQuestionnaireScores')
    this.refresh()
  },
  methods: {
    goTo(relation) {
      switch (relation) {
        case 'previous':
          if (this.dashboard.peekLeft) {
            this.$router.push(`/station/${this.dashboard.peekLeft.stationName}`)
            this.refresh()
          } else {
            console.warn(`No station "before" ${this.stationName}`)
          }
          break
        case 'next':
          if (this.dashboard.peekRight) {
            this.$router.push(
              `/station/${this.dashboard.peekRight.stationName}`
            )
            this.refresh()
          } else {
            console.warn(`No station "after" ${this.stationName}`)
          }
          break
        default:
          throw new Error(`Unknown relation: ${relation}`)
      }
    },
    onFilterCleared(e) {
      this.teamFilter = ''
    },
    filteredTeams: function () {
      const all = this.dashboard.visibleStates(this.selectedStates)
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
    onStateAdvanced: async function (state) {
      const newState = await this.$store.dispatch('advanceState', {
        teamName: state.team,
        stationName: this.stationName
      })
      // TODO: This is a workaround (see method docstring)
      this.dashboard.recordNewState(newState)
    },
    onScoreUpdated: async function (state, newScore) {
      const newScoreResult = await this.$store.dispatch('setStationScore', {
        teamName: state.team,
        stationName: this.stationName,
        score: newScore
      })
      // TODO: This is a workaround (see method docstring)
      this.dashboard.recordNewScore({
        team: state.team,
        station: state.station,
        new_score: newScoreResult.new_score
      })
    },
    onQuestionnaireScoreUpdated: async function (payload) {
      const data = {
        teamName: payload.team,
        stationName: this.stationName,
        score: payload.score
      }
      const newScore = await this.$store.dispatch('setQuestionnaireScore', data)
      // TODO: This is a workaround (see method docstring)
      this.dashboard.recordNewQuestionnaireScore(newScore)
    },
    onSaveClicked: function (state) {
      this.snacktext = 'Changes saved'
      this.snackColor = 'success'
      this.snackbar = true
    },
    async refresh() {
      const dashboard = await StationDashboard.load(
        this.$remoteProxy,
        this.$route.params.stationName
      )
      this.dashboard = dashboard
    }
  }
}
</script>

<style scoped>
.stationName {
  text-align: center;
  color: #c0c0c0;
}

.related-stations {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  position: relative;
  top: 0;
  left: 0;
}

.related-stations > DIV {
  display: flex;
  align-items: center;
  border-top: 1px solid #272727;
  border-bottom: 1px solid #272727;
  color: #c0c0c0;
  font-size: 80%;
  font-weight: bold;
  background-color: #151515;
}
.related-stations > DIV.left {
  padding-right: 1.5em;
  padding-left: 0.7em;
  border-right: 1px solid #272727;
}
.related-stations > DIV.right {
  padding-left: 1.5em;
  padding-right: 0.7em;
  border-left: 1px solid #272727;
}

.quick-stat-column {
  padding: 0;
  padding-top: 1em;
  background-color: #151515;
  display: flex;
  flex-direction: column;
  justify-items: center;
}
.quick-stat-column:hover,
.related-stations:hover > DIV {
  background-color: #181818;
  cursor: pointer;
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

.old {
  opacity: 0.7;
}

.ancient {
  opacity: 0.3;
}
.recent {
  opacity: 1;
}
</style>
