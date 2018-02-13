<template>

  <v-container id="GlobalDashboard">
    <v-layout row wrap>
      <v-flex xs12 elevation-1>

        <v-data-table
          hide-actions
          :headers="tableHeaders"
          :items="tableItems">
          <template slot="items" slot-scope="props">
            <td>{{props.item.team}}</td>
            <td v-for="cell in props.item.stations" :key="props.item.team + cell.station">
              <v-icon v-if="cell.state !== 'unreachable'" slot="activator"> {{ getStateIcon(cell.state) }}</v-icon>
            </td>
          </template>
        </v-data-table>

      </v-flex>
    </v-layout>
  </v-container>

</template>

<script>
import util from '@/util'
export default {
  name: 'global_dashboard',
  computed: {
    tableHeaders () {
      let output = [{
        text: 'Team',
        align: 'center',
        value: 'team'
      }]
      // (not really a side-effect, I think)
      // eslint-disable-next-line
      this.$store.state.global_dashboard[0].stations.forEach(item => {
        output.push({
          text: item.name,
          align: 'center',
          value: 'state',
          sortable: false
        })
      })
      return output
    },
    tableItems () {
      let rows = []
      this.$store.state.global_dashboard.forEach(function (team) {
        console.log(team)
        let row = {
          stations: [],
          team: team.team
        }
        team.stations.forEach(function (teamStation) {
          row.stations.push({
            state: teamStation.state,
            score: teamStation.score,
            station: teamStation.name
          })
        })
        rows.push(row)
      })
      return rows
    }
  },
  methods: {
    getStateIcon (state) {
      return util.getStateIcon(state)
    }
  },
  created () {
    this.$store.dispatch('fetchGlobalDashboard')
    this.$store.commit('changeTitle', 'Global Dashboard')
  }
}
</script>
