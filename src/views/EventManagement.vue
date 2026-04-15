<template>
  <div id="EventManagement">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-calendar-multiple</v-icon>
              Event Management
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openCreateDialog">
                <v-icon left>mdi-plus</v-icon>
                New Event
              </v-btn>
            </v-card-title>

            <v-card-text>
              <div v-if="loading" class="text-center py-6">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </div>

              <v-data-table
                v-else
                :headers="headers"
                :items="events"
                :items-per-page="15"
                class="elevation-0"
              >
                <template v-slot:item.time_range="{ item }">
                  {{ formatDateRange(item.time_range) }}
                </template>
                <template v-slot:item.status="{ item }">
                  <v-chip small :color="statusColor(item)" dark>
                    {{ statusLabel(item) }}
                  </v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon
                    small
                    class="mr-1"
                    @click="selectEvent(item)"
                    title="Select event"
                  >
                    <v-icon small>mdi-check-circle</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    class="mr-1"
                    @click="openEditDialog(item)"
                    title="Edit event"
                  >
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    class="mr-1"
                    @click="openMembersDialog(item)"
                    title="Manage members"
                  >
                    <v-icon small>mdi-account-multiple</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    color="red"
                    @click="confirmDelete(item)"
                    title="Delete event"
                  >
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create / Edit dialog -->
    <EventDialog
      v-if="showEventDialog"
      :visible="showEventDialog"
      :event="editingEvent"
      @close="showEventDialog = false"
      @save="onEventSaved"
    />

    <!-- Member management dialog -->
    <EventMemberManager
      v-if="showMembersDialog && managingEvent"
      :visible="showMembersDialog"
      :eventId="managingEvent.id"
      @close="showMembersDialog = false"
    />

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete Event</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ deletingEvent && deletingEvent.name }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'
import type { EventInfo } from '@/api'
import EventDialog from '@/components/EventDialog.vue'
import EventMemberManager from '@/components/EventMemberManager.vue'
import { api } from '@/main'

export default Vue.extend({
  name: 'EventManagement',
  components: { EventDialog, EventMemberManager },
  inject: ['getSelectedEventId', 'setSelectedEventId'],
  data() {
    return {
      loading: true,
      events: [] as EventInfo[],
      showEventDialog: false,
      showMembersDialog: false,
      showDeleteDialog: false,
      editingEvent: null as EventInfo | null,
      managingEvent: null as EventInfo | null,
      deletingEvent: null as EventInfo | null,
      headers: [
        { text: 'Name', value: 'name', sortable: true },
        { text: 'Date Range', value: 'time_range', sortable: false },
        { text: 'Status', value: 'status', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  async mounted() {
    await this.loadEvents()
  },
  methods: {
    async loadEvents() {
      this.loading = true
      try {
        this.events = await api.fetchEvents()
      } finally {
        this.loading = false
      }
    },
    formatDateRange(timeRange: { start: string; end: string }): string {
      const start = moment(timeRange.start).format('MMM D, YYYY HH:mm')
      const end = moment(timeRange.end).format('MMM D, YYYY HH:mm')
      return `${start} – ${end}`
    },
    statusLabel(event: EventInfo): string {
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
    },
    selectEvent(event: EventInfo) {
      // @ts-expect-error inject
      ;(this.setSelectedEventId as (id: number) => void)(event.id)
      this.$router.push('/dashboard')
    },
    openCreateDialog() {
      this.editingEvent = null
      this.showEventDialog = true
    },
    openEditDialog(event: EventInfo) {
      this.editingEvent = event
      this.showEventDialog = true
    },
    openMembersDialog(event: EventInfo) {
      this.managingEvent = event
      this.showMembersDialog = true
    },
    confirmDelete(event: EventInfo) {
      this.deletingEvent = event
      this.showDeleteDialog = true
    },
    async doDelete() {
      this.showDeleteDialog = false
      if (!this.deletingEvent) return
      await api.deleteEvent(this.deletingEvent.id)
      // If we deleted the selected event, clear selection
      // @ts-expect-error inject
      const currentId = (this.getSelectedEventId as () => number | null)()
      if (currentId === this.deletingEvent.id) {
        // @ts-expect-error inject
        ;(this.setSelectedEventId as (id: number | null) => void)(null)
      }
      this.deletingEvent = null
      await this.loadEvents()
    },
    onEventSaved() {
      this.showEventDialog = false
      this.editingEvent = null
      this.loadEvents()
    }
  }
})
</script>
