<template>
  <div v-if="tokenIsAvailable">
    <input
      v-show="false"
      @change="sendUpload"
      ref="fileInput"
      type="file"
      name="file"
      accept="image/*;capture=camera"
    />
    <v-btn
      :class="{
        secondary: true,
        'hidden-sm-and-up': fab && isMobile,
        'hidden-xs-only': fab && !isMobile,
        'mobile-margin': fab && isMobile,
        'wide-margin': fab && !isMobile
      }"
      :fab="fab"
      @click="triggerFileInput()"
      ><span class="mr-2" v-if="label">{{ label }}</span
      ><v-icon>mdi-cloud-upload</v-icon></v-btn
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { Session } from '@/App.vue'

const ImageUpload = defineComponent({
  name: 'image-upload',
  inject: ['session', 'getSelectedEventId'],
  props: {
    fab: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: ''
    }
  },
  computed: {
    tokenIsAvailable(): boolean {
      const session = this.session as Session
      return Boolean(session.userName)
    }
  },
  data() {
    return {
      isMobile: false
    }
  },
  methods: {
    triggerFileInput() {
      ;(this.$refs.fileInput as HTMLElement).click()
    },
    async sendUpload() {
      this.$emit('uploadStarted')
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) {
        this.$emit('uploadFailed', { message: 'No event selected' })
        return
      }
      const input = this.$refs.fileInput as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      try {
        await api.sendUpload(file, eventId)
        this.$emit('uploadFinished')
      } catch (e: any) {
        console.error(e)
        let message = 'Unknown Error'
        if (e?.response?.status < 500) {
          message = e.response.data
        }
        this.$emit('uploadFailed', { message })
      }
    },
    onResize() {
      this.isMobile = window.innerWidth < 600
    }
  },
  beforeUnmount() {
    if (typeof window === 'undefined') return
    window.removeEventListener('resize', this.onResize)
  },

  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize, { passive: true })
  }
})
export default ImageUpload
</script>

<style>
.mobile-margin {
  position: fixed !important;
  bottom: 1em;
  right: 1em;
}
.wide-margin {
  position: fixed !important;
  bottom: 5em;
  right: 1em;
}
</style>
