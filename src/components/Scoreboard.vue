<template>
  <CenterCol>
    <v-list
      dense
      nav
      id="Scoreboard"
      >
      <v-list-item
        v-for="row in leaderboard"
        :key="row.team"
        >
        <v-list-item-content>
          <v-layout row :class="row[3]">
            <v-flex xs1>{{ row[0] }}</v-flex>
            <v-flex xs9>{{ row[2] }}</v-flex>
            <v-flex xs2 text-xs-right>{{ row[1] }} points</v-flex>
          </v-layout>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </CenterCol>
</template>

<style scoped>
  .cancelled {
    text-decoration: line-through;
    color: #888;
  }
</style>

<script>
import CenterCol from '@/components/CenterCol';

export default {
  name: 'Scoreboard',
  data () {
    return {
      intervalId: null
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Scoreboard')
    this.refresh()
    this.intervalId = setInterval(() => {
      this.refresh()
    }, 15000)
  },
  methods: {
    refresh () {
      this.$store.dispatch('refreshGlobalDashboard')
      this.$store.dispatch('fetchQuestionnaireScores')
    }
  },
  beforeDestroy () {
    clearInterval(this.intervalId)
  },
  computed: {
    leaderboard () {
      const teamQuestScores = {}
      const teamScores = []
      const qScores = this.$store.state.questionnaireScores
      const that = this
      for (var teamName in qScores) {
        if (qScores.hasOwnProperty(teamName)) {
          const questData = qScores[teamName]
          for (var stationName in questData) {
            if (questData.hasOwnProperty(stationName)) {
              teamQuestScores[teamName] = teamQuestScores[teamName] || 0
              teamQuestScores[teamName] += questData[stationName].score
            }
          }
        }
      }
      this.$store.state.global_dashboard.forEach(function (item) {
        let score = item.stations.reduce(function (accu, current) {
          return accu + current.score
        }, 0)
        let position = 0
        let tmp = teamQuestScores[item.team] || 0
        let teamData = that.$store.getters.findTeam(item.team)
        let cancelled = (teamData.cancelled ? 'cancelled' : '')
        teamScores.push([position, score + tmp, item.team, cancelled])
      })
      teamScores.sort(function (a, b) { return b[1] - a[1] })
      let effectivePosition = 0
      let realPosition = 0
      let lastScore = 0
      teamScores.forEach(function (item) {
        realPosition += 1
        if (lastScore !== item[1]) {
          effectivePosition = realPosition
        }
        item[0] = effectivePosition
        lastScore = item[1]
      })
      return teamScores
    }
  },
  components: {
    CenterCol
  }
}
</script>
