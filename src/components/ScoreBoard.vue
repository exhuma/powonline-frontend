<template>
  <v-list id="Scoreboard">
    <v-list-tile v-for="row in leaderboard" :key="row.team">
      <v-list-tile-content>
        <v-container>
          <v-layout row>
            <v-flex xs1>{{ row[0] }}</v-flex>
            <v-flex xs9>{{ row[2] }}</v-flex>
            <v-flex xs2 text-xs-right>{{ row[1] }} points</v-flex>
          </v-layout>
        </v-container>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>
<script>
export default {
  name: 'Scoreboard',
  created () {
    this.$store.dispatch('fetchGlobalDashboard')
    this.$store.commit('changeTitle', 'Scoreboard')
  },
  computed: {
    leaderboard () {
      const teamScores = []
      this.$store.state.global_dashboard.forEach(function (item) {
        let score = item.stations.reduce(function (accu, current) {
          return accu + current.score
        }, 0)
        let position = 0
        teamScores.push([position, score, item.team])
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
  }
}
</script>
