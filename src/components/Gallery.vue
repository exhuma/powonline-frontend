<template>
  <div class="text-xs-center">
    <v-alert v-if="images.length === 0" outlined text type="info" elevation="2">
      <p><strong>No images yet.</strong></p>
      <p>Click on the upload button on the bottom right to add new images.</p>
    </v-alert>
    <LightBox :media="media" :showLightBox="false" ref="lightBox"></LightBox>
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
import LightBox from 'vue-it-bigger'
import('vue-it-bigger/dist/vue-it-bigger.min.css')
import Vue from 'vue'
const Gallery = Vue.extend({
  created() {
    this.refreshImages()
  },
  components: {
    LightBox
  },
  data() {
    return {
      index: null,
      showUploadSnack: true
    }
  },
  methods: {
    showLightbox(index) {
      this.$refs.lightBox.showImage(index)
    },
    refreshImages() {
      this.$store.dispatch('refreshGallery')
    },
    onUploadStarted() {
      this.$emit('changeActivity', {
        visible: true,
        progress: -1,
        text: 'Uploading...'
      })
    },
    onUploadDone() {
      this.$emit('snackRequested', {
        message: 'Upload successful'
      })
      this.refreshImages()
      this.$emit('changeActivity', {
        visible: false,
        progress: -1,
        text: ''
      })
    },
    onUploadFailed(event) {
      this.$emit('snackRequested', {
        message: `Unable to upload image (${event.message})`,
        color: 'red'
      })
      this.$emit('changeActivity', {
        visible: false,
        progress: -1,
        text: ''
      })
    }
  },
  computed: {
    images() {
      return this.$store.state.gallery
    },
    media() {
      const output = this.$store.state.gallery.map((item) => {
        return {
          type: 'image',
          thumb: item.thumbnail,
          src: item.href,
          caption: ''
        }
      })
      return output
    },
    tokenIsAvailable() {
      const token = this.$store.state.jwt
      const result = token !== ''
      return result
    }
  }
})
export default Gallery
</script>
