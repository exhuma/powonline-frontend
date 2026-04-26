<template>
  <v-dialog v-model="dialog" max-width="560px" persistent>
    <v-card>
      <v-card-title class="bg-primary text-white">
        <v-icon dark class="mr-2">mdi-calendar-edit</v-icon>
        {{ isEditMode ? 'Edit Event' : 'Create Event' }}
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" v-model="formValid">
          <v-text-field
            v-model="form.name"
            label="Event Name"
            required
            outlined
            :rules="[(v) => !!v || 'Event name is required']"
            class="mb-2"
          ></v-text-field>

          <v-text-field
            v-model="form.title"
            label="Site Title (browser tab, optional)"
            outlined
            clearable
            hint="Displayed as the browser tab title when the site is accessed via a linked domain."
            persistent-hint
            class="mb-2"
          ></v-text-field>

          <v-divider class="mb-4"></v-divider>

          <!-- Favicon upload -->
          <div class="text-subtitle2 mb-2">Favicon (optional)</div>
          <div class="d-flex align-center mb-2">
            <img
              v-if="faviconPreviewUrl"
              :src="faviconPreviewUrl"
              alt="favicon preview"
              style="
                width: 32px;
                height: 32px;
                object-fit: contain;
                margin-right: 12px;
                border: 1px solid #ccc;
                border-radius: 4px;
              "
            />
            <v-icon v-else style="margin-right: 12px" color="grey"
              >mdi-image-off</v-icon
            >
            <v-btn
              variant="outlined"
              size="small"
              @click="triggerFaviconPicker"
            >
              {{ faviconPreviewUrl ? 'Replace' : 'Upload' }} .ico / .png
            </v-btn>
            <v-btn
              v-if="faviconPreviewUrl"
              variant="text"
              size="small"
              color="error"
              class="ml-2"
              @click="removeFavicon"
            >
              Remove
            </v-btn>
            <input
              ref="faviconInput"
              type="file"
              accept=".ico,.png"
              style="display: none"
              @change="onFaviconSelected"
            />
          </div>
          <div v-if="faviconError" class="text-caption text-error mb-2">
            {{ faviconError }}
          </div>

          <v-divider class="mb-4"></v-divider>
          <div class="text-subtitle2 mb-2">Start Date / Time</div>
          <DateTimePicker
            label="Start"
            :timeValue="form.startDateTime"
            @timeValueChanged="form.startDateTime = $event"
          />

          <v-divider class="my-4"></v-divider>
          <div class="text-subtitle2 mb-2">End Date / Time</div>
          <DateTimePicker
            label="End"
            :timeValue="form.endDateTime"
            @timeValueChanged="form.endDateTime = $event"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          :disabled="!formValid || saving"
          :loading="saving"
          @click="saveEvent"
        >
          {{ isEditMode ? 'Update' : 'Create' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import moment from 'moment'
import type { EventInfo } from '@/api'
import { api } from '@/main'
import DateTimePicker from './DateTimePicker.vue'

export default defineComponent({
  name: 'EventDialog',
  components: { DateTimePicker },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    event: {
      type: Object as () => EventInfo | null,
      default: null
    }
  },
  data() {
    return {
      dialog: false,
      formValid: false,
      saving: false,
      faviconFile: null as File | null,
      /** true when the user explicitly asked to delete the existing favicon */
      faviconDeleted: false,
      faviconError: '',
      form: {
        name: '',
        title: '' as string | null,
        startDateTime: moment().format('YYYY-MM-DDTHH:mm:00'),
        endDateTime: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm:00')
      }
    }
  },
  computed: {
    isEditMode(): boolean {
      return !!this.event
    },
    /**
     * URL to show in the favicon preview:
     * - If the user selected a new file → object URL from that file
     * - Else if the existing event has a favicon and it wasn't deleted → backend URL
     * - Otherwise → null (no preview)
     */
    faviconPreviewUrl(): string | null {
      if (this.faviconFile) {
        return URL.createObjectURL(this.faviconFile)
      }
      if (!this.faviconDeleted && this.event?.has_favicon && this.event?.id) {
        return api.eventFaviconUrl(this.event.id)
      }
      return null
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val: boolean) {
        this.dialog = val
        if (val) {
          this.resetForm()
        }
      }
    },
    dialog(val: boolean) {
      if (!val) {
        this.$emit('close')
      }
    }
  },
  methods: {
    resetForm() {
      this.faviconFile = null
      this.faviconDeleted = false
      this.faviconError = ''
      if (this.event) {
        this.form.name = this.event.name
        this.form.title = this.event.title ?? null
        this.form.startDateTime = moment(this.event.time_range.start).format(
          'YYYY-MM-DDTHH:mm:00'
        )
        this.form.endDateTime = moment(this.event.time_range.end).format(
          'YYYY-MM-DDTHH:mm:00'
        )
      } else {
        this.form.name = ''
        this.form.title = null
        this.form.startDateTime = moment().format('YYYY-MM-DDTHH:mm:00')
        this.form.endDateTime = moment()
          .add(1, 'day')
          .format('YYYY-MM-DDTHH:mm:00')
      }
    },
    triggerFaviconPicker() {
      ;(this.$refs.faviconInput as HTMLInputElement).click()
    },
    onFaviconSelected(event: Event) {
      this.faviconError = ''
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'ico' && ext !== 'png') {
        this.faviconError = 'Only .ico and .png files are supported.'
        input.value = ''
        return
      }
      this.faviconFile = file
      this.faviconDeleted = false
      // Reset the input so the same file can be re-selected if needed
      input.value = ''
    },
    removeFavicon() {
      this.faviconFile = null
      this.faviconDeleted = true
    },
    async saveEvent() {
      if (!(this.$refs.form as any).validate()) return
      this.saving = true
      const eventData = {
        name: this.form.name,
        title: this.form.title || null,
        time_range: {
          start: moment(this.form.startDateTime).format('YYYY-MM-DDTHH:mm:ssZ'),
          end: moment(this.form.endDateTime).format('YYYY-MM-DDTHH:mm:ssZ')
        }
      }
      try {
        let savedEvent: EventInfo
        if (this.isEditMode && this.event) {
          savedEvent = await api.updateEvent(this.event.id, eventData)
        } else {
          savedEvent = await api.createEvent(eventData)
        }

        // Handle favicon changes
        if (this.faviconFile) {
          await api.uploadEventFavicon(savedEvent.id, this.faviconFile)
        } else if (this.faviconDeleted && this.event?.has_favicon) {
          await api.deleteEventFavicon(savedEvent.id)
        }

        this.$emit('save')
        this.closeDialog()
      } catch (e) {
        console.error('Failed to save event', e)
      } finally {
        this.saving = false
      }
    },
    closeDialog() {
      this.dialog = false
    }
  }
})
</script>
