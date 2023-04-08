<template>

  <div>
    <h1 class="white--text">{{ route.name }}</h1>
    <v-container>
      <v-layout row v-for="row in progressItems" :key="row.team">
        <v-flex xs2 class="white--text mr-3">
          {{ row.team }} {{ row.cancelled }}
        </v-flex>
        <v-flex xs10>
          <v-progress-linear
            :value="row.pct_finished"
            :buffer-value="row.pct_finished + row.pct_waiting"
          ></v-progress-linear>
        </v-flex>
      </v-layout>
    </v-container>
  </div>

</template>

<style scoped>
  .cancelled {
    text-decoration: line-through;
    color: #888;
  }
</style>

<script>
export default {
  name: 'route-dashboard',
  props: {
    'route': {
      type: Object,
      default: null
    }
  },
  computed: {
    assignedStations () {
      const output = this.$store.state.route_station_map[this.route.name] || []
      output.sort((a, b) => {
        return a.order - b.order
      })
      return output
    },
    stateMapping () {
      // TODO: Is may make sense to use the structure below as value for the main "global_dashboard"
      const output = {}
      this.$store.state.global_dashboard.forEach(teamState => {
        teamState.stations.forEach(stationState => {
          if (output[stationState.name] === undefined) {
            output[stationState.name] = {}
          }
          if (stationState.state !== 'unreachable') {
            output[stationState.name][teamState.team] = stationState
          }
        })
      })
      return output
    },
    progressItems () {
      const rows = []
      const mapping = this.stateMapping
      const routeTeams = this.$store.state.route_team_map
      const assignedStations = this.assignedStations
      for (const teamName in routeTeams) {
        if (routeTeams.hasOwnProperty(teamName)) {
          const route = routeTeams[teamName]
          if (this.route.name !== route) {
            continue
          }
          let teamDetails = this.$store.getters.findTeam(teamName)
          let row = {
            pending: 0,
            waiting: 0,
            finished: 0,
            team: teamName,
            cancelled: teamDetails.cancelled
          }
          assignedStations.forEach(station => {
            const stationData = mapping[station.name]
            if (!stationData) {
              return
            }
            const state = stationData[teamName]
            switch (state.state) {
              case 'arrived':
                row.waiting += 1
                break
              case 'finished':
                row.finished += 1
                break
              case 'unknown':
                row.pending += 1
                break
              default:
                console.warn(`Unknown state: ${JSON.stringify(state)}`)
            }
          })
          let total = row.pending + row.waiting + row.finished
          row.pct_pending = row.pending / total * 100
          row.pct_waiting = row.waiting / total * 100
          row.pct_finished = row.finished / total * 100
          rows.push(row)
        }
      }
      return rows
    }
  }
}
</script>
