<template>
  <div>
    <h2 class="text-grey mt-2">{{ route.name }}</h2>
    <v-data-table
      :style="'border-left: 3px solid ' + routeColor"
      hide-default-footer
      :headers="tableHeaders"
      :items="tableItems"
      :items-per-page="-1"
    >
      <template v-slot:item="{ item }">
        <tr>
          <td
            :class="item.cancelled ? 'text-xs-left cancelled' : 'text-xs-left'"
          >
            {{ item.team }}
          </td>
          <td v-for="cell in item.stations" :key="item.team + cell.station">
            <state-icon
              :title="item.team + '@' + cell.station"
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

<script lang="ts">
import { defineComponent } from 'vue'
import type { Station } from '@/remote/model/station'
import type { Team } from '@/remote/model/team'
import type { DashboardRow as RemoteDashboardRow } from '@/remote/model/dashboardRow'
import type { VueTableHeaders } from '@/types'

const RouteDashboardLegacy = defineComponent({
  name: 'route-dashboard-legacy',
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
    routeColor(): string {
      return this.route.color || '#000000'
    },
    assignedStations(): Station[] {
      const list = (this.routeStations[this.route.name] || []).slice()
      list.sort((a: Station, b: Station) => a.order - b.order)
      return list
    },
    tableHeaders(): VueTableHeaders[] {
      const output: VueTableHeaders[] = [
        { title: 'Team', align: 'left', key: 'team' }
      ]
      this.assignedStations.forEach((station: Station) => {
        output.push({
          title: station.name,
          align: 'center',
          key: 'state',
          sortable: false
        })
      })
      return output
    },
    stateMapping(): Record<string, Record<string, any>> {
      const output: Record<string, Record<string, any>> = {}
      ;(this.globalDashboard as RemoteDashboardRow[]).forEach((teamState) => {
        teamState.stations.forEach((stationState) => {
          if (!output[stationState.name]) output[stationState.name] = {}
          if (stationState.state !== 'unreachable') {
            output[stationState.name][teamState.team] = stationState
          }
        })
      })
      return output
    },
    tableItems(): any[] {
      const rows: any[] = []
      const mapping = this.stateMapping
      const assignedTeams: Team[] = this.routeTeams[this.route.name] || []
      const assignedStations = this.assignedStations

      assignedTeams.forEach((team) => {
        const teamDetails = this.teams.find((t: Team) => t.name === team.name)
        const row: any = {
          stations: [],
          team: team.name,
          cancelled: teamDetails ? teamDetails.cancelled : false
        }
        assignedStations.forEach((station: Station) => {
          const stationData = mapping[station.name]
          if (!stationData) return
          const state = stationData[team.name]
          if (!state) {
            console.warn(
              `No state for team ${team.name} on station ${station.name}`
            )
          } else {
            row.stations.push({
              state: state.state,
              score: state.score,
              station: state.name
            })
          }
        })
        rows.push(row)
      })
      return rows
    }
  }
})
export default RouteDashboardLegacy
</script>
