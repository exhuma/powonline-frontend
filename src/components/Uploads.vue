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
      <v-dialog width="250px" v-model="processActive">
        <v-card>
          <v-card-title primary-title>
            <h2>Uploading</h2>
          </v-card-title>
          <v-card-text>
            <v-progress-linear :indeterminate="progress === -1"
              v-model="progress"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
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
import EventBus from '@/eventBus'

export default {
  created () {
    this.$store.dispatch('refreshUploads')
  },
  mounted () {
    EventBus.$on('fileUploadProgress', (payload) => {
      this.progress = payload
    })
  },
  data () {
    return {
      processActive: false,
      progress: -1
    }
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
      this.processActive = true
      this.$remoteProxy.sendUpload(this.$refs.fileInput.files[0])
        .then((data) => {
          this.$emit('snackRequested', {
            message: 'Upload successful'
          })
          this.refreshImages()
          this.processActive = false
        })
        .catch((e) => {
          console.error(e)
          this.$emit('snackRequested', {
            'message': 'Unable to upload image',
            'color': 'red'
          })
          this.processActive = false
        })
    }
  }
}
</script>
