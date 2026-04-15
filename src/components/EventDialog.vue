<template>
  <v-dialog v-model="dialog" max-width="560px" persistent>
    <v-card>
      <v-card-title class="primary white--text">
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
        <v-btn text @click="closeDialog">Cancel</v-btn>
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
import Vue from 'vue'
import moment from 'moment'
import type { EventInfo } from '@/remote'
import DateTimePicker from './DateTimePicker.vue'

export default Vue.extend({
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
      form: {
        name: '',
        startDateTime: moment().format('YYYY-MM-DDTHH:mm:00'),
        endDateTime: moment().add(1, 'day').format('YYYY-MM-DDTHH:mm:00')
      }
    }
  },
  computed: {
    isEditMode(): boolean {
      return !!this.event
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
      if (this.event) {
        this.form.name = this.event.name
        this.form.startDateTime = moment(this.event.time_range.start).format(
          'YYYY-MM-DDTHH:mm:00'
        )
        this.form.endDateTime = moment(this.event.time_range.end).format(
          'YYYY-MM-DDTHH:mm:00'
        )
      } else {
        this.form.name = ''
        this.form.startDateTime = moment().format('YYYY-MM-DDTHH:mm:00')
        this.form.endDateTime = moment()
          .add(1, 'day')
          .format('YYYY-MM-DDTHH:mm:00')
      }
    },
    async saveEvent() {
      if (!(this.$refs.form as any).validate()) return
      this.saving = true
      const eventData = {
        name: this.form.name,
        time_range: {
          // Always send timezone-aware timestamps (e.g. +02:00 or Z).
          start: moment(this.form.startDateTime).format('YYYY-MM-DDTHH:mm:ssZ'),
          end: moment(this.form.endDateTime).format('YYYY-MM-DDTHH:mm:ssZ')
        }
      }
      try {
        if (this.isEditMode && this.event) {
          await this.$store.dispatch('updateEvent', {
            eventId: this.event.id,
            eventData
          })
        } else {
          await this.$store.dispatch('createEvent', eventData)
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
