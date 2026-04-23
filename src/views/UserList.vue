<template>
  <div id="UserList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-account-multiple</v-icon>
            <v-toolbar-title>User Management</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-select
              v-model="selectedEvent"
              :items="events"
              item-title="name"
              item-value="id"
              return-object
              clearable
              hide-details
              density="compact"
              label="Event"
              style="max-width: 220px"
              class="mr-2"
              :loading="loadingEvents"
              @update:model-value="onEventChanged"
            />
            <v-text-field
              v-model="userFilterText"
              append-inner-icon="mdi-magnify"
              label="Filter users"
              hide-details
              density="compact"
              style="max-width: 220px"
              class="mr-2"
            ></v-text-field>
            <v-btn
              v-if="hasRole(['admin'])"
              color="primary"
              @click="openCreateDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              New User
            </v-btn>
          </v-toolbar>

          <v-alert v-if="errorMessage" type="error" class="mb-2">
            {{ errorMessage }}
          </v-alert>

          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :items-per-page="15"
            :loading="loading"
            class="elevation-0"
          >
            <!-- Name column -->
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="32" v-if="item.avatar_url">
                  <img :src="item.avatar_url" />
                </v-avatar>
                <v-avatar size="32" v-else>
                  <v-icon>mdi-face-man</v-icon>
                </v-avatar>
                {{ item.name }}
              </div>
            </template>

            <!-- Roles column: chips + inline dropdown to toggle -->
            <template v-slot:item.roles="{ item }">
              <v-menu :close-on-content-click="false" location="bottom start">
                <template #activator="{ props: menuProps }">
                  <div
                    class="d-flex flex-wrap ga-1 align-center cursor-pointer py-1"
                    v-bind="menuProps"
                  >
                    <v-chip
                      v-for="role in userRoles[item.name] ?? []"
                      :key="role"
                      size="small"
                      color="primary"
                      variant="tonal"
                      >{{ role }}</v-chip
                    >
                    <v-icon
                      v-if="!(userRoles[item.name] ?? []).length"
                      size="small"
                      color="grey"
                      >mdi-chevron-down</v-icon
                    >
                  </div>
                </template>
                <v-card min-width="200">
                  <v-card-text class="pa-2">
                    <div
                      v-if="loadingUserData[item.name]"
                      class="text-center pa-2"
                    >
                      <v-progress-circular indeterminate size="20" />
                    </div>
                    <v-list v-else density="compact">
                      <v-list-item
                        v-for="role in allRoles"
                        :key="role"
                        :title="role"
                        @click="toggleRole(item.name, role)"
                      >
                        <template #prepend>
                          <v-checkbox-btn
                            :model-value="
                              (userRoles[item.name] ?? []).includes(role)
                            "
                            @click.stop="toggleRole(item.name, role)"
                          />
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-menu>
            </template>

            <!-- Stations column: chips + inline dropdown (only when event selected) -->
            <template v-slot:item.stations="{ item }">
              <template v-if="!selectedEvent">
                <span class="text-grey text-caption">Select an event</span>
              </template>
              <v-menu
                v-else
                :close-on-content-click="false"
                location="bottom start"
              >
                <template #activator="{ props: menuProps }">
                  <div
                    class="d-flex flex-wrap ga-1 align-center cursor-pointer py-1"
                    v-bind="menuProps"
                  >
                    <v-chip
                      v-for="station in userStations[item.name] ?? []"
                      :key="station"
                      size="small"
                      color="secondary"
                      variant="tonal"
                      >{{ station }}</v-chip
                    >
                    <v-icon
                      v-if="!(userStations[item.name] ?? []).length"
                      size="small"
                      color="grey"
                      >mdi-chevron-down</v-icon
                    >
                  </div>
                </template>
                <v-card min-width="200">
                  <v-card-text class="pa-2">
                    <div
                      v-if="loadingUserData[item.name]"
                      class="text-center pa-2"
                    >
                      <v-progress-circular indeterminate size="20" />
                    </div>
                    <v-list v-else density="compact">
                      <v-list-item
                        v-for="station in availableStations"
                        :key="station"
                        :title="station"
                        @click="toggleStation(item.name, station)"
                      >
                        <template #prepend>
                          <v-checkbox-btn
                            :model-value="
                              (userStations[item.name] ?? []).includes(station)
                            "
                            @click.stop="toggleStation(item.name, station)"
                          />
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-menu>
            </template>

            <!-- Actions column -->
            <template v-slot:item.actions="{ item }">
              <RowActions>
                <template #pinned>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="openEditDialog(item.name)"
                    title="Edit user"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </RowActions>
            </template>
          </v-data-table>
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

    <!-- Edit user dialog (roles, stations) -->
    <v-dialog v-model="showEditDialog" max-width="500px">
      <UserBlock
        ref="userDialog"
        :name="editingUserName"
        @closeButtonClicked="showEditDialog = false"
        @deleted="onUserDeleted"
        @roles-changed="onUserRolesChanged"
        @stations-changed="onUserStationsChanged"
      />
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
import UserBlock from '@/components/UserBlock.vue'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'UserList',
  components: { UserBlock, RowActions },
  inject: ['session'],

  data() {
    return {
      loading: false,
      loadingEvents: false,
      users: [] as User[],
      userFilterText: '',
      errorMessage: '',
      showCreateDialog: false,
      showEditDialog: false,
      editingUserName: '',
      newUser: model.user.makeEmpty() as any,
      events: [] as EventInfo[],
      selectedEvent: null as EventInfo | null,
      /** All stations belonging to the selected event */
      availableStations: [] as string[],
      /** All possible role names (populated from first user fetch) */
      allRoles: [] as string[],
      /** Map of userName → assigned role names */
      userRoles: {} as Record<string, string[]>,
      /** Map of userName → assigned station names (for selected event) */
      userStations: {} as Record<string, string[]>,
      /** Set of userNames whose data is currently being fetched */
      loadingUserData: {} as Record<string, boolean>,
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Roles', key: 'roles', sortable: false },
        { title: 'Stations', key: 'stations', sortable: false },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      ]
    }
  },

  computed: {
    filteredUsers(): User[] {
      if (this.userFilterText.trim() === '') return this.users
      const fltr = this.userFilterText.trim().toLowerCase()
      return this.users.filter((u) => u.name.toLowerCase().includes(fltr))
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
      // Pre-load roles for all users
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

    openEditDialog(userName: string) {
      this.editingUserName = userName
      this.showEditDialog = true
      this.$nextTick(() => {
        // @ts-expect-error - ref typing
        this.$refs.userDialog?.refresh?.()
      })
    },

    onUserDeleted(userName: string) {
      this.users = this.users.filter((u) => u.name !== userName)
      delete this.userRoles[userName]
      delete this.userStations[userName]
      this.showEditDialog = false
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

    /** Reload roles for every user, collecting the full set of possible roles. */
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

    /** Reload station assignments for all users for the currently selected event. */
    async refreshAllStations() {
      if (!this.selectedEvent) {
        this.users.forEach((u) => {
          this.userStations[u.name] = []
        })
        return
      }
      await Promise.all(
        this.users.map(async (u) => {
          try {
            const items: [string, boolean][] = await api.fetchUserStations(
              u.name
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
      // Optimistic update
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
        // Revert
        this.userRoles[userName] = current
      }
    },

    async toggleStation(userName: string, stationName: string) {
      const current = this.userStations[userName] ?? []
      const hasStation = current.includes(stationName)
      // Optimistic update
      this.userStations[userName] = hasStation
        ? current.filter((s) => s !== stationName)
        : [...current, stationName]
      try {
        if (hasStation) {
          await api.removeStationFromUser(userName, stationName)
        } else {
          await api.addStationToUser(userName, stationName)
        }
      } catch (e) {
        console.error('Failed to toggle station', e)
        // Revert
        this.userStations[userName] = current
      }
    },

    /** Called by UserBlock when it changes roles internally, so the table stays in sync. */
    onUserRolesChanged(userName: string, roles: string[]) {
      this.userRoles[userName] = roles
    },

    /** Called by UserBlock when it changes stations internally. */
    onUserStationsChanged(userName: string, stations: string[]) {
      if (!this.selectedEvent) return
      this.userStations[userName] = this.availableStations.filter((s) =>
        stations.includes(s)
      )
    }
  }
})
</script>
