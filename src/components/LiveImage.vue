<template>
  <div class="imgbox">
    <div class="white--text">{{ counter }}</div>
    <div v-if="this.queuelength" class="white--text">{{queuelength}} images in queue</div>
    <img v-if="latestImage" class="center-fit" :src="latestImage.href" />
    <v-slider label="Timeout (s)" thumb-label ticks min="1" max="30" v-model="timeout"></v-slider>
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
</style>

<script>
export default {
  created () {
    this.intervalId = setInterval(() => {
      this.countdown()
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.intervalId)
  },
  watch: {
    timeout: function (val) {
      this.counter = val
    }
  },
  data () {
    return {
      latestImage: null,
      intervalId: null,
      timeout: 10,
      counter: 10
    }
  },
  computed: {
    queuelength () {
      return this.$store.state.liveImageQueue.length
    }
  },
  methods: {
    countdown () {
      this.counter -= 1
      if (this.counter === 0) {
        this.loadNextImage()
        this.counter = this.timeout
      }
    },
    loadNextImage () {
      if (!this.$store.state.liveImageQueue.length) {
        return
      }
      let nextImage = this.$store.state.liveImageQueue[0]
      this.latestImage = nextImage
      this.$store.commit('consumeImage')
    }
  }
}
</script>
