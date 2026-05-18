<template>
  <div id="EventManagement">
    <v-container>
      <v-row>
        <v-col cols="12">
          <EventTable
            v-if="!$vuetify.display.smAndDown"
            :events="events"
            :loading="loading"
            :pinned-event-id="pinnedEvent ? pinnedEvent.id : null"
            @open-create="openCreateDialog"
            @open-edit="openEditDialog"
            @open-delete="confirmDelete"
            @open-domains="openDomainsDialog"
            @open-members="openMembersDialog"
            @select-event="selectEvent"
          />
          <EventCards
            v-else
            :events="events"
            :loading="loading"
            :pinned-event-id="pinnedEvent ? pinnedEvent.id : null"
            @open-create="openCreateDialog"
            @open-edit="openEditDialog"
            @open-delete="confirmDelete"
            @open-domains="openDomainsDialog"
            @open-members="openMembersDialog"
            @select-event="selectEvent"
          />
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

    <!-- Domain management dialog -->
    <v-dialog v-model="showDomainsDialog" max-width="520px">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-web</v-icon>
          Domains for
          <em class="ml-1">{{ domainsEvent && domainsEvent.name }}</em>
        </v-card-title>
        <v-card-text>
          <v-list dense v-if="eventDomains.length">
            <v-list-item v-for="d in eventDomains" :key="d.id">
              <v-list-item-content>
                <v-list-item-title>{{ d.domain }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  small
                  color="red"
                  @click="removeDomain(d.domain)"
                  title="Remove domain"
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <div v-else class="text--secondary mb-2">No domains configured.</div>
          <v-divider class="my-3"></v-divider>
          <v-form @submit.prevent="addDomain">
            <v-text-field
              v-model="newDomain"
              label="Add domain (e.g. event.example.com)"
              dense
              outlined
              :error-messages="domainError"
              append-icon="mdi-plus"
              @click:append="addDomain"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDomainsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { EventInfo, EventDomain } from '@/api'
import EventDialog from '@/components/EventDialog.vue'
import EventMemberManager from '@/components/EventMemberManager.vue'
import EventTable from '@/components/management/desktop/EventTable.vue'
import EventCards from '@/components/management/mobile/EventCards.vue'
import { api } from '@/main'
import { pinnedEvent } from '@/pinnedEvent'

export default defineComponent({
  name: 'EventManagement',
  components: { EventDialog, EventMemberManager, EventTable, EventCards },
  inject: ['getSelectedEventId', 'setSelectedEventId'],
  data() {
    return {
      loading: true,
      events: [] as EventInfo[],
      showEventDialog: false,
      showMembersDialog: false,
      showDeleteDialog: false,
      showDomainsDialog: false,
      editingEvent: null as EventInfo | null,
      managingEvent: null as EventInfo | null,
      deletingEvent: null as EventInfo | null,
      domainsEvent: null as EventInfo | null,
      eventDomains: [] as EventDomain[],
      newDomain: '',
      domainError: '' as string
    }
  },
  computed: {
    pinnedEvent(): EventInfo | null {
      return pinnedEvent.value
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
    selectEvent(event: EventInfo) {
      ;(this.setSelectedEventId as (id: number) => void)(event.id)
      this.$router.push(`/event/${event.id}/dashboard`)
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
      const currentId = (this.getSelectedEventId as () => number | null)()
      if (currentId === this.deletingEvent.id) {
        ;(this.setSelectedEventId as (id: number | null) => void)(null)
        this.deletingEvent = null
        this.$router.push('/')
        return
      }
      this.deletingEvent = null
      await this.loadEvents()
    },
    onEventSaved() {
      this.showEventDialog = false
      this.editingEvent = null
      this.loadEvents()
    },
    async openDomainsDialog(event: EventInfo) {
      this.domainsEvent = event
      this.newDomain = ''
      this.domainError = ''
      this.eventDomains = await api.fetchEventDomains(event.id)
      this.showDomainsDialog = true
    },
    async addDomain() {
      this.domainError = ''
      const domain = this.newDomain.trim()
      if (!domain) return
      try {
        const created = await api.addEventDomain(this.domainsEvent!.id, domain)
        this.eventDomains.push(created)
        this.newDomain = ''
      } catch {
        this.domainError = 'Could not add domain (it may already be in use).'
      }
    },
    async removeDomain(domain: string) {
      await api.removeEventDomain(this.domainsEvent!.id, domain)
      this.eventDomains = this.eventDomains.filter((d) => d.domain !== domain)
    }
  }
})
</script>
