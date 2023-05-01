<template>
  <div class="text-xs-center">
    <v-container v-if="tokenIsAvailable">
      <image-upload
        @uploadStarted="onUploadStarted"
        @uploadFailed="onUploadFailed"
        @uploadFinished="onUploadDone"></image-upload>
    </v-container>
    <gallery :images="images" :index="index" @close="index = null"></gallery>
    <v-img
      class="image"
      v-for="(image, imageIndex) in images"
      :key="imageIndex"
      :src="image.thumbnail"
      :lazy-src="image.thumbnail"
      @click="index = imageIndex"
    >
    </v-img>
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
  }
</style>

<script>
import VueGallery from 'vue-gallery'
export default {

  created () {
    this.refreshImages()
  },
  components: {
    'gallery': VueGallery
  },
  data () {
    return {
      index: null,
      showUploadSnack: true
    }
  },
  methods: {
    refreshImages () {
      this.$store.dispatch('refreshGallery')
    },
    onUploadStarted () {
      this.$emit('changeActivity', {
        visible: true,
        progress: -1,
        text: 'Uploading...'
      })
    },
    onUploadDone () {
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
    onUploadFailed (event) {
      this.$emit('snackRequested', {
        'message': `Unable to upload image (${event.message})`,
        'color': 'red'
      })
      this.$emit('changeActivity', {
        visible: false,
        progress: -1,
        text: ''
      })
    }
  },
  computed: {
    images () {
      console.log(this.$store.state.gallery)
      return this.$store.state.gallery
    },
    tokenIsAvailable () {
      const token = this.$store.state.jwt
      const result = token !== ''
      return result
    }
  }
}
</script>
