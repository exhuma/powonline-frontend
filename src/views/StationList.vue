<template>
  <div id="StationList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-map-marker-multiple</v-icon>
            <v-toolbar-title>Station Management</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-btn
              v-if="hasRole(['admin'])"
              color="primary"
              @click="openCreateDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              New Station
            </v-btn>
          </v-toolbar>
          <v-data-table
            :headers="headers"
            :items="sortedStations"
            :items-per-page="15"
            :loading="loading"
            class="elevation-0"
          >
            <template v-slot:item.is_start="{ item }">
              <v-icon v-if="item.is_start" color="green">mdi-check</v-icon>
            </template>
            <template v-slot:item.is_end="{ item }">
              <v-icon v-if="item.is_end" color="green">mdi-check</v-icon>
            </template>
            <template v-slot:item.actions="{ item }">
              <RowActions>
                <template #pinned>
                  <v-btn
                    v-if="hasRole(['admin'])"
                    icon
                    size="small"
                    variant="text"
                    @click="openEditDialog(item)"
                    title="Edit station"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    v-if="hasRole(['station_manager'])"
                    icon
                    size="small"
                    variant="text"
                    @click="openDashboard(item)"
                    title="Open dashboard"
                  >
                    <v-icon>mdi-clipboard-text</v-icon>
                  </v-btn>
                </template>
                <v-list-item
                  v-if="hasRole(['admin'])"
                  prepend-icon="mdi-delete"
                  title="Delete"
                  class="text-error"
                  @click="confirmDelete(item)"
                />
              </RowActions>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="showStationDialog" max-width="500px">
      <v-card>
        <v-card-title>{{
          editingStation ? 'Edit Station' : 'New Station'
        }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="stationForm.name"
            label="Station name"
            :disabled="!!editingStation"
          />
          <v-text-field
            v-model.number="stationForm.order"
            type="number"
            label="Station Ordering"
            hint="This field is used to sort stations"
          />
          <v-checkbox
            v-model="stationForm.is_start"
            label="Departure Station"
          />
          <v-checkbox v-model="stationForm.is_end" label="Arrival Station" />
          <v-text-field v-model="stationForm.phone" label="Phone Number" />
          <v-text-field v-model="stationForm.contact" label="Contact" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showStationDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="onSaveStation">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete Station</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ deletingStation && deletingStation.name }}</strong
          >? This will remove the station and all related information.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error dialog -->
    <v-dialog v-model="errorDialog" max-width="400px">
      <v-card>
        <v-card-title>Error</v-card-title>
        <v-card-text>{{ errorText }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="errorDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Session } from '@/App.vue'
import { api } from '@/main'
import model from '@/model'
import type { Station } from '@/remote/model/station'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'StationList',
  components: { RowActions },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      stations: [] as Station[],
      showStationDialog: false,
      showDeleteDialog: false,
      errorDialog: false,
      errorText: '',
      editingStation: null as Station | null,
      deletingStation: null as Station | null,
      stationForm: model.station.makeEmpty() as any,
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Order', key: 'order', sortable: true },
        { title: 'Contact', key: 'contact', sortable: true },
        { title: 'Phone', key: 'phone', sortable: false },
        { title: 'Departure', key: 'is_start', sortable: false },
        { title: 'Arrival', key: 'is_end', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
      ]
    }
  },

  computed: {
    sortedStations(): Station[] {
      return this.stations
        .slice()
        .sort(
          (a, b) =>
            parseInt(String(a.order), 10) - parseInt(String(b.order), 10)
        )
    }
  },

  async mounted() {
    await this.fetchStations()
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    async fetchStations() {
      const eventId = (this as any).getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        this.stations = await api.fetchStations(eventId)
      } catch (e) {
        console.error('Failed to fetch stations', e)
      } finally {
        this.loading = false
      }
    },
    openCreateDialog() {
      this.editingStation = null
      this.stationForm = model.station.makeEmpty()
      this.showStationDialog = true
    },
    openEditDialog(station: Station) {
      this.editingStation = station
      this.stationForm = { ...station }
      this.showStationDialog = true
    },
    confirmDelete(station: Station) {
      this.deletingStation = station
      this.showDeleteDialog = true
    },
    openDashboard(station: Station) {
      const eventId = (this as any).getSelectedEventId()
      this.$router.push(`/event/${eventId}/station/${station.name}`)
    },
    async onSaveStation() {
      const eventId = (this as any).getSelectedEventId()
      const station = this.stationForm
      station.contact = station.contact || ''
      station.phone = station.phone || ''
      if (this.editingStation) {
        try {
          const updated = await api.updateStation(
            station.name,
            station,
            eventId
          )
          const idx = this.stations.findIndex((s) => s.name === station.name)
          if (idx >= 0) this.stations[idx] = updated
        } catch (e: any) {
          this.errorText = e?.response?.data ?? String(e)
          this.errorDialog = true
          return
        }
      } else {
        try {
          const created = await api.addStation(station, eventId)
          this.stations.push(created)
        } catch (e: any) {
          this.errorText = e?.response?.data ?? String(e)
          this.errorDialog = true
          return
        }
      }
      this.showStationDialog = false
    },
    async doDelete() {
      this.showDeleteDialog = false
      if (!this.deletingStation) return
      const eventId = (this as any).getSelectedEventId()
      try {
        await api.deleteStation(this.deletingStation.name, eventId)
        this.stations = this.stations.filter(
          (s) => s.name !== this.deletingStation!.name
        )
      } catch (e) {
        console.error('Failed to delete station', e)
      }
      this.deletingStation = null
    }
  }
})
</script>
