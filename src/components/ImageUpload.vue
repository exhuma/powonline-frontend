<template>
  <div v-if="tokenIsAvailable">
    <input
      v-show="false"
      @change="sendUpload"
      ref="fileInput"
      type="file"
      name="file"
      accept="image/*;capture=camera"
    />
    <v-btn
      :class="{
        secondary: true,
        'hidden-sm-and-up': fab && isMobile,
        'hidden-xs-only': fab && !isMobile,
        'mobile-margin': fab && isMobile,
        'wide-margin': fab && !isMobile
      }"
      :fab="fab"
      @click="$refs.fileInput.click()"
      ><span class="mr-2" v-if="label">{{ label }}</span
      ><v-icon>mdi-cloud-upload</v-icon></v-btn
    >
  </div>
</template>

<script>
export default {
  name: 'image-upload',
  props: {
    fab: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: ''
    }
  },
  computed: {
    tokenIsAvailable() {
      const token = this.$store.state.jwt
      const result = token !== ''
      return result
    }
  },
  data() {
    return {
      isMobile: false
    }
  },
  methods: {
    sendUpload() {
      this.$emit('uploadStarted')
      this.$remoteProxy
        .sendUpload(this.$refs.fileInput.files[0])
        .then((data) => {
          this.$emit('uploadFinished')
        })
        .catch((e) => {
          console.error(e)
          let message = 'Unknown Error'
          if (e.response.status < 500) {
            message = e.response.data
          }
          this.$emit('uploadFailed', {
            message: message
          })
        })
    },
    onResize() {
      this.isMobile = window.innerWidth < 600
    }
  },
  beforeDestroy() {
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', this.onResize, { passive: true })
  },

  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  }
}
</script>

<style>
.mobile-margin {
  position: fixed !important;
  bottom: 1em;
  right: 1em;
}
.wide-margin {
  position: fixed !important;
  bottom: 5em;
  right: 1em;
}
</style>
