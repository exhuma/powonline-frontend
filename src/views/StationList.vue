<template>
  <center-col id="StationList">
    <v-dialog v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
        <v-card-text class="text-white">{{ errorText }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="errorDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="sendMode === SEND_MODE.UPDATE"
      title="Add New Station"
    >
      <v-text-field
        @keyup.enter="onDialogConfirmed"
        type="text"
        v-model="selectedStation.name"
        label="Enter a new station name"
      />
      <v-text-field
        name="order"
        type="number"
        v-model="selectedStation.order"
        hint="This field is used to sort stations"
        label="Station Ordering"
      />
      <v-checkbox
        name="is_start"
        label="Departure Station"
        v-model="selectedStation.is_start"
      />
      <v-checkbox
        name="is_end"
        label="Arrival Station"
        v-model="selectedStation.is_end"
      />
      <v-text-field
        name="phone"
        v-model="selectedStation.phone"
        label="Phone Number"
      />
      <v-text-field
        name="contact"
        v-model="selectedStation.contact"
        label="Contact"
      />
    </popup-dialog>

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-list v-else lines="two">
      <station-block
        v-for="station in sortedStations"
        @openEditDialog="onOpenEditDialog(station)"
        @deleted="onStationDeleted(station)"
        :station="station"
        :key="station.name"
      ></station-block>
    </v-list>

    <v-list-item v-if="hasRole(['admin'])">
      <v-spacer />
      <v-list-item-action>
        <v-btn class="pa-3" @click="openCreateDialog">Add new Station</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Session } from '@/App.vue'
import { api } from '@/main'
import model from '@/model'
import type { Station } from '@/remote/model/station'

const StationList = defineComponent({
  name: 'station_list',
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      stations: [] as Station[],
      isAddBlockVisible: false,
      selectedStation: model.station.makeEmpty() as any,
      sendMode: model.SEND_MODE.CREATE,
      errorDialog: false,
      errorText: '',
      SEND_MODE: model.SEND_MODE
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

  async created() {
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
    onOpenEditDialog(station: Station) {
      this.selectedStation = { ...station }
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.UPDATE
    },
    openCreateDialog() {
      this.selectedStation = model.station.makeEmpty()
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    async onDialogConfirmed() {
      const eventId = (this as any).getSelectedEventId()
      const station = this.selectedStation

      if (this.sendMode === model.SEND_MODE.CREATE) {
        try {
          const created = await api.addStation(station, eventId)
          this.stations.push(created)
        } catch (e: any) {
          this.errorDialog = true
          this.errorText = e?.response?.data ?? String(e)
          return
        }
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        station.contact = station.contact || ''
        station.phone = station.phone || ''
        try {
          const updated = await api.updateStation(
            station.name,
            station,
            eventId
          )
          const idx = this.stations.findIndex((s) => s.name === station.name)
          if (idx >= 0) this.stations[idx] = updated
        } catch (e: any) {
          this.errorDialog = true
          this.errorText = e?.response?.data ?? String(e)
          return
        }
      }

      this.selectedStation = model.station.makeEmpty()
      this.isAddBlockVisible = false
    },
    onStationDeleted(station: Station) {
      this.stations = this.stations.filter((s) => s.name !== station.name)
    }
  }
})
export default StationList
</script>

<style scoped>
#StationList {
  padding-bottom: 5em;
}
</style>
