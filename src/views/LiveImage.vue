<template>
  <div class="imgbox">
    <div v-if="!fullScreen" class="text-white">{{ counter }}</div>
    <div v-if="queuelength" class="text-white">
      {{ queuelength }} images in queue
    </div>
    <img v-if="latestImage" class="center-fit" :src="latestImage.href" />
    <v-slider
      v-if="!fullScreen"
      label="Timeout (s)"
      thumb-label
      ticks
      min="1"
      max="30"
      v-model="timeout"
    ></v-slider>
    <v-btn v-if="!fullScreen" class="fab-high" fab @click="toggleFullScreen"
      ><v-icon>mdi-fullscreen</v-icon></v-btn
    >
    <v-btn v-else class="fab-low" fab @click="toggleFullScreen"
      ><v-icon>mdi-fullscreen-exit</v-icon></v-btn
    >
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
.imgbox {
  display: grid;
  height: 100%;
}
.center-fit {
  max-width: 100%;
  max-height: 100;
  margin: auto;
}
.fab-high {
  position: absolute;
  bottom: 75px;
  right: 25px;
}
.fab-low {
  position: absolute;
  bottom: 25px;
  right: 25px;
}
</style>

<script lang="ts">
import { defineComponent, watch } from 'vue'
import { lastFileAdded, lastFileDeleted } from '@/composables/useRealtimeStream'
import type { FileAddedPayload } from '@/composables/useRealtimeStream'

export default defineComponent({
  name: 'LiveImage',
  setup() {
    return { lastFileAdded, lastFileDeleted }
  },
  created() {
    this.intervalId = window.setInterval(() => {
      this.countdown()
    }, 1000)

    // SSE: enqueue new files as they arrive
    watch(lastFileAdded, (payload) => {
      if (payload) {
        ;(this as any).liveImageQueue.push(payload)
      }
    })

    // SSE: remove deleted file from queue
    watch(lastFileDeleted, (payload) => {
      if (payload) {
        const queue: FileAddedPayload[] = (this as any).liveImageQueue
        const idx = queue.findIndex((f) => f.uuid === payload.id)
        if (idx !== -1) queue.splice(idx, 1)
      }
    })
  },
  beforeUnmount() {
    window.clearInterval(this.intervalId as number)
  },
  watch: {
    timeout(val: number) {
      this.counter = val
    }
  },
  data() {
    return {
      latestImage: null as FileAddedPayload | null,
      intervalId: null as number | null,
      timeout: 10,
      counter: 10,
      fullScreen: false,
      liveImageQueue: [] as FileAddedPayload[]
    }
  },
  computed: {
    queuelength(): number {
      return (this as any).liveImageQueue.length
    }
  },
  methods: {
    toggleFullScreen() {
      this.$emit('fullScreenRequested', !this.fullScreen)
      this.fullScreen = !this.fullScreen
    },
    countdown() {
      this.counter -= 1
      if (this.counter === 0) {
        this.loadNextImage()
        this.counter = this.timeout
      }
    },
    loadNextImage() {
      const queue: FileAddedPayload[] = (this as any).liveImageQueue
      if (!queue.length) return
      this.latestImage = queue[0]
      queue.splice(0, 1)
    }
  }
})
</script>
