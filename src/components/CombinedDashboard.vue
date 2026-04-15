<template>
  <div>
    <dashboard-progress-line
      row
      :data="overallData"
      :color="overallColor"
    ></dashboard-progress-line>
    <dashboard-progress-line
      row
      v-for="row in unfinishedTeams"
      :key="row.team"
      :data="row"
      :color="row.color"
    ></dashboard-progress-line>
    <v-divider class="ma-3"></v-divider>
    <h1 class="primary--text text-center">Finished Teams</h1>
    <dashboard-progress-line
      row
      v-for="row in finishedTeams"
      :key="row.team"
      :data="row"
      :color="row.color"
    ></dashboard-progress-line>
  </div>
</template>

<script lang="ts">
function isFinished(item: UIDashboardRow) {
  if (item.cancelled || item.completed) {
    return true
  }
  return item.waiting + item.pending === 0
}
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import Vue from 'vue'

interface UIDashboardRow {
  pending: number
  waiting: number
  finished: number
  team: string
  cancelled: boolean
  completed: boolean
  color: string
  pct_pending: number
  pct_waiting: number
  pct_finished: number
}
const CombinedDashboard = Vue.extend({
  name: 'combined-dashboard',
  props: {
    routes: {
      type: Array as () => Route[],
      default: () => []
    },
    teams: {
      type: Array as () => Team[],
      default: () => []
    },
    globalDashboard: {
      type: Array as () => DashboardRow[],
      default: () => []
    }
  },
  data() {
    return {
      overallColor: 'hsl(120, 30%, 30%)'
    }
  },
  computed: {
    overallData(): { pct_finished: number; pct_waiting: number; team: string } {
      return {
        pct_finished: this.overall_pct_finished,
        pct_waiting: this.overall_pct_waiting,
        team: 'Overall Progress'
      }
    },
    overall_pct_finished(): number {
      let pending = 0
      let waiting = 0
      let finished = 0
      const activeTeams = this.rows.filter((item) => !item.cancelled)
      activeTeams.forEach((item) => {
        if (isFinished(item)) {
          finished += item.pending + item.waiting + item.finished
        } else {
          pending += item.pending
          waiting += item.waiting
          finished += item.finished
        }
      })
      const total = pending + waiting + finished
      if (total === 0) return 0
      return (finished / total) * 100
    },
    overall_pct_waiting(): number {
      let pending = 0
      let waiting = 0
      let finished = 0
      const activeTeams = this.rows.filter((item) => !item.cancelled)
      activeTeams.forEach((item) => {
        if (isFinished(item)) {
          finished += item.pending + item.waiting + item.finished
        } else {
          pending += item.pending
          waiting += item.waiting
          finished += item.finished
        }
      })
      const total = pending + waiting + finished
      if (total === 0) return 0
      return (waiting / total) * 100
    },
    rows(): UIDashboardRow[] {
      const output: UIDashboardRow[] = []
      const dashboardRows: DashboardRow[] = this.globalDashboard
      dashboardRows.forEach((team) => {
        const teamDetails = (this.teams as Team[]).find(
          (t) => t.name === team.team
        )
        if (!teamDetails) return
        const route = (this.routes as Route[]).find(
          (r) => r.name === teamDetails.route_name
        )
        const row: UIDashboardRow = {
          pending: 0,
          waiting: 0,
          finished: 0,
          team: team.team,
          cancelled: teamDetails.cancelled,
          completed: teamDetails.completed,
          color: route ? route.color : '#ccc',
          pct_finished: 0,
          pct_waiting: 0,
          pct_pending: 0
        }
        team.stations.forEach((station: { state: string }) => {
          switch (station.state) {
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
              console.warn(`Unknown state: ${JSON.stringify(station.state)}`)
          }
        })
        const total = row.pending + row.waiting + row.finished
        if (total > 0) {
          row.pct_pending = (row.pending / total) * 100
          row.pct_waiting = (row.waiting / total) * 100
          row.pct_finished = (row.finished / total) * 100
        }
        output.push(row)
      })
      output.sort(
        (a, b) =>
          a.pct_finished * 2 +
          a.pct_waiting -
          (b.pct_finished * 2 + b.pct_waiting)
      )
      return output
    },
    finishedTeams(): UIDashboardRow[] {
      return this.rows.filter((item) => isFinished(item))
    },
    unfinishedTeams(): UIDashboardRow[] {
      return this.rows.filter((item) => !isFinished(item))
    }
  }
})
export default CombinedDashboard
</script>
