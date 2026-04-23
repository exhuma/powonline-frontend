<template>
  <!--
    CombinedView — all teams from all routes in one flat list,
    colour-coded by route, sorted by progress descending.
    Finished teams are visually separated at the bottom.
  -->
  <div class="combined-view">
    <!-- Active teams -->
    <TransitionGroup name="team-list" tag="div" class="team-list">
      <div
        v-for="row in activeRows"
        :key="row.team"
        class="team-row px-3 py-2"
        :style="{ '--route-color': row.routeColor }"
        :class="{ 'team-row--cancelled': row.cancelled }"
      >
        <span class="route-pip" />
        <div class="team-row__label">
          <span class="team-name" :class="{ cancelled: row.cancelled }">{{
            row.team
          }}</span>
          <span class="team-score">{{ row.totalScore }} pts</span>
        </div>
        <div class="team-row__track">
          <RouteTrack
            :segments="row.segments"
            :color="row.routeColor"
            :cancelled="row.cancelled"
            :team-name="row.team"
            :width="trackWidth"
            :height="22"
          />
        </div>
      </div>
    </TransitionGroup>

    <!-- Finished / completed divider -->
    <template v-if="finishedRows.length > 0">
      <div class="finished-divider my-4">
        <v-divider />
        <span class="finished-label">Finished ({{ finishedRows.length }})</span>
        <v-divider />
      </div>
      <div
        v-for="row in finishedRows"
        :key="row.team"
        class="team-row team-row--done px-3 py-1"
        :style="{ '--route-color': row.routeColor }"
      >
        <span class="route-pip" />
        <div class="team-row__label">
          <span class="team-name" :class="{ cancelled: row.cancelled }">{{
            row.team
          }}</span>
          <span class="team-score">{{ row.totalScore }} pts</span>
        </div>
        <div class="team-row__track">
          <RouteTrack
            :segments="row.segments"
            :color="row.routeColor"
            :cancelled="row.cancelled"
            :team-name="row.team"
            :width="trackWidth"
            :height="18"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.combined-view {
  width: 100%;
}

.team-list {
  width: 100%;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.team-row--cancelled {
  opacity: 0.45;
}

.team-row--done {
  opacity: 0.65;
}

/* Colour pip — small vertical bar on the left matching route colour */
.route-pip {
  display: block;
  width: 4px;
  height: 28px;
  border-radius: 2px;
  background: var(--route-color, #888);
  flex-shrink: 0;
  transition: background 0.4s ease;
}

.team-row__label {
  display: flex;
  flex-direction: column;
  min-width: 110px;
  max-width: 140px;
  width: 140px;
  flex-shrink: 0;
}

.team-name {
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-name.cancelled {
  text-decoration: line-through;
  opacity: 0.55;
}

.team-score {
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 1px;
}

.team-row__track {
  flex: 1;
  min-width: 0;
}

.finished-divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.finished-label {
  white-space: nowrap;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  flex-shrink: 0;
}

/* TransitionGroup */
.team-list-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.team-list-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.team-list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.team-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.team-list-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
import RouteTrack from '@/components/RouteTrack.vue'
import type { TrackSegment } from '@/components/RouteTrack.vue'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { DashboardRow } from '@/remote/model/dashboardRow'

interface CombinedRow {
  team: string
  routeColor: string
  cancelled: boolean
  completed: boolean
  totalScore: number
  pctFinished: number
  pctArrived: number
  segments: TrackSegment[]
}

export default defineComponent({
  name: 'CombinedView',

  components: { RouteTrack },

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
    },
    trackWidth: {
      type: Number,
      default: 400
    }
  },

  computed: {
    routeByName(): Record<string, Route> {
      const m: Record<string, Route> = {}
      this.routes.forEach((r) => {
        m[r.name] = r
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

    dashboardByTeam(): Record<string, DashboardRow> {
      const m: Record<string, DashboardRow> = {}
      this.globalDashboard.forEach((r) => {
        m[r.team] = r
      })
      return m
    },

    allRows(): CombinedRow[] {
      const rows: CombinedRow[] = []
      const teamDetails = this.teamDetailsByName
      const dashByTeam = this.dashboardByTeam
      const routeByName = this.routeByName

      for (const routeName in this.routeTeams) {
        if (!Object.prototype.hasOwnProperty.call(this.routeTeams, routeName))
          continue
        const route = routeByName[routeName]
        const stations: Station[] = (this.routeStations[routeName] || [])
          .slice()
          .sort((a, b) => a.order - b.order)
        const assignedTeams: Team[] = this.routeTeams[routeName] || []

        assignedTeams.forEach((t) => {
          const details = teamDetails[t.name]
          const dashRow = dashByTeam[t.name]
          const stateByStation: Record<
            string,
            { state: string; score: number }
          > = {}
          if (dashRow) {
            dashRow.stations.forEach((s) => {
              stateByStation[s.name] = { state: s.state, score: s.score }
            })
          }

          const segments: TrackSegment[] = stations.map((station) => {
            const entry = stateByStation[station.name]
            return {
              stationName: station.name,
              state: (entry?.state as TrackSegment['state']) ?? 'unknown',
              score: entry?.score ?? 0
            }
          })

          const finished = segments.filter((s) => s.state === 'finished').length
          const arrived = segments.filter((s) => s.state === 'arrived').length
          const reachable = segments.filter(
            (s) => s.state !== 'unreachable'
          ).length
          const totalScore = segments.reduce((acc, s) => acc + s.score, 0)

          rows.push({
            team: t.name,
            routeColor: route?.color ?? '#888',
            cancelled: details?.cancelled ?? false,
            completed: details?.completed ?? false,
            totalScore,
            pctFinished: reachable > 0 ? (finished / reachable) * 100 : 0,
            pctArrived: reachable > 0 ? (arrived / reachable) * 100 : 0,
            segments
          })
        })
      }
      return rows
    },

    activeRows(): CombinedRow[] {
      return this.allRows
        .filter((r) => !r.completed && !r.cancelled && r.pctFinished < 100)
        .sort(
          (a, b) =>
            b.pctFinished +
            b.pctArrived * 0.5 -
            (a.pctFinished + a.pctArrived * 0.5)
        )
    },

    finishedRows(): CombinedRow[] {
      return this.allRows.filter(
        (r) => r.completed || r.cancelled || r.pctFinished >= 100
      )
    }
  }
})
</script>
