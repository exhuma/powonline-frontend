<template>
  <v-container>
    <v-dialog v-model="dialog" fullscreen>
      <v-card>
        <v-card-text>
          <v-container>
            <v-layout row align-center justify-center>
              <v-flex xs12>
                <v-img
                  style="margin: auto;"
                  :src="previewImage.href"
                  :lazy-src="previewImage.tiny"
                  max-width="100vh"
                  max-height="100vh"
                ></v-img>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-container>
            <v-layout row align-center justify-center>
              <v-flex>
                <v-btn target="_blank" :href="previewImage.href">
                  <v-icon left>mdi-open-in-new</v-icon>
                  Open Image in new Tab
                </v-btn>
                <v-btn color="primary" @click="dialog = false">
                  Close Preview
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="files">
      <template v-slot:top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <image-upload
            class="mr-1"
            :fab="false"
            label="Upload"
            @uploadStarted="onUploadStarted"
            @uploadFailed="onUploadFailed"
            @uploadFinished="onUploadDone"></image-upload>
          <v-btn
            class="secondary"
            @click="refreshImages"
            dark
            >Refresh&nbsp;<v-icon>mdi-refresh</v-icon></v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item="props">
        <tr>
          <td><v-img @click="() => openPreview(props.item)"
            max-height="150"
            :lazy-src="props.item.tiny"
            :src="props.item.thumbnail" /></td>
          <td>{{ props.item.username }}</td>
          <td><a :href="props.item.href">{{ props.item.name }}</a></td>
          <td>{{ props.item.formattedDate }}</td>
          <td>
            <template v-if="confirmDelete === props.item.uuid">
              <v-btn icon @click.native="deleteFile(props.item.uuid)">
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn icon @click.native="confirmDelete = ''">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                @click.native="confirmDelete = props.item.uuid"
                icon><v-icon>mdi-delete-forever</v-icon></v-btn>
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import moment from 'moment'

/**
 * Flatten the upload data and sort it by time
 */
function sortUploads (uploads) {
  if (!uploads) {
    return []
  }
  let allImages = []
  Object.entries(uploads).forEach(([username, files]) => {
    files.map(file => { file.username = username })
    allImages = allImages.concat(files)
  })
  allImages.map(item => {
    item.parsedDate = new Date(item.when)
    item.formattedDate = formatTs(item.parsedDate)
  })
  allImages.sort((a, b) => a.parsedDate < b.parsedDate)
  console.log(allImages)
  return allImages
}

function formatTs (ts) {
  let obj = moment(ts)
  let now = moment()
  var duration = moment.duration(now.diff(obj))
  if (duration.asHours() > 5) {
    return obj.format('YYYY-MM-DD HH:mm:ss')
  }
  return obj.fromNow()
}

export default {
  created () {
    this.$store.dispatch('refreshUploads')
  },
  data () {
    return {
      dialog: false,
      previewImage: {href: '', tiny: ''},
      confirmDelete: '',
      headers: [
        {text: 'Thumbnail', sortable: false, align: 'left'},
        {text: 'User', sortable: true, align: 'left'},
        {text: 'File Name', sortable: true, align: 'left'},
        {text: 'Upload Time', sortable: true, align: 'left'},
        {text: 'Actions', sortable: false, align: 'left'}
      ]
    }
  },
  computed: {
    files () {
      let groupedData = this.$store.state.uploads
      let flattened = sortUploads(groupedData)
      return flattened
    }
  },
  methods: {
    refreshImages () {
      this.$store.dispatch('refreshUploads')
    },
    openPreview (image) {
      this.previewImage = image
      this.dialog = true
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
