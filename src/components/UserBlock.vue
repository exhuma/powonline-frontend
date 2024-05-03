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
        actionName="deleteUserRemote"
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
const UserBlock = Vue.extend({
  name: 'user-block',
  data() {
    return {
      roles: [],
      selectedRoles: [],
      stations: [],
      selectedStations: [],
      refreshingItems: new Set(),
      spinnerKey: 0,
      loading: false
    }
  },
  methods: {
    closeDialog() {
      this.$emit('closeButtonClicked')
    },
    onRolesChanged(newRoles) {
      this.roles.forEach((roleName) => {
        if (newRoles.includes(roleName)) {
          this.$remoteProxy.addUserRole(this.name, roleName)
        } else {
          this.$remoteProxy.removeUserRole(this.name, roleName)
        }
      })
    },
    onStationsChanged(newStations) {
      this.stations.forEach((stationName) => {
        if (newStations.includes(stationName)) {
          this.$remoteProxy.addStationToUser(this.name, stationName)
        } else {
          this.$remoteProxy.removeStationFromUser(this.name, stationName)
        }
      })
    },
    refresh() {
      this.refreshRoles()
      this.refreshStations()
    },
    refreshStations() {
      const refreshKey = 'stations'
      if (this.refreshingItems.has(refreshKey)) {
        return
      }
      this.refreshingItems.add(refreshKey)
      this.loading = true
      this.spinnerKey += 1
      this.$remoteProxy
        .fetchUserStations(this.name)
        .then((items) => {
          this.selectedStations = []
          items.forEach(([stationName, isActive]) => {
            if (!this.stations.includes(stationName)) {
              this.stations.push(stationName)
            }
            if (isActive) {
              this.selectedStations.push(stationName)
            }
          })
          this.refreshingItems.delete(refreshKey)
          if (this.refreshingItems.size === 0) {
            this.loading = false
          }
          this.spinnerKey += 1
        })
        .catch((e) => {
          this.$store.commit('logError', e)
          this.refreshingItems.delete(refreshKey)
          if (this.refreshingItems.size === 0) {
            this.loading = false
          }
          this.spinnerKey += 1
        })
    },
    refreshRoles() {
      const refreshKey = 'roles'
      if (this.refreshingItems.has(refreshKey)) {
        return
      }
      this.refreshingItems.add(refreshKey)
      this.loading = true
      this.spinnerKey += 1
      this.$remoteProxy
        .fetchUserRoles(this.name)
        .then((items) => {
          this.selectedRoles = []
          items.forEach(([roleName, isActive]) => {
            if (!this.roles.includes(roleName)) {
              this.roles.push(roleName)
            }
            if (isActive) {
              this.selectedRoles.push(roleName)
            }
          })
          this.refreshingItems.delete(refreshKey)
          if (this.refreshingItems.size === 0) {
            this.loading = false
          }
          this.spinnerKey += 1
        })
        .catch((e) => {
          this.$store.commit('logError', e)
          this.refreshingItems.delete(refreshKey)
          if (this.refreshingItems.size === 0) {
            this.loading = false
          }
          this.spinnerKey += 1
        })
    },
    hasRole(roleName) {
      return this.$store.getters.hasRole(roleName)
    }
  },
  created() {
    this.refresh()
  },
  props: {
    name: {
      type: String,
      default: 'Unknown User'
    }
  }
})
export default UserBlock
</script>
