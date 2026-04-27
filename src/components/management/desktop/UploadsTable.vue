<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-image-multiple</v-icon>
      <v-toolbar-title>Upload Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <image-upload
        class="mr-2"
        :fab="false"
        label="Upload"
        @uploadStarted="$emit('upload-started')"
        @uploadFailed="$emit('upload-failed', $event)"
        @uploadFinished="$emit('upload-finished')"
      ></image-upload>
      <v-btn @click="$emit('refresh')">
        <v-icon start>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="files"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.thumbnail="{ item }">
        <v-img
          @click="$emit('open-preview', item)"
          max-height="150"
          :lazy-src="item.tiny"
          :src="item.thumbnail"
          style="cursor: pointer"
        />
      </template>
      <template v-slot:item.name="{ item }">
        <a :href="item.href">{{ item.name }}</a>
      </template>
      <template v-slot:item.actions="{ item }">
        <RowActions>
          <v-list-item
            prepend-icon="mdi-delete-forever"
            title="Delete"
            class="text-error"
            @click="$emit('open-delete', item)"
          />
        </RowActions>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Upload } from '@/remote/model/upload'
import RowActions from '@/components/RowActions.vue'
import ImageUpload from '@/components/ImageUpload.vue'

export default defineComponent({
  name: 'UploadsTable',
  components: { RowActions, ImageUpload },
  props: {
    files: { type: Array as PropType<Upload[]>, required: true },
    loading: { type: Boolean, default: false }
  },
  emits: [
    'refresh',
    'open-preview',
    'open-delete',
    'upload-started',
    'upload-failed',
    'upload-finished'
  ],
  data() {
    return {
      headers: [
        { title: 'Thumbnail', key: 'thumbnail', sortable: false },
        { title: 'User', key: 'username', sortable: true },
        { title: 'File Name', key: 'name', sortable: true },
        { title: 'Upload Time', key: 'when', sortable: true },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      ]
    }
  }
})
</script>
