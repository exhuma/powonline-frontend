<template>
  <div>
    <v-card>
      <v-card-title class="mb-0">
        {{ route.name }}
      </v-card-title>
      <v-progress-linear
        style="background: rgba(0, 0, 0, 0.15)"
        height="3"
        class="mt-0"
        :color="route.color"
        :value="overall_pct_finished"
        :buffer-value="overall_pct_finished + overall_pct_waiting"
      ></v-progress-linear>
      <v-card-text>
        <v-container>
          <dashboard-progress-line
            row
            v-for="row in progressItems"
            :key="row.team"
            :data="row"
            :color="route.color"
          ></dashboard-progress-line>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.cancelled {
  text-decoration: line-through;
  color: #888 !important;
}
</style>

<script lang="ts">
import Vue from 'vue'
import { Station } from '@/remote/model/station'
import { DashboardRow as RemoteDashboardRow } from '@/remote/model/dashboardRow'

interface DashboardRow {
  pending: number
  waiting: number
  finished: number
  team: string
  cancelled: boolean
  pct_pending: number
  pct_waiting: number
  pct_finished: number
}

const RouteDashboard = Vue.extend({
  name: 'route-dashboard',
  props: {
    route: {
      type: Object,
      default: null
    }
  },
  computed: {
    overall_pct_finished(): number {
      let pending = 0
      let waiting = 0
      let finished = 0
      this.progressItems.forEach((item) => {
        pending += item.pending
        waiting += item.waiting
        finished += item.finished
      })
      const total = pending + waiting + finished
      return (finished / total) * 100
    },
    overall_pct_waiting(): number {
      let pending = 0
      let waiting = 0
      let finished = 0
      this.progressItems.forEach((item) => {
        pending += item.pending
        waiting += item.waiting
        finished += item.finished
      })
      const total = pending + waiting + finished
      return (waiting / total) * 100
    },
    assignedStations(): Station[] {
      const output = this.$store.state.route_station_map[this.route.name] || []
      output.sort((a, b) => {
        return a.order - b.order
      })
      return output
    },
    stateMapping(): { [key: string]: { [key: string]: { name: string; score: number; state: string } } } {
      // TODO: Is may make sense to use the structure below as value for the main "global_dashboard"
      const output = {}
      const teamStates = this.$store.state.global_dashboard as RemoteDashboardRow[]

      teamStates.forEach((teamState) => {
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
    progressItems(): DashboardRow[] {
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
          const row: DashboardRow = {
            pending: 0,
            waiting: 0,
            finished: 0,
            team: teamName,
            cancelled: teamDetails.cancelled,
            pct_finished: 0,
            pct_waiting: 0,
            pct_pending: 0
          }
          assignedStations.forEach((station) => {
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
          const total = row.pending + row.waiting + row.finished
          row.pct_pending = (row.pending / total) * 100
          row.pct_waiting = (row.waiting / total) * 100
          row.pct_finished = (row.finished / total) * 100
          rows.push(row)
        }
      }
      return rows
    }
  }
})
export default RouteDashboard
</script>
