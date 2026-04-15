<template>
  <div class="imgbox">
    <div v-if="!fullScreen" class="white--text">{{ counter }}</div>
    <div v-if="queuelength" class="white--text">
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
import Vue from 'vue'

export default Vue.extend({
  name: 'LiveImage',
  // liveImageQueue is a reactive array provided by App.vue via Pusher callbacks
  inject: { liveImageQueue: { default: () => [] } },
  created() {
    this.intervalId = window.setInterval(() => {
      this.countdown()
    }, 1000)
  },
  beforeDestroy() {
    window.clearInterval(this.intervalId as number)
  },
  watch: {
    timeout(val: number) {
      this.counter = val
    }
  },
  data() {
    return {
      latestImage: null as any,
      intervalId: null as number | null,
      timeout: 10,
      counter: 10,
      fullScreen: false,
      localQueue: [] as any[]
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
      const queue: any[] = (this as any).liveImageQueue
      if (!queue.length) return
      this.latestImage = queue[0]
      queue.splice(0, 1)
    }
  }
})
</script>
