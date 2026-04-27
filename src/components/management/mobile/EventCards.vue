<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-calendar-multiple</v-icon>
          <span class="text-h6">Event Management</span>
          <v-spacer />
          <v-btn color="primary" size="small" @click="$emit('open-create')">
            <v-icon start>mdi-plus</v-icon>
            New Event
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="event in events" :key="event.id">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2">
            <span class="font-weight-medium">{{ event.name }}</span>
            <v-spacer />
            <v-chip size="x-small" :color="statusColor(event)">{{
              statusLabel(event)
            }}</v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="text-caption text-disabled mb-3">
            {{ formatDateRange(event.time_range) }}
          </div>
          <div class="d-flex ga-2 flex-wrap">
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-check-circle"
              @click="$emit('select-event', event)"
              >Select</v-btn
            >
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="$emit('open-edit', event)"
              >Edit</v-btn
            >
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-account-multiple"
              @click="$emit('open-members', event)"
              >Members</v-btn
            >
            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-web"
              :color="pinnedEventId === event.id ? 'primary' : undefined"
              @click="$emit('open-domains', event)"
              >Domains</v-btn
            >
            <v-btn
              variant="tonal"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="$emit('open-delete', event)"
              >Delete</v-btn
            >
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && events.length === 0"
      class="text-center text-disabled pa-8"
    >
      No events found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import moment from 'moment'
import type { EventInfo } from '@/api'

export default defineComponent({
  name: 'EventCards',
  props: {
    events: { type: Array as PropType<EventInfo[]>, required: true },
    loading: { type: Boolean, default: false },
    pinnedEventId: { type: Number as PropType<number | null>, default: null }
  },
  emits: [
    'open-create',
    'open-edit',
    'open-delete',
    'open-domains',
    'open-members',
    'select-event'
  ],
  data() {
    return {
      expanded: [] as number[]
    }
  },
  methods: {
    formatDateRange(timeRange: { start: string; end: string } | null): string {
      if (!timeRange) return 'No date range set'
      const start = moment(timeRange.start).format('MMM D, YYYY HH:mm')
      const end = moment(timeRange.end).format('MMM D, YYYY HH:mm')
      return `${start} – ${end}`
    },
    statusLabel(event: EventInfo): string {
      if (!event.time_range) return 'N/A'
      const now = moment()
      const start = moment(event.time_range.start)
      const end = moment(event.time_range.end)
      if (now.isBefore(start)) return 'Upcoming'
      if (now.isAfter(end)) return 'Past'
      return 'Active'
    },
    statusColor(event: EventInfo): string {
      const label = this.statusLabel(event)
      if (label === 'Active') return 'green'
      if (label === 'Upcoming') return 'blue'
      return 'grey'
    }
  }
})
</script>
