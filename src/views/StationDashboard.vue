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
          v-for="state in previousStates"
          :state="state.state"
          :class="state.ageClass"
          :key="`${state.team}-previous`"
        ></state-icon>
      </v-col>
      <v-col cols="10" md="4" class="pa-0">
        <div class="related-stations">
          <div class="left" v-ripple @click="goTo('previous')">
            {{ previousStation }}
          </div>
          <h2 class="stationName">{{ stationName }}</h2>
          <div class="right" v-ripple @click="goTo('next')">
            {{ nextStation }}
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
          v-for="(state, idx) in filteredAllTeams"
          class="mb-4 ml-5 mr-5"
          @scoreUpdated="onScoreUpdated"
          @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
          @saveClicked="onSaveClicked"
          @stateAdvanced="onStateAdvanced"
          :state="state"
          :teams="teams"
          :questionnaire-scores="questionnaireScores"
          :key="'small' + idx"
        ></small-station-dashboard-item>
        <v-snackbar
          :top="true"
          :timeout="2000"
          :color="snackColor"
          v-model="snackbar"
        >
          {{ snacktext }}
          <v-btn text @click="snackbar = false">Close</v-btn>
        </v-snackbar>
      </v-col>
      <v-col
        cols="1"
        class="quick-stat-column right"
        v-ripple
        @click="goTo('next')"
      >
        <state-icon
          v-for="state in nextStates"
          :class="state.ageClass"
          :state="state.state"
          :key="`${state.team}-next`"
        ></state-icon>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { Team } from '@/remote/model/team'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'
import type { RelatedTeamEntry } from '@/api'

type RelatedTeamEntryWithAge = RelatedTeamEntry & {
  ageClass?: Record<string, boolean>
}

function applyAgeClasses(data: RelatedTeamEntryWithAge[]) {
  const ancient = 2 * 60 * 60
  const old = 1 * 60 * 60
  data.forEach((item) => {
    if (!item.updateAge || item.updateAge > ancient) {
      ;(item as any).ageClass = { ancient: true }
    } else if (item.updateAge > old) {
      ;(item as any).ageClass = { old: true }
    } else {
      ;(item as any).ageClass = { recent: true }
    }
  })
}

const StationDashboard = Vue.extend({
  name: 'station_dashboard',
  inject: ['getSelectedEventId'],

  data() {
    return {
      snackbar: false,
      snacktext: '',
      snackColor: 'success',
      teamFilter: '',
      showPending: true,
      showArrived: true,
      showFinished: false,
      previousStates: [] as RelatedTeamEntryWithAge[],
      nextStates: [] as RelatedTeamEntryWithAge[],
      previousStation: '' as string,
      nextStation: '' as string,
      dashboard: [] as DashboardRow[],
      teams: [] as Team[],
      questionnaireScores: {} as QuestionnaireScores
    }
  },

  computed: {
    stationName(): string {
      return this.$route.params.stationName
    },
    selectedStates(): string[] {
      const output: string[] = []
      if (this.showPending) output.push('unknown')
      if (this.showArrived) output.push('arrived')
      if (this.showFinished) output.push('finished')
      return output
    },
    allTeams(): unknown[] {
      const output: any[] = []
      this.dashboard.forEach((teamInfo) => {
        teamInfo.stations.forEach((stationState) => {
          if (stationState.name !== this.stationName) return
          if (stationState.state === 'unreachable') return
          output.push({
            team: teamInfo.team,
            station: this.stationName,
            state: stationState.state,
            score: stationState.score
          })
        })
      })
      return output
    },
    filteredAllTeams(): unknown[] {
      const all = this.allTeams.filter((item: any) =>
        this.selectedStates.includes(item.state)
      )
      if (!this.teamFilter || this.teamFilter.length < 3) {
        return all
      }
      const fltr = this.teamFilter.toLowerCase()
      return all.filter((item: any) => {
        const teamDetails = this.teams.find((t) => t.name === item.team)
        const contactMatches = teamDetails
          ? (teamDetails.contact || '').toLowerCase().includes(fltr)
          : false
        const nameMatches = item.team.toLowerCase().includes(fltr)
        return nameMatches || contactMatches
      })
    }
  },

  async created() {
    await this.refresh()
  },

  watch: {
    '$route.params.stationName'() {
      this.refresh()
    }
  },

  methods: {
    onFilterCleared() {
      this.teamFilter = ''
    },
    goTo(relation: string) {
      const target =
        relation === 'previous' ? this.previousStation : this.nextStation
      if (target) {
        // @ts-expect-error inject
        const eventId = this.getSelectedEventId()
        this.$router.push(`/event/${eventId}/station/${target}`)
      } else {
        console.warn(`No station "${relation}" of ${this.stationName}`)
      }
    },
    async onStateAdvanced(state: any) {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      try {
        await api.advanceState(this.stationName, state.team, eventId)
        await this.fetchDashboard()
      } catch (err) {
        console.error('Failed to advance state', err)
      }
    },
    async onScoreUpdated(state: any, newScore: string) {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      try {
        await api.setStationScore(
          this.stationName,
          state.team,
          parseFloat(newScore),
          eventId
        )
      } catch (err) {
        console.error('Failed to set station score', err)
      }
    },
    async onQuestionnaireScoreUpdated(payload: {
      team: string
      score: string
    }) {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      try {
        await api.setQuestionnaireScore(
          this.stationName,
          payload.team,
          parseFloat(payload.score),
          eventId
        )
        // Refresh questionnaire scores locally
        this.questionnaireScores = await api.fetchQuestionnaireScores(eventId)
      } catch (err) {
        console.error('Failed to set questionnaire score', err)
      }
    },
    onSaveClicked() {
      this.snacktext = 'Changes saved'
      this.snackColor = 'success'
      this.snackbar = true
    },
    async fetchDashboard() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      this.dashboard = await api.fetchDashboard(eventId)
    },
    async refresh() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      this.previousStates = []
      this.nextStates = []
      this.previousStation = ''
      this.nextStation = ''

      await this.fetchDashboard()

      const [teams, questionnaireScores] = await Promise.all([
        api.fetchTeams(eventId).catch((e) => {
          console.error('Failed to fetch teams', e)
          return []
        }),
        api.fetchQuestionnaireScores(eventId).catch((e) => {
          console.error('Failed to fetch questionnaire scores', e)
          return {}
        })
      ])
      this.teams = teams as Team[]
      this.questionnaireScores = questionnaireScores as QuestionnaireScores

      try {
        const prevStates = (await api.fetchRelatedTeams(
          this.stationName,
          'previous',
          eventId
        )) as RelatedTeamEntryWithAge[]
        applyAgeClasses(prevStates)
        this.previousStates = prevStates
      } catch (e) {
        console.error(`Unable to fetch 'previous' station states (${e})`)
      }

      try {
        const nextStates = (await api.fetchRelatedTeams(
          this.stationName,
          'next',
          eventId
        )) as RelatedTeamEntryWithAge[]
        applyAgeClasses(nextStates)
        this.nextStates = nextStates
      } catch (e) {
        console.error(`Unable to fetch 'next' station states (${e})`)
      }

      try {
        this.previousStation = await api.fetchRelatedStation(
          this.stationName,
          'previous',
          eventId
        )
      } catch (e) {
        console.error(`Unable to fetch 'previous' station (${e})`)
      }

      try {
        this.nextStation = await api.fetchRelatedStation(
          this.stationName,
          'next',
          eventId
        )
      } catch (e) {
        console.error(`Unable to fetch 'next' station (${e})`)
      }
    }
  }
})
export default StationDashboard
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
