<template>
  <div id="Uploads">
    <v-container>
      <v-row>
        <v-col cols="12">
          <UploadsTable
            v-if="!$vuetify.display.smAndDown"
            :files="files"
            :loading="loading"
            @refresh="refreshImages"
            @open-preview="openPreview"
            @open-delete="confirmDelete"
            @upload-started="onUploadStarted"
            @upload-failed="onUploadFailed"
            @upload-finished="onUploadDone"
          />
          <UploadsCards
            v-else
            :files="files"
            :loading="loading"
            @refresh="refreshImages"
            @open-preview="openPreview"
            @open-delete="confirmDelete"
            @upload-started="onUploadStarted"
            @upload-failed="onUploadFailed"
            @upload-finished="onUploadDone"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Image preview dialog -->
    <v-dialog v-model="previewDialog" fullscreen>
      <v-card>
        <v-card-text>
          <v-container>
            <v-row align="center" justify="center">
              <v-col cols="12">
                <v-img
                  style="margin: auto"
                  :src="previewImage.href"
                  :lazy-src="previewImage.tiny"
                  max-width="100vh"
                  max-height="100vh"
                ></v-img>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-container>
            <v-row align="center" justify="center">
              <v-col>
                <v-btn target="_blank" :href="previewImage.href">
                  <v-icon start>mdi-open-in-new</v-icon>
                  Open Image in new Tab
                </v-btn>
                <v-btn color="primary" @click="previewDialog = false">
                  Close Preview
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete File</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ deletingFile && deletingFile.name }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { type Upload } from '@/remote/model/upload'
import { defineComponent } from 'vue'
import { api } from '@/main'
import UploadsTable from '@/components/management/desktop/UploadsTable.vue'
import UploadsCards from '@/components/management/mobile/UploadsCards.vue'

function sortUploads(uploadsRaw: { [key: string]: Upload[] }): Upload[] {
  return Object.values(uploadsRaw)
    .flat()
    .sort((a, b) => (a.when > b.when ? -1 : a.when < b.when ? 1 : 0))
}

export default defineComponent({
  name: 'Uploads',
  components: { UploadsTable, UploadsCards },
  inject: ['getSelectedEventId'],

  data() {
    return {
      loading: false,
      previewDialog: false,
      showDeleteDialog: false,
      previewImage: { href: '', tiny: '' } as { href: string; tiny: string },
      deletingFile: null as Upload | null,
      uploadsRaw: {} as { [key: string]: Upload[] }
    }
  },

  computed: {
    files(): Upload[] {
      return sortUploads(this.uploadsRaw) as unknown as Upload[]
    }
  },

  async mounted() {
    await this.refreshImages()
  },

  methods: {
    async refreshImages() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      this.loading = true
      try {
        this.uploadsRaw = await api.fetchUploads(eventId)
      } catch (e) {
        console.error('Unable to fetch uploads', e)
      } finally {
        this.loading = false
      }
    },
    openPreview(image: { href: string; tiny: string }) {
      this.previewImage = image
      this.previewDialog = true
    },
    confirmDelete(file: Upload) {
      this.deletingFile = file
      this.showDeleteDialog = true
    },
    async doDelete() {
      this.showDeleteDialog = false
      if (!this.deletingFile) return
      const eventId = (this.getSelectedEventId as () => number | null)()
      try {
        await api.deleteFile((this.deletingFile as any).uuid, eventId)
        this.$emit('snackRequested', { message: 'File deleted' })
        await this.refreshImages()
      } catch (e) {
        console.error(e)
        this.$emit('snackRequested', {
          message: 'Unable to delete file',
          color: 'red'
        })
      }
      this.deletingFile = null
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
