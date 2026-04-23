<template>
  <!--
    SummaryView — highest-level overview. One row per route showing
    aggregate progress across all teams, plus a grand-total row.
    Intended for large-display / projector viewing at a distance.
  -->
  <div class="summary-view pa-4">
    <!-- Grand total -->
    <div class="summary-row summary-row--total mb-6">
      <div class="summary-row__label">
        <span class="summary-route-name">All Routes</span>
        <span class="summary-pct"
          >{{ grandTotal.pctFinished.toFixed(0) }}%</span
        >
      </div>
      <div class="summary-row__bar-wrapper">
        <div class="summary-bar">
          <div
            class="summary-bar__finished summary-bar__finished--total"
            :style="{ width: grandTotal.pctFinished + '%' }"
          />
          <div
            class="summary-bar__arrived summary-bar__arrived--total"
            :style="{
              left: grandTotal.pctFinished + '%',
              width: grandTotal.pctArrived + '%'
            }"
          />
        </div>
        <div class="summary-counts">
          <span
            >{{ grandTotal.finishedStations }} /
            {{ grandTotal.totalStations }} station visits</span
          >
          <span
            v-if="grandTotal.arrivedStations > 0"
            class="summary-counts__in-progress"
          >
            · {{ grandTotal.arrivedStations }} in progress
          </span>
        </div>
      </div>
    </div>

    <v-divider class="mb-5" />

    <!-- Per-route rows -->
    <div
      v-for="row in routeRows"
      :key="row.routeName"
      class="summary-row mb-4"
      :style="{ '--route-color': row.routeColor }"
    >
      <div class="summary-row__label">
        <span class="summary-route-name">{{ row.routeName }}</span>
        <span class="summary-pct">{{ row.pctFinished.toFixed(0) }}%</span>
      </div>
      <div class="summary-row__bar-wrapper">
        <div class="summary-bar">
          <div
            class="summary-bar__finished"
            :style="{ width: row.pctFinished + '%' }"
          />
          <div
            class="summary-bar__arrived"
            :style="{
              left: row.pctFinished + '%',
              width: row.pctArrived + '%'
            }"
          />
        </div>
        <div class="summary-counts">
          <span>
            {{ row.activeTeams }} active · {{ row.finishedTeams }} finished ·
            {{ row.finishedStations }}/{{ row.totalStations }} station visits
          </span>
          <span
            v-if="row.arrivedStations > 0"
            class="summary-counts__in-progress"
          >
            · {{ row.arrivedStations }} in progress
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-view {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.summary-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.summary-row--total .summary-route-name {
  font-size: 1.1rem;
  font-weight: 700;
  opacity: 0.85;
}

.summary-row__label {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 160px;
  flex-shrink: 0;
  padding-top: 2px;
}

.summary-route-name {
  font-size: 0.95rem;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.summary-pct {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 2px;
}

.summary-row__bar-wrapper {
  flex: 1;
  min-width: 0;
}

.summary-bar {
  position: relative;
  height: 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.summary-row--total .summary-bar {
  height: 22px;
  border-radius: 5px;
}

.summary-bar__finished {
  position: absolute;
  height: 100%;
  background: var(--route-color, rgba(255, 255, 255, 0.5));
  border-radius: 4px 0 0 4px;
  transition: width 0.6s ease;
}

.summary-bar__finished--total {
  background: rgba(255, 255, 255, 0.45);
}

.summary-bar__arrived {
  position: absolute;
  height: 100%;
  background: var(--route-color, rgba(255, 255, 255, 0.3));
  opacity: 0.5;
  transition: left 0.6s ease, width 0.6s ease;
}

.summary-bar__arrived--total {
  background: rgba(255, 255, 255, 0.3);
}

.summary-counts {
  font-size: 0.72rem;
  opacity: 0.55;
  margin-top: 4px;
}

.summary-counts__in-progress {
  color: #ffcc80;
  opacity: 0.85;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { DashboardRow } from '@/remote/model/dashboardRow'

interface RouteRow {
  routeName: string
  routeColor: string
  pctFinished: number
  pctArrived: number
  finishedStations: number
  arrivedStations: number
  totalStations: number
  activeTeams: number
  finishedTeams: number
}

interface GrandTotal {
  pctFinished: number
  pctArrived: number
  finishedStations: number
  arrivedStations: number
  totalStations: number
}

export default defineComponent({
  name: 'SummaryView',

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
    },
    routeTeams: {
      type: Object as () => Record<string, Team[]>,
      default: () => ({})
    },
    routeStations: {
      type: Object as () => Record<string, Station[]>,
      default: () => ({})
    }
  },

  computed: {
    dashboardByTeam(): Record<string, DashboardRow> {
      const m: Record<string, DashboardRow> = {}
      this.globalDashboard.forEach((r) => {
        m[r.team] = r
      })
      return m
    },

    teamDetailsByName(): Record<string, Team> {
      const m: Record<string, Team> = {}
      this.teams.forEach((t) => {
        m[t.name] = t
      })
      return m
    },

    routeByName(): Record<string, Route> {
      const m: Record<string, Route> = {}
      this.routes.forEach((r) => {
        m[r.name] = r
      })
      return m
    },

    routeRows(): RouteRow[] {
      const rows: RouteRow[] = []
      const dashByTeam = this.dashboardByTeam
      const teamDetails = this.teamDetailsByName
      const routeByName = this.routeByName

      for (const routeName of Object.keys(this.routeTeams)) {
        const route = routeByName[routeName]
        const stations: Station[] = (this.routeStations[routeName] || [])
          .slice()
          .sort((a, b) => a.order - b.order)
        const assignedTeams: Team[] = this.routeTeams[routeName] || []
        const activeTeams = assignedTeams.filter(
          (t) => !teamDetails[t.name]?.cancelled
        )

        let finishedStations = 0
        let arrivedStations = 0
        let totalStations = 0
        let finishedTeams = 0

        activeTeams.forEach((t) => {
          const dashRow = dashByTeam[t.name]
          if (!dashRow) return
          const stateByStation: Record<string, string> = {}
          dashRow.stations.forEach((s) => {
            stateByStation[s.name] = s.state
          })
          let teamFinished = 0
          let teamTotal = 0
          stations.forEach((station) => {
            const state = stateByStation[station.name]
            if (!state || state === 'unreachable') return
            teamTotal += 1
            if (state === 'finished') {
              finishedStations += 1
              teamFinished += 1
            } else if (state === 'arrived') {
              arrivedStations += 1
            }
            totalStations += 1
          })
          if (teamFinished === teamTotal && teamTotal > 0) finishedTeams += 1
        })

        const pctFinished =
          totalStations > 0 ? (finishedStations / totalStations) * 100 : 0
        const pctArrived =
          totalStations > 0 ? (arrivedStations / totalStations) * 100 : 0

        rows.push({
          routeName,
          routeColor: route?.color ?? '#888',
          pctFinished,
          pctArrived,
          finishedStations,
          arrivedStations,
          totalStations,
          activeTeams: activeTeams.length - finishedTeams,
          finishedTeams
        })
      }
      return rows
    },

    grandTotal(): GrandTotal {
      let finished = 0
      let arrived = 0
      let total = 0
      this.routeRows.forEach((r) => {
        finished += r.finishedStations
        arrived += r.arrivedStations
        total += r.totalStations
      })
      return {
        pctFinished: total > 0 ? (finished / total) * 100 : 0,
        pctArrived: total > 0 ? (arrived / total) * 100 : 0,
        finishedStations: finished,
        arrivedStations: arrived,
        totalStations: total
      }
    }
  }
})
</script>
