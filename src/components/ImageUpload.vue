<template>
    <span v-if="tokenIsAvailable">
      <input v-show="false"
        @change="sendUpload"
        ref="fileInput"
        type="file"
        name="file"
        accept="image/*;capture=camera" />
      <v-btn
        class="secondary"
        @click="$refs.fileInput.click()"
        >Upload&nbsp;<v-icon>mdi-cloud-upload</v-icon></v-btn>
    </span>
</template>

<script>
export default {
  name: 'image-upload',
  computed: {
    tokenIsAvailable () {
      const token = this.$store.state.jwt
      const result = token !== ''
      return result
    }
  },
  methods: {
    sendUpload () {
      this.$emit('uploadStarted')
      this.$remoteProxy.sendUpload(this.$refs.fileInput.files[0])
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
            'message': message
          })
        })
    }
  }
}
</script>
