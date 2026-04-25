<template>
  <div id="HomePage">
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="9" md="7" lg="5">
          <v-card class="elevation-8">
            <v-card-title class="bg-primary text-white">
              <v-icon dark class="mr-2">mdi-calendar-check</v-icon>
              Select an Event
            </v-card-title>

            <v-card-text class="pt-4">
              <div v-if="loading" class="text-center py-6">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
                <div class="mt-3 text-subtitle1">Loading events…</div>
              </div>

              <div
                v-else-if="futureEvents.length === 0"
                class="text-center py-6"
              >
                <v-icon size="64" color="grey lighten-1"
                  >mdi-calendar-remove</v-icon
                >
                <p class="text-h6 mt-4 mb-2">No accessible events found</p>
                <p class="text-body-2 text-grey mb-4">
                  There are no upcoming events you can access.
                </p>
                <v-btn
                  v-if="isLoggedIn"
                  color="primary"
                  @click="showCreateDialog = true"
                >
                  <v-icon start>mdi-plus</v-icon>
                  Create New Event
                </v-btn>
              </div>

              <v-list v-else lines="two">
                <v-list-item
                  v-for="event in futureEvents"
                  :key="event.id"
                  @click="selectEvent(event)"
                  class="rounded mb-1"
                  style="border: 1px solid rgba(0, 0, 0, 0.12)"
                >
                  <v-list-item-avatar color="primary">
                    <v-icon dark>mdi-calendar</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-medium">
                      {{ event.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDateRange(event.time_range) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon color="primary">mdi-chevron-right</v-icon>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions v-if="isLoggedIn && futureEvents.length > 0">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                @click="showCreateDialog = true"
              >
                <v-icon start>mdi-plus</v-icon>
                Create Event
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <EventDialog
      v-if="showCreateDialog"
      :visible="showCreateDialog"
      @close="showCreateDialog = false"
      @save="onEventSaved"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import moment from 'moment'
import type { EventInfo } from '@/api'
import EventDialog from '@/components/EventDialog.vue'
import { api, pinnedEvent } from '@/main'
import type { Session } from '@/App.vue'

export default defineComponent({
  name: 'HomePage',
  components: { EventDialog },
  inject: ['session', 'getEvents', 'setEvents', 'setSelectedEventId'],
  data() {
    return {
      loading: true,
      showCreateDialog: false
    }
  },
  computed: {
    futureEvents(): EventInfo[] {
      const now = moment()
      const events: EventInfo[] = (this.getEvents as () => EventInfo[])()
      return events.filter((event: EventInfo) => {
        const end = moment(event.time_range.end)
        const start = moment(event.time_range.start)
        return end.isAfter(now) || start.isAfter(now)
      })
    },
    isLoggedIn(): boolean {
      return Boolean((this.session as Session).userName)
    }
  },
  async mounted() {
    // If a domain is pinned to an event, skip the event selector entirely
    if (pinnedEvent.value) {
      ;(this.setSelectedEventId as (id: number) => void)(pinnedEvent.value.id)
      this.$router.replace('/dashboard')
      return
    }
    await this.loadEvents()
  },
  methods: {
    async loadEvents() {
      this.loading = true
      try {
        const events = await api.fetchEvents()
        ;(this.setEvents as (e: EventInfo[]) => void)(events)
      } catch (e) {
        console.error('Unable to load events', e)
      } finally {
        this.loading = false
      }
    },
    selectEvent(event: EventInfo) {
      ;(this.setSelectedEventId as (id: number) => void)(event.id)
      this.$router.push(`/event/${event.id}/dashboard`)
    },
    formatDateRange(timeRange: { start: string; end: string }): string {
      const start = moment(timeRange.start).format('MMM D, YYYY HH:mm')
      const end = moment(timeRange.end).format('MMM D, YYYY HH:mm')
      return `${start} – ${end}`
    },
    onEventSaved() {
      this.showCreateDialog = false
      this.loadEvents()
    }
  }
})
</script>
