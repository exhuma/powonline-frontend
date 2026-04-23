<template>
  <!--
    RouteTrack — SVG segment track for one team on one route.

    Each station is rendered as an equal-width rectangle.
    States:
      finished    → solid fill (route colour)
      arrived     → lighter fill + pulse animation
      unknown     → dark translucent background
      unreachable → strikethrough overlay (diagonal line)

    Station names are exposed as <title> tooltips on hover (for staff).
  -->
  <svg
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    role="img"
    :aria-label="ariaLabel"
    class="route-track"
  >
    <g v-for="(seg, i) in segments" :key="seg.stationName">
      <!-- Background slot -->
      <rect
        :x="segX(i) + GAP / 2"
        :y="0"
        :width="segW - GAP"
        :height="height"
        :rx="RADIUS"
        class="seg-bg"
      />

      <!-- State fill -->
      <rect
        :x="segX(i) + GAP / 2"
        :y="0"
        :width="segW - GAP"
        :height="height"
        :rx="RADIUS"
        :fill="segFill(seg.state)"
        :class="['seg-fill', seg.state === 'arrived' ? 'seg-arrived' : '']"
        :opacity="cancelled ? 0.3 : 1"
      />

      <!-- Unreachable: diagonal strike -->
      <line
        v-if="seg.state === 'unreachable'"
        :x1="segX(i) + GAP / 2 + 2"
        :y1="height - 2"
        :x2="segX(i) + segW - GAP / 2 - 2"
        :y2="2"
        stroke="rgba(255,255,255,0.55)"
        stroke-width="1.5"
        stroke-linecap="round"
      />

      <!-- Tooltip -->
      <title>{{ seg.stationName }}</title>
    </g>
  </svg>
</template>

<style scoped>
.route-track {
  display: block;
  overflow: visible;
}

.seg-bg {
  fill: rgba(255, 255, 255, 0.08);
}

.seg-fill {
  transition: fill 0.45s ease, opacity 0.45s ease;
}

@keyframes arrived-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.seg-arrived {
  animation: arrived-pulse 2s ease-in-out infinite;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export interface TrackSegment {
  stationName: string
  state: 'unknown' | 'arrived' | 'finished' | 'unreachable'
  score: number
}

const SEGMENT_HEIGHT = 24
const GAP = 4
const RADIUS = 3

export default defineComponent({
  name: 'RouteTrack',

  props: {
    /** Ordered segments — index 0 is first station. */
    segments: {
      type: Array as () => TrackSegment[],
      required: true
    },
    /** Route colour — used for finished/arrived fills. */
    color: {
      type: String,
      default: '#4caf50'
    },
    /** Total pixel width of the track. */
    width: {
      type: Number,
      default: 300
    },
    /** Pixel height of the track. */
    height: {
      type: Number,
      default: SEGMENT_HEIGHT
    },
    /** Whether this team is cancelled (desaturates fills). */
    cancelled: {
      type: Boolean,
      default: false
    },
    /** Team name — used in aria-label. */
    teamName: {
      type: String,
      default: ''
    }
  },

  setup() {
    return { GAP, RADIUS }
  },

  computed: {
    segW(): number {
      if (this.segments.length === 0) return 0
      return this.width / this.segments.length
    },
    ariaLabel(): string {
      const finished = this.segments.filter(
        (s) => s.state === 'finished'
      ).length
      const arrived = this.segments.filter((s) => s.state === 'arrived').length
      const total = this.segments.length
      return (
        `${this.teamName}: ${finished} of ${total} stations finished` +
        (arrived > 0 ? `, ${arrived} in progress` : '')
      )
    }
  },

  methods: {
    segX(index: number): number {
      return index * this.segW
    },

    segFill(state: string): string {
      if (this.cancelled) return '#555'
      switch (state) {
        case 'finished':
          return this.color
        case 'arrived':
          return this.color + 'aa'
        case 'unreachable':
          return 'rgba(255,255,255,0.06)'
        case 'unknown':
        default:
          return 'rgba(255,255,255,0.08)'
      }
    }
  }
})
</script>
