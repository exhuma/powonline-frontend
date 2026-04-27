<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-calendar-multiple</v-icon>
      <v-toolbar-title>Event Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn color="primary" @click="$emit('open-create')">
        <v-icon start>mdi-plus</v-icon>
        New Event
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="events"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.time_range="{ item }">
        {{ formatDateRange(item.time_range) }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip size="small" :color="statusColor(item)" dark>
          {{ statusLabel(item) }}
        </v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <RowActions>
          <template #pinned>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="$emit('select-event', item)"
              title="Select event"
            >
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="$emit('open-edit', item)"
              title="Edit event"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              :color="pinnedEventId === item.id ? 'primary' : undefined"
              :title="
                pinnedEventId === item.id
                  ? 'Current domain is mapped to this event'
                  : 'Manage domains'
              "
              @click="$emit('open-domains', item)"
            >
              <v-icon>mdi-web</v-icon>
            </v-btn>
          </template>
          <v-list-item
            prepend-icon="mdi-account-multiple"
            title="Manage members"
            @click="$emit('open-members', item)"
          />
          <v-list-item
            prepend-icon="mdi-delete"
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
import moment from 'moment'
import type { EventInfo } from '@/api'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'EventTable',
  components: { RowActions },
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
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Date Range', key: 'time_range', sortable: false },
        { title: 'Status', key: 'status', sortable: false },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      ]
    }
  },
  methods: {
    formatDateRange(timeRange: { start: string; end: string } | null): string {
      if (!timeRange) return 'empty'
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
