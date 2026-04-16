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
        :model-value="overall_pct_finished"
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
import { defineComponent } from 'vue'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { DashboardRow as RemoteDashboardRow } from '@/remote/model/dashboardRow'

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

const RouteDashboard = defineComponent({
  name: 'route-dashboard',
  props: {
    route: {
      type: Object,
      default: null
    },
    globalDashboard: {
      type: Array as () => RemoteDashboardRow[],
      default: () => []
    },
    // { [routeName]: Team[] }
    routeTeams: {
      type: Object as () => { [routeName: string]: Team[] },
      default: () => ({})
    },
    // { [routeName]: Station[] }
    routeStations: {
      type: Object as () => { [routeName: string]: Station[] },
      default: () => ({})
    },
    teams: {
      type: Array as () => Team[],
      default: () => []
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
      if (total === 0) return 0
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
      if (total === 0) return 0
      return (waiting / total) * 100
    },
    assignedStations(): Station[] {
      const list = (this.routeStations[this.route.name] || []).slice()
      list.sort((a, b) => a.order - b.order)
      return list
    },
    stateMapping(): {
      [stationName: string]: {
        [teamName: string]: { name: string; score: number; state: string }
      }
    } {
      const output: Record<string, Record<string, any>> = {}
      const teamStates = this.globalDashboard as RemoteDashboardRow[]
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
      const rows: DashboardRow[] = []
      const mapping = this.stateMapping
      const assignedTeams: Team[] = this.routeTeams[this.route.name] || []
      const assignedStations = this.assignedStations

      assignedTeams.forEach((team) => {
        const teamDetails = this.teams.find((t) => t.name === team.name)
        const row: DashboardRow = {
          pending: 0,
          waiting: 0,
          finished: 0,
          team: team.name,
          cancelled: teamDetails ? teamDetails.cancelled : false,
          pct_finished: 0,
          pct_waiting: 0,
          pct_pending: 0
        }
        assignedStations.forEach((station) => {
          const stationData = mapping[station.name]
          if (!stationData) return
          const state = stationData[team.name]
          if (!state) {
            console.warn(
              `No state for team ${team.name} on station ${station.name}`
            )
          } else {
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
          }
        })
        const total = row.pending + row.waiting + row.finished
        if (total > 0) {
          row.pct_pending = (row.pending / total) * 100
          row.pct_waiting = (row.waiting / total) * 100
          row.pct_finished = (row.finished / total) * 100
        }
        rows.push(row)
      })
      return rows
    }
  }
})
export default RouteDashboard
</script>
