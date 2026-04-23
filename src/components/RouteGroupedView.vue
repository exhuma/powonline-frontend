<template>
  <!--
    RouteGroupedView — one card per route, each card containing
    a per-team segment track sorted by progress (leading team first).
  -->
  <div class="route-grouped-view">
    <div
      v-for="route in visibleRoutes"
      :key="route.name"
      class="route-card mb-6"
      :style="{ '--route-color': route.color }"
    >
      <!-- Route header -->
      <div class="route-header pa-3">
        <div class="route-header-top">
          <span class="route-name">{{ route.name }}</span>
          <span class="route-aggregate">
            {{ routeAggregate(route.name).pctFinished.toFixed(0) }}% complete
          </span>
        </div>
        <!-- Thin aggregate progress bar -->
        <div class="route-aggregate-bar mt-1">
          <div
            class="route-aggregate-bar__finished"
            :style="{ width: routeAggregate(route.name).pctFinished + '%' }"
          />
          <div
            class="route-aggregate-bar__arrived"
            :style="{
              left: routeAggregate(route.name).pctFinished + '%',
              width: routeAggregate(route.name).pctArrived + '%'
            }"
          />
        </div>
      </div>

      <!-- Team rows -->
      <TransitionGroup name="team-list" tag="div" class="team-list">
        <div
          v-for="row in routeRows(route.name)"
          :key="row.team"
          class="team-row px-3 py-2"
          :class="{
            'team-row--cancelled': row.cancelled,
            'team-row--completed': row.completed
          }"
        >
          <div class="team-row__label">
            <span class="team-name" :class="{ cancelled: row.cancelled }">{{
              row.team
            }}</span>
            <span class="team-score">{{ row.totalScore }} pts</span>
          </div>
          <div class="team-row__track" ref="trackContainers">
            <RouteTrack
              :segments="row.segments"
              :color="route.color"
              :cancelled="row.cancelled"
              :team-name="row.team"
              :width="trackWidth"
              :height="18"
            />
          </div>
        </div>
      </TransitionGroup>

      <!-- Finished teams section (collapsed by default) -->
      <div
        v-if="finishedRows(route.name).length > 0"
        class="finished-section px-3 pb-2"
      >
        <v-divider class="my-2" />
        <div class="text-caption text-medium-emphasis mb-1">
          Finished ({{ finishedRows(route.name).length }})
        </div>
        <div
          v-for="row in finishedRows(route.name)"
          :key="row.team"
          class="team-row team-row--done px-0 py-1"
        >
          <div class="team-row__label">
            <span class="team-name">{{ row.team }}</span>
            <span class="team-score">{{ row.totalScore }} pts</span>
          </div>
          <div class="team-row__track">
            <RouteTrack
              :segments="row.segments"
              :color="route.color"
              :cancelled="row.cancelled"
              :team-name="row.team"
              :width="trackWidth"
              :height="14"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.route-card {
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border-left: 4px solid var(--route-color, #888);
}

.route-header {
  background: rgba(255, 255, 255, 0.06);
}

.route-header-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.route-name {
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.01em;
}

.route-aggregate {
  font-size: 0.78rem;
  opacity: 0.7;
}

.route-aggregate-bar {
  position: relative;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: visible;
}

.route-aggregate-bar__finished {
  position: absolute;
  height: 100%;
  background: var(--route-color, #888);
  border-radius: 2px;
  transition: width 0.6s ease;
}

.route-aggregate-bar__arrived {
  position: absolute;
  height: 100%;
  background: var(--route-color, #888);
  opacity: 0.45;
  border-radius: 2px;
  transition: left 0.6s ease, width 0.6s ease;
}

.team-list {
  /* container for TransitionGroup */
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
  opacity: 0.7;
}

.team-row__label {
  display: flex;
  flex-direction: column;
  min-width: 80px;
  max-width: 110px;
  width: 110px;
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

/* TransitionGroup animations */
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

interface TeamRow {
  team: string
  cancelled: boolean
  completed: boolean
  totalScore: number
  pctFinished: number
  pctArrived: number
  segments: TrackSegment[]
}

interface RouteAggregate {
  pctFinished: number
  pctArrived: number
}

export default defineComponent({
  name: 'RouteGroupedView',

  components: { RouteTrack },

  props: {
    routes: {
      type: Array as () => Route[],
      default: () => []
    },
    /**
     * When set, only the route with this name is rendered.
     * Omit (or pass null) to render all routes (legacy behaviour).
     */
    routeName: {
      type: String as () => string | null,
      default: null
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
    /** Width in pixels available for each track; parent should pass this. */
    trackWidth: {
      type: Number,
      default: 400
    }
  },

  computed: {
    /** Routes to render — all of them, or just the one named by routeName. */
    visibleRoutes(): Route[] {
      if (this.routeName) {
        return this.routes.filter((r) => r.name === this.routeName)
      }
      return this.routes
    },

    /** Map teamName → DashboardRow for O(1) lookups. */
    dashboardByTeam(): Record<string, DashboardRow> {
      const m: Record<string, DashboardRow> = {}
      this.globalDashboard.forEach((r) => {
        m[r.team] = r
      })
      return m
    },

    /** Map teamName → Team details for O(1) lookups. */
    teamDetailsByName(): Record<string, Team> {
      const m: Record<string, Team> = {}
      this.teams.forEach((t) => {
        m[t.name] = t
      })
      return m
    }
  },

  methods: {
    orderedStations(routeName: string): Station[] {
      const list = (this.routeStations[routeName] || []).slice()
      list.sort((a, b) => a.order - b.order)
      return list
    },

    buildRows(routeName: string): TeamRow[] {
      const assignedTeams: Team[] = this.routeTeams[routeName] || []
      const stations = this.orderedStations(routeName)
      const dashByTeam = this.dashboardByTeam
      const teamDetails = this.teamDetailsByName

      return assignedTeams.map((t) => {
        const details = teamDetails[t.name]
        const dashRow = dashByTeam[t.name]

        // Build a stationName → station-state map from the dashboard payload
        const stateByStation: Record<string, { state: string; score: number }> =
          {}
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

        return {
          team: t.name,
          cancelled: details?.cancelled ?? false,
          completed: details?.completed ?? false,
          totalScore,
          pctFinished: reachable > 0 ? (finished / reachable) * 100 : 0,
          pctArrived: reachable > 0 ? (arrived / reachable) * 100 : 0,
          segments
        }
      })
    },

    /** Active (non-finished, non-cancelled) teams sorted by progress desc. */
    routeRows(routeName: string): TeamRow[] {
      return this.buildRows(routeName)
        .filter((r) => !r.completed && !r.cancelled && r.pctFinished < 100)
        .sort(
          (a, b) =>
            b.pctFinished +
            b.pctArrived * 0.5 -
            (a.pctFinished + a.pctArrived * 0.5)
        )
    },

    /** Finished or cancelled teams. */
    finishedRows(routeName: string): TeamRow[] {
      return this.buildRows(routeName).filter(
        (r) => r.completed || r.cancelled || r.pctFinished >= 100
      )
    },

    routeAggregate(routeName: string): RouteAggregate {
      const rows = this.buildRows(routeName).filter((r) => !r.cancelled)
      if (rows.length === 0) return { pctFinished: 0, pctArrived: 0 }
      const avgFinished =
        rows.reduce((acc, r) => acc + r.pctFinished, 0) / rows.length
      const avgArrived =
        rows.reduce((acc, r) => acc + r.pctArrived, 0) / rows.length
      return { pctFinished: avgFinished, pctArrived: avgArrived }
    }
  }
})
</script>
