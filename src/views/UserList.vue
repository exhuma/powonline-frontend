<template>
  <div id="UserList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <UserTable
            v-if="!$vuetify.display.smAndDown"
            :users="users"
            :events="events"
            :selected-event="selectedEvent"
            :available-stations="availableStations"
            :all-roles="allRoles"
            :user-roles="userRoles"
            :user-stations="userStations"
            :loading-user-data="loadingUserData"
            :loading="loading"
            :loading-events="loadingEvents"
            :error-message="errorMessage"
            :can-edit="hasRole(['admin'])"
            @open-create="openCreateDialog"
            @open-delete="openDeleteDialog"
            @event-changed="onEventChanged"
            @toggle-role="toggleRole"
            @toggle-station="toggleStation"
          />
          <UserCards
            v-else
            :users="users"
            :events="events"
            :selected-event="selectedEvent"
            :available-stations="availableStations"
            :all-roles="allRoles"
            :user-roles="userRoles"
            :user-stations="userStations"
            :loading-user-data="loadingUserData"
            :loading="loading"
            :loading-events="loadingEvents"
            :error-message="errorMessage"
            :can-edit="hasRole(['admin'])"
            @open-create="openCreateDialog"
            @open-delete="openDeleteDialog"
            @event-changed="onEventChanged"
            @toggle-role="toggleRole"
            @toggle-station="toggleStation"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create dialog -->
    <v-dialog v-model="showCreateDialog" max-width="400px">
      <v-card>
        <v-card-title>New User</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newUser.name"
            label="Username"
            @keyup.enter="onCreateConfirmed"
          />
          <v-text-field
            v-model="newUser.password"
            type="password"
            label="Password"
            @keyup.enter="onCreateConfirmed"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onCreateConfirmed">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete user "{{ deletingUserName }}"?</v-card-title>
        <v-card-text
          >This will permanently delete the user and all related
          information.</v-card-text
        >
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="onDeleteConfirmed">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Session } from '@/App.vue'
import { api } from '@/main'
import type { EventInfo } from '@/api/index'
import model from '@/model'
import type { User } from '@/remote/model/user'
import UserTable from '@/components/management/desktop/UserTable.vue'
import UserCards from '@/components/management/mobile/UserCards.vue'

export default defineComponent({
  name: 'UserList',
  components: { UserTable, UserCards },
  inject: ['session'],

  data() {
    return {
      loading: false,
      loadingEvents: false,
      users: [] as User[],
      errorMessage: '',
      showCreateDialog: false,
      showDeleteDialog: false,
      deletingUserName: '',
      newUser: model.user.makeEmpty() as any,
      events: [] as EventInfo[],
      selectedEvent: null as EventInfo | null,
      availableStations: [] as string[],
      allRoles: [] as string[],
      userRoles: {} as Record<string, string[]>,
      userStations: {} as Record<string, string[]>,
      loadingUserData: {} as Record<string, boolean>
    }
  },

  async mounted() {
    this.loading = true
    this.loadingEvents = true
    try {
      const [users, events] = await Promise.all([
        api.fetchUsers(),
        api.fetchMyAdminEvents()
      ])
      this.users = users
      this.events = events
      this.errorMessage = ''
      await this.refreshAllRoles()
    } catch {
      this.errorMessage = 'Unable to fetch users (are you logged in?)'
    } finally {
      this.loading = false
      this.loadingEvents = false
    }
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    openCreateDialog() {
      this.newUser = model.user.makeEmpty()
      this.showCreateDialog = true
    },
    openDeleteDialog(userName: string) {
      this.deletingUserName = userName
      this.showDeleteDialog = true
    },
    async onDeleteConfirmed() {
      try {
        await api.deleteUser(this.deletingUserName)
        this.users = this.users.filter((u) => u.name !== this.deletingUserName)
        delete this.userRoles[this.deletingUserName]
        delete this.userStations[this.deletingUserName]
      } catch (e) {
        console.error('Failed to delete user', e)
      }
      this.showDeleteDialog = false
      this.deletingUserName = ''
    },
    async onCreateConfirmed() {
      try {
        const created = await api.addUser(this.newUser)
        this.users.push(created)
        this.userRoles[created.name] = []
        this.userStations[created.name] = []
      } catch (e) {
        console.error('Failed to add user', e)
      }
      this.newUser = model.user.makeEmpty()
      this.showCreateDialog = false
    },
    async refreshAllRoles() {
      const roleSet = new Set<string>()
      await Promise.all(
        this.users.map(async (u) => {
          try {
            const items: any[] = await api.fetchUserRoles(u.name)
            const active: string[] = []
            items.forEach((item) => {
              const [roleName, isActive] = Array.isArray(item)
                ? item
                : [item, true]
              roleSet.add(roleName)
              if (isActive) active.push(roleName)
            })
            this.userRoles[u.name] = active
          } catch (e) {
            console.error('Failed to fetch roles for', u.name, e)
            this.userRoles[u.name] = []
          }
        })
      )
      this.allRoles = Array.from(roleSet).sort()
    },
    async refreshAllStations() {
      if (!this.selectedEvent) {
        this.users.forEach((u) => {
          this.userStations[u.name] = []
        })
        return
      }
      const eventId = this.selectedEvent.id
      await Promise.all(
        this.users.map(async (u) => {
          try {
            const items: [string, boolean][] = await api.fetchUserStations(
              u.name,
              eventId
            )
            const stationSet = new Set(
              items.filter(([, active]) => active).map(([name]) => name)
            )
            this.userStations[u.name] = this.availableStations.filter((s) =>
              stationSet.has(s)
            )
          } catch (e) {
            console.error('Failed to fetch stations for', u.name, e)
            this.userStations[u.name] = []
          }
        })
      )
    },
    async onEventChanged(event: EventInfo | null) {
      this.selectedEvent = event
      this.availableStations = []
      this.users.forEach((u) => {
        this.userStations[u.name] = []
      })
      if (!event) return
      try {
        const stations = await api.fetchStations(event.id)
        this.availableStations = stations.map((s) => s.name)
      } catch (e) {
        console.error('Failed to fetch stations for event', e)
      }
      await this.refreshAllStations()
    },
    async toggleRole(userName: string, roleName: string) {
      const current = this.userRoles[userName] ?? []
      const hasRole = current.includes(roleName)
      this.userRoles[userName] = hasRole
        ? current.filter((r) => r !== roleName)
        : [...current, roleName]
      try {
        if (hasRole) {
          await api.removeUserRole(userName, roleName)
        } else {
          await api.addUserRole(userName, roleName)
        }
      } catch (e) {
        console.error('Failed to toggle role', e)
        this.userRoles[userName] = current
      }
    },
    async toggleStation(userName: string, stationName: string) {
      const current = this.userStations[userName] ?? []
      const hasStation = current.includes(stationName)
      this.userStations[userName] = hasStation
        ? current.filter((s) => s !== stationName)
        : [...current, stationName]
      const eventId = this.selectedEvent?.id
      try {
        if (hasStation) {
          await api.removeStationFromUser(userName, stationName, eventId)
        } else {
          await api.addStationToUser(userName, stationName, eventId)
        }
      } catch (e) {
        console.error('Failed to toggle station', e)
        this.userStations[userName] = current
      }
    }
  }
})
</script>
