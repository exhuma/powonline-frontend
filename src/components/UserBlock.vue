<template>
  <v-card class="mt-3">
    <v-card-title class="mb-0"
      ><span>{{ name }}</span></v-card-title
    >
    <v-card-text>
      <v-combobox
        multiple
        chips
        deletable-chips
        small-chips
        label="Roles"
        hint="Select one or more roles for the user in this system"
        v-model="selectedRoles"
        @change="onRolesChanged"
        :items="roles"
        :loading="loading"
        :read-only="loading"
      >
      </v-combobox>
      <v-select
        label="Event"
        hint="Select an event to manage station access for that event"
        persistent-hint
        clearable
        v-model="selectedEvent"
        :items="events"
        item-title="name"
        item-value="id"
        return-object
        :loading="loading"
        :disabled="loading"
        @update:modelValue="onEventChanged"
      >
      </v-select>
      <v-combobox
        v-if="selectedEvent !== null"
        multiple
        chips
        deletable-chips
        small-chips
        label="Stations"
        hint="Select one or more stations to grant this user access"
        v-model="selectedStations"
        @change="onStationsChanged"
        :items="availableStations"
        :loading="loadingStations"
        :read-only="loadingStations"
      >
      </v-combobox>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions v-if="hasRole('admin')">
      <v-spacer />
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="name"
        @confirmed="deleteUser"
      >
        <template #title>Do you want to delete the user "{{ name }}"?</template>
        <template #text>
          <div>
            <p>
              this will delete the user with the name "{{ name }}" and all
              related information!
            </p>
            <p>Are you sure?</p>
          </div>
        </template>
      </confirmation-dialog>
      <v-btn @click="closeDialog">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { EventInfo } from '@/api/index'
import type { Session } from '@/App.vue'

const UserBlock = defineComponent({
  name: 'user-block',
  inject: ['session'],
  data() {
    return {
      roles: [] as string[],
      selectedRoles: [] as string[],
      /** All station names the user is currently assigned to (across all events). */
      assignedStations: new Set<string>(),
      /** Stations belonging to the currently selected event. */
      availableStations: [] as string[],
      /** Subset of availableStations that the user is assigned to. */
      selectedStations: [] as string[],
      /** Upcoming events where the auth user has admin rights. */
      events: [] as EventInfo[],
      selectedEvent: null as EventInfo | null,
      refreshingItems: new Set<string>(),
      spinnerKey: 0,
      loading: false,
      loadingStations: false
    }
  },
  props: {
    name: {
      type: String,
      default: 'Unknown User'
    }
  },
  created() {
    this.refresh()
  },
  methods: {
    closeDialog() {
      this.$emit('closeButtonClicked')
    },
    onRolesChanged(newRoles: string[]) {
      this.roles.forEach((roleName) => {
        if (newRoles.includes(roleName)) {
          api.addUserRole(this.name, roleName).catch((e) => console.error(e))
        } else {
          api.removeUserRole(this.name, roleName).catch((e) => console.error(e))
        }
      })
    },
    async onEventChanged(newEvent: EventInfo | null) {
      this.selectedEvent = newEvent
      this.availableStations = []
      this.selectedStations = []
      if (!newEvent) return
      await this.refreshAvailableStations(newEvent.id)
    },
    async refreshAvailableStations(eventId: number) {
      this.loadingStations = true
      try {
        const stations = await api.fetchStations(eventId)
        this.availableStations = stations.map((s) => s.name)
        // Pre-select stations already assigned to this user
        this.selectedStations = this.availableStations.filter((name) =>
          this.assignedStations.has(name)
        )
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingStations = false
      }
    },
    onStationsChanged(newStations: string[]) {
      // Diff against the current event's available stations only
      this.availableStations.forEach((stationName) => {
        const wasSelected = this.assignedStations.has(stationName)
        const isNowSelected = newStations.includes(stationName)
        if (!wasSelected && isNowSelected) {
          this.assignedStations.add(stationName)
          api
            .addStationToUser(this.name, stationName)
            .catch((e) => console.error(e))
        } else if (wasSelected && !isNowSelected) {
          this.assignedStations.delete(stationName)
          api
            .removeStationFromUser(this.name, stationName)
            .catch((e) => console.error(e))
        }
      })
    },
    refresh() {
      this.refreshRoles()
      this.refreshStations()
      this.refreshEvents()
    },
    async refreshStations() {
      const refreshKey = 'stations'
      if (this.refreshingItems.has(refreshKey)) return
      this.refreshingItems.add(refreshKey)
      this.loading = true
      this.spinnerKey += 1
      try {
        const items = await api.fetchUserStations(this.name)
        this.assignedStations = new Set(
          items
            .filter(([, isActive]) => isActive)
            .map(([stationName]) => stationName)
        )
        // Reset event-specific state — the event dropdown drives further loads
        this.availableStations = []
        this.selectedStations = []
        this.selectedEvent = null
      } catch (e) {
        console.error(e)
      } finally {
        this.refreshingItems.delete(refreshKey)
        if (this.refreshingItems.size === 0) {
          this.loading = false
        }
        this.spinnerKey += 1
      }
    },
    async refreshEvents() {
      const refreshKey = 'events'
      if (this.refreshingItems.has(refreshKey)) return
      this.refreshingItems.add(refreshKey)
      this.loading = true
      this.spinnerKey += 1
      try {
        this.events = await api.fetchMyAdminEvents()
      } catch (e) {
        console.error(e)
      } finally {
        this.refreshingItems.delete(refreshKey)
        if (this.refreshingItems.size === 0) {
          this.loading = false
        }
        this.spinnerKey += 1
      }
    },
    async refreshRoles() {
      const refreshKey = 'roles'
      if (this.refreshingItems.has(refreshKey)) return
      this.refreshingItems.add(refreshKey)
      this.loading = true
      this.spinnerKey += 1
      try {
        const items = await api.fetchUserRoles(this.name)
        this.selectedRoles = []
        // fetchUserRoles returns plain string[] of all possible roles or
        // [roleName, isActive] pairs — handle both shapes
        items.forEach((item: any) => {
          const [roleName, isActive] = Array.isArray(item) ? item : [item, true]
          if (!this.roles.includes(roleName)) {
            this.roles.push(roleName)
          }
          if (isActive) {
            this.selectedRoles.push(roleName)
          }
        })
      } catch (e) {
        console.error(e)
      } finally {
        this.refreshingItems.delete(refreshKey)
        if (this.refreshingItems.size === 0) {
          this.loading = false
        }
        this.spinnerKey += 1
      }
    },
    hasRole(roleName: string): boolean {
      const session = this.session as Session
      return session.roles.includes(roleName)
    },
    async deleteUser(userName: string) {
      try {
        await api.deleteUser(userName)
        this.$emit('deleted', userName)
      } catch (e) {
        console.error('Failed to delete user', e)
      }
    }
  }
})
export default UserBlock
</script>
