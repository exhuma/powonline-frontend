<template>
  <div class="text-xs-center">
    <v-alert v-if="images.length === 0" outlined text type="info" elevation="2">
      <p><strong>No images yet.</strong></p>
      <p>Click on the upload button on the bottom right to add new images.</p>
    </v-alert>
    <VueEasyLightbox
      :visible="lightboxVisible"
      :imgs="lightboxImgs"
      :index="lightboxIndex"
      @hide="lightboxVisible = false"
    />
    <v-img
      class="image"
      v-for="(image, imageIndex) in images"
      :key="imageIndex"
      :src="image.thumbnail"
      :lazy-src="image.thumbnail"
      @click="() => showLightbox(imageIndex)"
    ></v-img>
    <br clear="both" />
    <v-container v-if="tokenIsAvailable">
      <image-upload
        @uploadStarted="onUploadStarted"
        @uploadFailed="onUploadFailed"
        @uploadFinished="onUploadDone"
      ></image-upload>
    </v-container>

    <v-snackbar
      v-if="!tokenIsAvailable"
      top
      absolute
      color="blue"
      timeout="5000"
      v-model="showUploadSnack"
    >
      <v-icon>mdi-information</v-icon>
      <strong>Tip:</strong> Login to upload
    </v-snackbar>
  </div>
</template>

<style scoped>
.image {
  float: left;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  border: 1px solid #ebebeb;
  margin: 5px;
  cursor: pointer;
}
</style>

<script lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox'
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { Session } from '@/App.vue'

export default defineComponent({
  name: 'Gallery',
  components: { VueEasyLightbox },
  inject: ['session', 'getSelectedEventId'],
  created() {
    this.refreshImages()
  },
  data() {
    return {
      images: [] as { href: string; thumbnail: string }[],
      showUploadSnack: true,
      lightboxVisible: false,
      lightboxIndex: 0
    }
  },
  computed: {
    tokenIsAvailable(): boolean {
      return Boolean((this.session as Session).userName)
    },
    lightboxImgs(): string[] {
      return this.images.map((item) => item.href)
    }
  },
  methods: {
    showLightbox(index: number) {
      this.lightboxIndex = index
      this.lightboxVisible = true
    },
    async refreshImages() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        this.images = (await api.getPublicImages(eventId)) as {
          href: string
          thumbnail: string
        }[]
      } catch (e) {
        console.error('Unable to fetch gallery images', e)
      }
    },
    onUploadStarted() {
      this.$emit('changeActivity', {
        visible: true,
        progress: -1,
        text: 'Uploading...'
      })
    },
    onUploadDone() {
      this.$emit('snackRequested', { message: 'Upload successful' })
      this.refreshImages()
      this.$emit('changeActivity', { visible: false, progress: -1, text: '' })
    },
    onUploadFailed(event: { message: string }) {
      this.$emit('snackRequested', {
        message: `Unable to upload image (${event.message})`,
        color: 'red'
      })
      this.$emit('changeActivity', { visible: false, progress: -1, text: '' })
    }
  }
})
</script>
