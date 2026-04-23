<template>
  <div id="GlobalDashboard" class="global-dashboard">
    <!--
      3-column grid: route 0 | route 1 | scoreboard
      Proportions: 2fr 2fr 1fr
    -->
    <div class="three-col-grid">
      <!-- Route column 0 -->
      <div ref="col0" class="route-col pa-3">
        <RouteGroupedView
          :routes="routes"
          :route-name="routes[0] ? routes[0].name : null"
          :teams="teams"
          :global-dashboard="globalDashboard"
          :route-teams="routeTeams"
          :route-stations="routeStations"
          :track-width="colTrackWidth"
        />
      </div>

      <!-- Route column 1 -->
      <div class="route-col pa-3">
        <RouteGroupedView
          :routes="routes"
          :route-name="routes[1] ? routes[1].name : null"
          :teams="teams"
          :global-dashboard="globalDashboard"
          :route-teams="routeTeams"
          :route-stations="routeStations"
          :track-width="colTrackWidth"
        />
      </div>

      <!-- Scoreboard column -->
      <div class="scoreboard-col">
        <ScoreboardPanel
          inline
          :model-value="true"
          :global-dashboard="globalDashboard"
          :questionnaire-scores="questionnaireScores"
          :teams="teams"
        />
      </div>
    </div>

    <!-- Fullscreen toggle FAB — bottom-right -->
    <v-btn
      class="fullscreen-fab"
      :style="{ bottom: isFullscreen ? '24px' : '80px' }"
      icon
      size="small"
      color="surface-variant"
      elevation="4"
      @click="toggleFullscreen"
    >
      <v-icon>{{
        isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
      }}</v-icon>
      <v-tooltip activator="parent" location="left">
        {{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
      </v-tooltip>
    </v-btn>
  </div>
</template>

<style scoped>
.global-dashboard {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.three-col-grid {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  height: 100%;
}

.route-col {
  overflow-y: auto;
  height: 100%;
  scrollbar-gutter: stable;
}

.scoreboard-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.fullscreen-fab {
  position: fixed;
  right: 24px;
  z-index: 500;
  transition: bottom 0.2s ease;
}
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import RouteGroupedView from '@/components/RouteGroupedView.vue'
import ScoreboardPanel from '@/components/ScoreboardPanel.vue'
import { api } from '@/main'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'

const AUTO_REFRESH_INTERVAL_SECONDS =
  Number((import.meta as any).env?.VITE_DASHBOARD_REFRESH) || 0

/** Width reserved for the team label column in pixels. */
const LABEL_WIDTH = 110
/** Right padding and gap */
const TRACK_PADDING = 48

export default defineComponent({
  name: 'GlobalDashboard',

  components: {
    RouteGroupedView,
    ScoreboardPanel
  },

  inject: ['getSelectedEventId'],

  setup() {
    const col0 = ref<HTMLElement | null>(null)
    const { width: col0Width } = useElementSize(col0)
    return { col0, col0Width }
  },

  data() {
    return {
      refreshId: null as number | null,
      pctUntilNextRefresh: 100.0,
      isFullscreen: false,
      routes: [] as Route[],
      teams: [] as Team[],
      globalDashboard: [] as DashboardRow[],
      routeTeams: {} as Record<string, Team[]>,
      routeStations: {} as Record<string, Station[]>,
      questionnaireScores: {} as QuestionnaireScores
    }
  },

  computed: {
    /**
     * Pixel width for tracks inside a route column.
     * Each route column is 2fr out of 5fr total, so roughly 2/5 of the viewport.
     * col0Width is the measured actual column width.
     */
    colTrackWidth(): number {
      const colW =
        (this.col0Width as number) > 0
          ? (this.col0Width as number)
          : (window.innerWidth * 2) / 5
      return Math.max(colW - LABEL_WIDTH - TRACK_PADDING, 80)
    }
  },

  created() {
    this.refresh()
    this.startAutoRefresh()
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
  },

  beforeUnmount() {
    this.stopAutoRefresh()
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
  },

  methods: {
    async refresh() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        const [routes, teams, dashboard, assignments, qScores] =
          await Promise.all([
            api.fetchRoutes(eventId),
            api.fetchTeams(eventId),
            api.fetchDashboard(eventId),
            api.fetchAssignments(eventId),
            api.fetchQuestionnaireScores(eventId)
          ])
        this.routes = routes
        this.teams = teams
        this.globalDashboard = dashboard
        this.routeTeams = assignments.teams || {}
        this.routeStations = assignments.stations || {}
        this.questionnaireScores = qScores
      } catch (e) {
        console.error('Unable to refresh global dashboard data', e)
      }
    },

    onFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement
      this.$emit('fullScreenRequested', this.isFullscreen)
    },

    async toggleFullscreen() {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    },

    autoRefreshTick() {
      const tickPercent = 100.0 / AUTO_REFRESH_INTERVAL_SECONDS
      this.pctUntilNextRefresh -= tickPercent
      this.$emit('refresh-progress-updated', {
        progress: this.pctUntilNextRefresh
      })
      if (this.pctUntilNextRefresh <= 0) {
        this.refresh()
        this.pctUntilNextRefresh = 100.0
      }
    },

    startAutoRefresh() {
      if (AUTO_REFRESH_INTERVAL_SECONDS > 0) {
        this.refreshId = window.setInterval(this.autoRefreshTick, 1000)
      }
    },

    stopAutoRefresh() {
      if (this.refreshId !== null) {
        window.clearInterval(this.refreshId)
        this.$emit('refresh-progress-updated', { progress: 0.0 })
      }
    }
  }
})
</script>
