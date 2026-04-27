<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-image-multiple</v-icon>
          <span class="text-h6">Uploads</span>
          <v-spacer />
          <image-upload
            class="mr-2"
            :fab="false"
            label="Upload"
            @uploadStarted="$emit('upload-started')"
            @uploadFailed="$emit('upload-failed', $event)"
            @uploadFinished="$emit('upload-finished')"
          ></image-upload>
          <v-btn size="small" @click="$emit('refresh')">
            <v-icon start>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-row dense class="pa-2">
      <v-col v-for="file in files" :key="file.uuid" cols="6" sm="4">
        <v-card>
          <v-img
            :src="file.thumbnail"
            :lazy-src="file.tiny"
            aspect-ratio="1"
            cover
            style="cursor: pointer"
            @click="$emit('open-preview', file)"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular indeterminate color="grey-lighten-4" />
              </div>
            </template>
          </v-img>
          <v-card-text class="pa-2">
            <div class="text-caption text-truncate">
              <a :href="file.href">{{ file.name }}</a>
            </div>
            <div class="text-caption text-disabled">{{ file.username }}</div>
          </v-card-text>
          <v-card-actions class="pa-1">
            <v-spacer />
            <v-btn
              icon
              size="small"
              color="error"
              variant="text"
              @click="$emit('open-delete', file)"
            >
              <v-icon>mdi-delete-forever</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div
      v-if="!loading && files.length === 0"
      class="text-center text-disabled pa-8"
    >
      No uploads found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Upload } from '@/remote/model/upload'
import ImageUpload from '@/components/ImageUpload.vue'

export default defineComponent({
  name: 'UploadsCards',
  components: { ImageUpload },
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
  ]
})
</script>
