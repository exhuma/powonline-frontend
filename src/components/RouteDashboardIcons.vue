<template>
  <div>
    <h1 class="white--text">{{ route.name }}</h1>
    <v-data-table
      :style="'border-left: 3px solid ' + routeColor"
      hide-default-footer
      :headers="tableHeaders"
      :items="tableItems"
    >
      <template slot="item" slot-scope="props">
        <tr>
          <td
            :class="
              props.item.cancelled ? 'text-xs-left cancelled' : 'text-xs-left'
            "
          >
            {{ props.item.team }}
          </td>
          <td
            v-for="cell in props.item.stations"
            :key="props.item.team + cell.station"
          >
            <v-icon
              :title="props.item.team + '@' + cell.station"
              v-if="cell.state !== 'unreachable'"
            >
              {{ getStateIcon(cell.state) }}</v-icon
            >
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

<script lang="ts">
import util from '@/util'
import { DashboardRow } from '@/remote/model/dashboardRow'
import type { VueTableHeader } from '@/types'
import type { Station } from '@/remote/model/station'

import Vue from 'vue'
const RouteDashboardIcons = Vue.extend({
  name: 'route-dashboard-icons',
  props: {
    route: {
      type: Object,
      default: null
    }
  },
  computed: {
    routeColor(): string {
      if (this.route.color) {
        return this.route.color
      } else {
        return '#000000'
      }
    },
    assignedStations(): Station[] {
      const map = this.$store.state.route_station_map as {
        [key: string]: Station[]
      }
      const output = map[this.route.name] || []
      output.sort((a, b) => {
        return a.order - b.order
      })
      return output
    },
    tableHeaders(): VueTableHeader[] {
      const output: VueTableHeader[] = [
        {
          text: 'Team',
          align: 'left',
          value: 'team'
        }
      ]
      const assignedStations = this.assignedStations
      // (not really a side-effect, I think)
      // eslint-disable-next-line
      if (this.assignedStations) {
        assignedStations.forEach((station) => {
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
    stateMapping() {
      // TODO: Is may make sense to use the structure below as value for the main "global_dashboard"
      const output = {}
      const dashBoard = this.$store.state.global_dashboard as DashboardRow[]
      dashBoard.forEach((teamState) => {
        teamState.stations.forEach((stationState) => {
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
    tableItems() {
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
          const teamDetails = this.$store.getters.findTeam(teamName)
          const row = {
            stations: [],
            team: teamName,
            cancelled: teamDetails.cancelled
          }
          assignedStations.forEach((station) => {
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
  },
  methods: {
    getStateIcon(state) {
      return util.getStateIcon(state)
    }
  }
})
export default RouteDashboardIcons
</script>
