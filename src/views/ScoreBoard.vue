<template>
  <center-col>
    <v-list id="Scoreboard">
      <v-list-item v-for="row in leaderboard" :key="row[2]">
        <v-list-item-content>
          <v-container>
            <v-row :class="row[3]">
              <v-col cols="1">{{ row[0] }}</v-col>
              <v-col cols="8">{{ row[2] }}</v-col>
              <v-col cols="3" class="text-right">{{ row[1] }} points</v-col>
            </v-row>
          </v-container>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </center-col>
</template>

<style scoped>
.cancelled {
  text-decoration: line-through;
  color: #888;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { Team } from '@/remote/model/team'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'

export default defineComponent({
  name: 'Scoreboard',
  inject: ['getSelectedEventId'],
  data() {
    return {
      intervalId: null as number | null,
      globalDashboard: [] as DashboardRow[],
      questionnaireScores: {} as QuestionnaireScores,
      teams: [] as Team[]
    }
  },
  created() {
    this.refresh()
    this.intervalId = window.setInterval(() => {
      this.refresh()
    }, 15000)
  },
  beforeUnmount() {
    if (this.intervalId !== null) clearInterval(this.intervalId)
  },
  methods: {
    async refresh() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        const [dashboard, qScores, teams] = await Promise.all([
          api.fetchDashboard(eventId),
          api.fetchQuestionnaireScores(eventId),
          api.fetchTeams(eventId)
        ])
        this.globalDashboard = dashboard
        this.questionnaireScores = qScores
        this.teams = teams
      } catch (e) {
        console.error('Unable to refresh scoreboard data', e)
      }
    }
  },
  computed: {
    leaderboard(): [number, number, string, string][] {
      const teamQuestScores: { [key: string]: number } = {}
      const teamScores: [number, number, string, string][] = []
      const qScores = this.questionnaireScores
      for (const teamName in qScores) {
        if (Object.prototype.hasOwnProperty.call(qScores, teamName)) {
          const questData = qScores[teamName]
          for (const stationName in questData) {
            if (Object.prototype.hasOwnProperty.call(questData, stationName)) {
              teamQuestScores[teamName] = teamQuestScores[teamName] || 0
              teamQuestScores[teamName] += questData[stationName].score
            }
          }
        }
      }
      this.globalDashboard.forEach((item) => {
        const score = item.stations.reduce((accu, current) => {
          return accu + current.score
        }, 0)
        const tmp = teamQuestScores[item.team] || 0
        const teamData = this.teams.find((t) => t.name === item.team)
        const cancelled = teamData && teamData.cancelled ? 'cancelled' : ''
        teamScores.push([0, score + tmp, item.team, cancelled])
      })
      teamScores.sort((a, b) => b[1] - a[1])
      let effectivePosition = 0
      let realPosition = 0
      let lastScore = 0
      teamScores.forEach((item) => {
        realPosition += 1
        if (lastScore !== item[1]) {
          effectivePosition = realPosition
        }
        item[0] = effectivePosition
        lastScore = item[1]
      })
      return teamScores
    }
  }
})
</script>
