<template>
  <!--
    ScoreboardPanel — team rankings by total score.

    Two rendering modes:
      inline=false (default) — floating v-navigation-drawer on the right edge,
                               toggled via v-model.
      inline=true            — plain positioned div, always visible; v-model
                               is ignored.
  -->

  <!-- ── Overlay (drawer) mode ───────────────────────────────────── -->
  <v-navigation-drawer
    v-if="!inline"
    v-model="modelValue"
    location="right"
    temporary
    width="360"
    class="scoreboard-panel"
  >
    <v-toolbar density="compact" color="surface-variant">
      <v-toolbar-title>
        <v-icon start>mdi-trophy</v-icon>
        Scoreboard
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <scoreboard-list :leaderboard="leaderboard" />
  </v-navigation-drawer>

  <!-- ── Inline (always-visible) mode ────────────────────────────── -->
  <div v-else class="scoreboard-inline">
    <div class="scoreboard-inline__header pa-2">
      <v-icon start size="small">mdi-trophy</v-icon>
      <span class="scoreboard-inline__title">Scoreboard</span>
    </div>
    <scoreboard-list :leaderboard="leaderboard" />
  </div>
</template>

<style>
/* These are used by the ScoreboardList sub-component template
   and must not be scoped. */
.scoreboard-list-wrap {
  overflow-y: auto;
  flex: 1 1 0;
  min-height: 0;
}

.scoreboard-list {
  background: transparent !important;
}

.scoreboard-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.72rem;
  margin-right: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: inherit;
  flex-shrink: 0;
}

.rank-badge.rank-1 {
  background: #ffd700;
  color: #000;
}
.rank-badge.rank-2 {
  background: #c0c0c0;
  color: #000;
}
.rank-badge.rank-3 {
  background: #cd7f32;
  color: #000;
}

.score-value {
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
}

.score-unit {
  font-size: 0.72rem;
  opacity: 0.65;
  margin-left: 2px;
}

.cancelled-text {
  text-decoration: line-through;
  opacity: 0.45;
}

.scoreboard-inline {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.scoreboard-inline__header {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.scoreboard-inline__title {
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.8;
}
</style>

<script lang="ts">
import { defineComponent, h } from 'vue'
import { VList, VListItem, VListItemTitle } from 'vuetify/components'
import { useTransition, TransitionPresets } from '@vueuse/core'
import { ref, watch } from 'vue'
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { Team } from '@/remote/model/team'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'

/** Inline micro-component: animated numeric counter. */
const AnimatedNumber = defineComponent({
  name: 'AnimatedNumber',
  props: {
    value: { type: Number, required: true }
  },
  setup(props) {
    const source = ref(props.value)
    watch(
      () => props.value,
      (v) => {
        source.value = v
      }
    )
    const displayed = useTransition(source, {
      duration: 700,
      transition: TransitionPresets.easeInOutCubic
    })
    return () => h('span', Math.round(displayed.value).toString())
  }
})

export interface LeaderboardEntry {
  rank: number
  team: string
  score: number
  cancelled: boolean
}

/**
 * ScoreboardList — shared leaderboard list, render-function based so it works
 * with the Vue runtime-only build (no string template compiler needed).
 */
const ScoreboardList = defineComponent({
  name: 'ScoreboardList',
  components: { AnimatedNumber },
  props: {
    leaderboard: {
      type: Array as () => LeaderboardEntry[],
      default: () => []
    }
  },
  setup(props) {
    function rankClass(rank: number): string {
      if (rank === 1) return 'rank-badge rank-1'
      if (rank === 2) return 'rank-badge rank-2'
      if (rank === 3) return 'rank-badge rank-3'
      return 'rank-badge'
    }

    return () => {
      if (props.leaderboard.length === 0) {
        return h(
          'div',
          { class: 'pa-6 text-center text-medium-emphasis' },
          'No scores yet.'
        )
      }

      const items = props.leaderboard.map((entry) =>
        h(
          VListItem,
          {
            key: entry.team,
            class: ['scoreboard-row', entry.cancelled ? 'cancelled' : '']
          },
          {
            prepend: () =>
              h('span', { class: rankClass(entry.rank) }, String(entry.rank)),
            default: () =>
              h(
                VListItemTitle,
                { class: entry.cancelled ? 'cancelled-text' : '' },
                () => entry.team
              ),
            append: () =>
              h('span', { class: 'score-value' }, [
                h(AnimatedNumber, { value: entry.score }),
                h('span', { class: 'score-unit' }, ' pts')
              ])
          }
        )
      )

      return h('div', { class: 'scoreboard-list-wrap' }, [
        h(
          VList,
          { density: 'compact', class: 'pa-0 scoreboard-list' },
          () => items
        )
      ])
    }
  }
})

export default defineComponent({
  name: 'ScoreboardPanel',

  components: { AnimatedNumber, ScoreboardList },

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    /**
     * When true the scoreboard renders as an always-visible inline block
     * instead of a sliding drawer overlay. v-model is ignored in inline mode.
     */
    inline: {
      type: Boolean,
      default: false
    },
    globalDashboard: {
      type: Array as () => DashboardRow[],
      default: () => []
    },
    questionnaireScores: {
      type: Object as () => QuestionnaireScores,
      default: () => ({})
    },
    teams: {
      type: Array as () => Team[],
      default: () => []
    }
  },

  emits: ['update:modelValue'],

  computed: {
    leaderboard(): LeaderboardEntry[] {
      // Sum station scores
      const stationTotals: Record<string, number> = {}
      this.globalDashboard.forEach((row) => {
        stationTotals[row.team] = row.stations.reduce(
          (acc, s) => acc + s.score,
          0
        )
      })

      // Sum questionnaire scores
      const questTotals: Record<string, number> = {}
      const qs = this.questionnaireScores
      for (const teamName in qs) {
        if (!Object.prototype.hasOwnProperty.call(qs, teamName)) continue
        const stationMap = qs[teamName]
        for (const stationName in stationMap) {
          if (!Object.prototype.hasOwnProperty.call(stationMap, stationName))
            continue
          questTotals[teamName] =
            (questTotals[teamName] || 0) + stationMap[stationName].score
        }
      }

      // Build unsorted entries
      const entries: Omit<LeaderboardEntry, 'rank'>[] = this.teams.map(
        (team) => ({
          team: team.name,
          score:
            (stationTotals[team.name] || 0) + (questTotals[team.name] || 0),
          cancelled: team.cancelled
        })
      )

      // Sort descending by score
      entries.sort((a, b) => b.score - a.score)

      // Assign shared ranks
      let realPos = 0
      let effectiveRank = 0
      let lastScore: number | null = null
      return entries.map((e) => {
        realPos += 1
        if (e.score !== lastScore) effectiveRank = realPos
        lastScore = e.score
        return { ...e, rank: effectiveRank }
      })
    }
  },

  methods: {
    close() {
      this.$emit('update:modelValue', false)
    }
  }
})
</script>
