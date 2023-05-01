<template>
  <div>
    <h1 class="white--text">{{ route.name }}</h1>
    <v-data-table
      :style="'border-left: 3px solid ' + routeColor"
      hide-default-footer
      :headers="tableHeaders"
      :items="tableItems">
      <template v-slot:item="props">
        <tr>
          <td :class="props.item.cancelled ? 'text-xs-left cancelled' : 'text-xs-left'">{{props.item.team}}</td>
          <td v-for="cell in props.item.stations" :key="props.item.team + cell.station">
            <state-icon
              :title="props.item.team + '@' + cell.station"
              :state="cell.state"
              v-if="cell.state !== 'unreachable'"
            ></state-icon>
          </td>
        </tr>
      </template>
    </v-data-table>
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
  name: 'route-dashboard-legacy',
  props: {
    'route': {
      type: Object,
      default: null
    }
  },
  computed: {
    routeColor () {
      if (this.route.color) {
        return this.route.color
      } else {
        return '#000000'
      }
    },
    assignedStations () {
      const output = this.$store.state.route_station_map[this.route.name] || []
      output.sort((a, b) => {
        return a.order - b.order
      })
      return output
    },
    tableHeaders () {
      let output = [{
        text: 'Team',
        align: 'left',
        value: 'team'
      }]
      const assignedStations = this.assignedStations
      // (not really a side-effect, I think)
      // eslint-disable-next-line
      if (this.assignedStations) {
        assignedStations.forEach(station => {
          output.push({
            text: station.name,
            align: 'center',
            value: 'state',
            sortable: false
          })
        })
      }
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
    tableItems () {
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
            stations: [],
            team: teamName,
            cancelled: teamDetails.cancelled
          }
          assignedStations.forEach(station => {
            const stationData = mapping[station.name]
            if (!stationData) {
              return
            }
            const state = stationData[teamName]
            row.stations.push({
              state: state.state,
              score: state.score,
              station: state.name
            })
          })
          rows.push(row)
        }
      }
      return rows
    }
  }
}
</script>
