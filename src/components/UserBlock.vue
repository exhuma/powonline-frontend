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
      <v-combobox
        multiple
        chips
        deletable-chips
        small-chips
        label="Stations"
        hint="Select one or more stations for the user in this system"
        v-model="selectedStations"
        @change="onStationsChanged"
        :items="stations"
        :loading="loading"
        :read-only="loading"
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
        <span slot="title">Do you want to delete the user "{{ name }}"?</span>
        <div slot="text">
          <p>
            this will delete the user with the name "{{ name }}" and all related
            information!
          </p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
      <v-btn @click="closeDialog">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import type { Session } from '@/App.vue'

const UserBlock = Vue.extend({
  name: 'user-block',
  inject: ['session'],
  data() {
    return {
      roles: [] as string[],
      selectedRoles: [] as string[],
      stations: [] as string[],
      selectedStations: [] as string[],
      refreshingItems: new Set<string>(),
      spinnerKey: 0,
      loading: false
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
    onStationsChanged(newStations: string[]) {
      this.stations.forEach((stationName) => {
        if (newStations.includes(stationName)) {
          api
            .addStationToUser(this.name, stationName)
            .catch((e) => console.error(e))
        } else {
          api
            .removeStationFromUser(this.name, stationName)
            .catch((e) => console.error(e))
        }
      })
    },
    refresh() {
      this.refreshRoles()
      this.refreshStations()
    },
    async refreshStations() {
      const refreshKey = 'stations'
      if (this.refreshingItems.has(refreshKey)) return
      this.refreshingItems.add(refreshKey)
      this.loading = true
      this.spinnerKey += 1
      try {
        const items = await api.fetchUserStations(this.name)
        this.selectedStations = []
        items.forEach(([stationName, isActive]) => {
          if (!this.stations.includes(stationName)) {
            this.stations.push(stationName)
          }
          if (isActive) {
            this.selectedStations.push(stationName)
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
      // @ts-expect-error inject
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
