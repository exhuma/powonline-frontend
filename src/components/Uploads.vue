<template>
  <center-col id="ChangeLog">
    <input v-show="false"
      @change="sendUpload"
      ref="fileInput"
      type="file"
      name="file"
      accept="image/*;capture=camera" />
    <div v-for="(idx, username) in files" :key="username">
      <h1 v-if="username !== 'self'"
        class="white--text">Files for {{username}}</h1>
      <v-list>
        <v-list-tile v-for="file in files[username]" :key="file.href">
          <v-list-tile-avatar>
            <img :src="file.thumbnail" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              <a class="yellow--text" :href="file.href">{{ file.name }}</a>
            </v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn
              icon
              @click="deleteFile(file.uuid)"><v-icon>delete</v-icon></v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </div>
    <v-btn
      @click="refreshImages"
      dark
      >Refresh&nbsp;<v-icon>loop</v-icon></v-btn>
    <v-btn
      @click="$refs.fileInput.click()"
      dark
      >Upload&nbsp;<v-icon>cloud_upload</v-icon></v-btn>
  </center-col>
</template>

<script>

export default {
  created () {
    this.$store.dispatch('refreshUploads')
  },
  computed: {
    files () {
      return this.$store.state.uploads
    }
  },
  methods: {
    refreshImages () {
      this.$store.dispatch('refreshUploads')
    },
    deleteFile (uuid) {
      this.$remoteProxy.deleteFile(uuid)
        .then((data) => {
          this.$emit('snackRequested', {
            message: 'File deleted'
          })
          this.refreshImages()
        })
        .catch((e) => {
          console.error(e)
          this.$emit('snackRequested', {
            'message': 'Unable to delete file',
            'color': 'red'
          })
        })
    },
    sendUpload () {
      this.$emit('changeActivity', {
        visible: true,
        progress: -1,
        text: 'Uploading...'
      })
      this.$remoteProxy.sendUpload(this.$refs.fileInput.files[0])
        .then((data) => {
          this.$emit('snackRequested', {
            message: 'Upload successful'
          })
          this.refreshImages()
          this.$emit('changeActivity', {
            visible: false,
            progress: -1,
            text: ''
          })
        })
        .catch((e) => {
          console.error(e)
          let message = 'Unknown Error'
          if (e.response.status < 500) {
            message = e.response.data
          }
          this.$emit('snackRequested', {
            'message': `Unable to upload image (${message})`,
            'color': 'red'
          })
          this.$emit('changeActivity', {
            visible: false,
            progress: -1,
            text: ''
          })
        })
    }
  }
}
</script>
