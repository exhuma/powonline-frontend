<template>
  <v-container>
    <v-dialog v-model="dialog" fullscreen>
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
                <v-btn color="primary" @click="dialog = false">
                  Close Preview
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table :headers="headers" :items="files">
      <template v-slot:top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <image-upload
            class="mr-1"
            :fab="false"
            label="Upload"
            @uploadStarted="onUploadStarted"
            @uploadFailed="onUploadFailed"
            @uploadFinished="onUploadDone"
          ></image-upload>
          <v-btn class="secondary" @click="refreshImages" dark
            >Refresh&nbsp;<v-icon>mdi-refresh</v-icon></v-btn
          >
        </v-toolbar>
      </template>
      <template v-slot:item="{ item }">
        <tr>
          <td>
            <v-img
              @click="() => openPreview(item)"
              max-height="150"
              :lazy-src="item.tiny"
              :src="item.thumbnail"
            />
          </td>
          <td>{{ item.username }}</td>
          <td>
            <a :href="item.href">{{ item.name }}</a>
          </td>
          <td>{{ item.formattedDate }}</td>
          <td>
            <template v-if="confirmDelete === item.uuid">
              <v-btn icon @click="deleteFile(item.uuid)">
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn icon @click="confirmDelete = ''">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </template>
            <template v-else>
              <v-btn @click="confirmDelete = item.uuid" icon
                ><v-icon>mdi-delete-forever</v-icon></v-btn
              >
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script lang="ts">
import moment from 'moment'
import { type Upload } from '@/remote/model/upload'
import { defineComponent } from 'vue'
import { api } from '@/main'

function sortUploads(uploadsRaw: { [key: string]: Upload[] }): Upload[] {
  return Object.values(uploadsRaw)
    .flat()
    .sort((a, b) => (a.when > b.when ? -1 : a.when < b.when ? 1 : 0))
}

export default defineComponent({
  name: 'Uploads',
  inject: ['getSelectedEventId'],
  async created() {
    await this.refreshImages()
  },
  data() {
    return {
      dialog: false,
      previewImage: { href: '', tiny: '' } as { href: string; tiny: string },
      confirmDelete: '',
      deleteDialogVisible: false,
      uploadsRaw: {} as { [key: string]: Upload[] },
      headers: [
        {
          title: 'Thumbnail',
          key: 'thumbnail',
          sortable: false,
          align: 'left'
        },
        { title: 'User', key: 'username', sortable: true, align: 'left' },
        { title: 'File Name', key: 'name', sortable: true, align: 'left' },
        {
          title: 'Upload Time',
          key: 'formattedDate',
          sortable: true,
          align: 'left'
        },
        { title: 'Actions', key: 'uuid', sortable: false, align: 'left' }
      ]
    }
  },
  computed: {
    files(): Upload[] {
      return sortUploads(this.uploadsRaw) as unknown as Upload[]
    }
  },
  methods: {
    async refreshImages() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        this.uploadsRaw = await api.fetchUploads(eventId)
      } catch (e) {
        console.error('Unable to fetch uploads', e)
      }
    },
    openPreview(image: { href: string; tiny: string }) {
      this.previewImage = image
      this.dialog = true
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
    },
    async deleteFile(uuid: string) {
      this.deleteDialogVisible = false
      const eventId = (this.getSelectedEventId as () => number | null)()
      try {
        await api.deleteFile(uuid, eventId)
        this.$emit('snackRequested', { message: 'File deleted' })
        this.refreshImages()
        this.confirmDelete = ''
      } catch (e) {
        console.error(e)
        this.$emit('snackRequested', {
          message: 'Unable to delete file',
          color: 'red'
        })
        this.confirmDelete = ''
      }
    }
  }
})
</script>
