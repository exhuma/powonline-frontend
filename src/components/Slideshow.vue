<template>
  <v-container>
    <v-img contain :src="currentImage.href"></v-img>
  </v-container>
</template>

<script>
export default {
  name: 'Slideshow',
  methods: {
    startAutoRefresh() {
      if (this.auto_refresh_interval_seconds > 0) {
        this.refreshId = window.setInterval(this.autoRefreshTick, 1000)
      }
    },
    autoRefreshTick() {
      const tickPercent = 100.0 / this.auto_refresh_interval_seconds
      this.pctUntilNextRefresh -= tickPercent
      this.$emit('refresh-progress-updated', {
        progress: this.pctUntilNextRefresh
      })
      if (this.pctUntilNextRefresh <= 0) {
        this.advanceToNextImage()
        this.pctUntilNextRefresh = 100.0
      }
    },
    async advanceToNextImage() {
      this.currentImageIndex += 1
      if (this.currentImageIndex > this.images.length - 1) {
        await this.updateImages()
      }
      this.currentImage = this.images[this.currentImageIndex]
    },
    stopAutoRefresh() {
      if (this.refreshId) {
        window.clearInterval(this.refreshId)
        this.$emit('refresh-progress-updated', { progress: 0.0 })
      }
    },
    async updateImages() {
      const images = await this.$remoteProxy.getPublicImages()
      this.images = images
      this.currentImageIndex = 0
      this.currentImage = images[0]
    }
  },
  async created() {
    await this.updateImages()
    this.auto_refresh_interval_seconds = Number.parseInt(
      this.$route.query.timeout || 10,
      10
    )
    this.startAutoRefresh()
    this.$emit('fullScreenRequested', true)
  },
  data() {
    return {
      images: [],
      currentImage: '',
      pctUntilNextRefresh: 100.0,
      auto_refresh_interval_seconds: 10
    }
  }
}
</script>
