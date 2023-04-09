<template>
  <center-col id="ChangeLog">
    <image-upload
      @uploadStarted="onUploadStarted"
      @uploadFailed="onUploadFailed"
      @uploadFinished="onUploadDone"></image-upload>
    <v-btn
      @click="refreshImages"
      dark
      >Refresh&nbsp;<v-icon>loop</v-icon></v-btn>
    <div v-for="(idx, username) in files" :key="username">
      <h1 v-if="username !== 'self'"
        class="white--text">Files for {{username}}</h1>
      <v-list>
        <v-list-tile v-for="file in files[username]" :key="file.href">
          <v-list-tile-avatar>
            <img :src="file.tiny" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              <a class="yellow--text" :href="file.href">{{ file.name }}</a>
            </v-list-tile-title>
          </v-list-tile-content>
          <template v-if="confirmDelete === file.uuid">
            <v-list-tile-action>
              <v-btn icon @click.native="deleteFile(file.uuid)">
                <v-icon>check</v-icon>
              </v-btn>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn icon @click.native="confirmDelete = ''">
                <v-icon>clear</v-icon>
              </v-btn>
            </v-list-tile-action>
          </template>
          <template v-else>
            <v-list-tile-action>
              <v-btn
                @click.native="confirmDelete = file.uuid"
                icon><v-icon>delete</v-icon></v-btn>
            </v-list-tile-action>
          </template>
        </v-list-tile>
      </v-list>
    </div>
  </center-col>
</template>

<script>

export default {
  created () {
    this.$store.dispatch('refreshUploads')
  },
  data () {
    return {
      confirmDelete: ''
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
    },
    deleteFile (uuid) {
      this.deleteDialogVisible = false
      this.$remoteProxy.deleteFile(uuid)
        .then((data) => {
          this.$emit('snackRequested', {
            message: 'File deleted'
          })
          this.refreshImages()
          this.confirmDelete = ''
        })
        .catch((e) => {
          console.error(e)
          this.$emit('snackRequested', {
            'message': 'Unable to delete file',
            'color': 'red'
          })
          this.confirmDelete = ''
        })
    }
  }
}
</script>
