<template>
  <v-container>
    <v-img contain :src="currentImage ? currentImage.href : ''"></v-img>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'

export default defineComponent({
  name: 'Slideshow',
  inject: ['getSelectedEventId'],
  data() {
    return {
      images: [] as { href: string }[],
      currentImage: null as { href: string } | null,
      pctUntilNextRefresh: 100.0,
      auto_refresh_interval_seconds: 10,
      currentImageIndex: 0,
      refreshId: null as number | null
    }
  },
  async created() {
    await this.updateImages()
    // Fix the original bug: use the value, not `typeof` the value
    const raw = this.$route.query.timeout
    const timeoutStr = Array.isArray(raw) ? raw[0] : raw
    this.auto_refresh_interval_seconds = Number.parseInt(
      (timeoutStr as string) || '10',
      10
    )
    this.startAutoRefresh()
    this.$emit('fullScreenRequested', true)
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
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
      this.currentImage = this.images[this.currentImageIndex] || null
    },
    stopAutoRefresh() {
      if (this.refreshId !== null) {
        window.clearInterval(this.refreshId)
        this.$emit('refresh-progress-updated', { progress: 0.0 })
      }
    },
    async updateImages() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        const images = (await api.getPublicImages(eventId)) as {
          href: string
        }[]
        this.images = images
        this.currentImageIndex = 0
        this.currentImage = images[0] || null
      } catch (e) {
        console.error('Unable to fetch images for slideshow', e)
      }
    }
  }
})
</script>
