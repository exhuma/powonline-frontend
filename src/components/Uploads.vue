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
            <img :src="file.tiny" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>
              <a class="yellow--text" :href="file.href">{{ file.name }}</a>
            </v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-dialog v-model="deleteDialogVisible" hide-overlay max-width="40em">
              <v-btn
                slot="activator"
                @click.native="promptDelete(file)"
                icon><v-icon>delete</v-icon></v-btn>
              <v-card>
                <v-card-title><slot name="title">Confirm Action</slot></v-card-title>
                <v-card-text>
                  <slot name="text">
                    Do you want to delete the file
                    <img :src="selectedFile.thumbnail" />
                  </slot>
                </v-card-text>
                <v-card-actions>
                  <v-spacer />
                  <v-btn flat @click.native="cancelDelete">No</v-btn>
                  <v-btn class="error" @click.native="deleteFile(selectedFile)">Yes</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

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
  data () {
    return {
      selectedFile: {},
      deleteDialogVisible: false
    }
  },
  computed: {
    files () {
      return this.$store.state.uploads
    }
  },
  methods: {
    promptDelete (file) {
      this.selectedFile = file
      this.deleteDialogVisible = true
    },
    cancelDelete () {
      this.selectedFile = {}
      this.deleteDialogVisible = false
    },
    refreshImages () {
      this.$store.dispatch('refreshUploads')
    },
    deleteFile (file) {
      this.selectedFile = {}
      this.deleteDialogVisible = false
      this.$remoteProxy.deleteFile(file.uuid)
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
