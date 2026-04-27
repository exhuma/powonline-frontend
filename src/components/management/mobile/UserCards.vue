<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-account-multiple</v-icon>
          <span class="text-h6">User Management</span>
          <v-spacer />
          <v-btn
            v-if="canEdit"
            color="primary"
            size="small"
            @click="$emit('open-create')"
          >
            <v-icon start>mdi-plus</v-icon>
            New User
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            :model-value="selectedEvent"
            :items="events"
            item-title="name"
            item-value="id"
            return-object
            clearable
            hide-details
            density="compact"
            label="Filter by event (for station assignments)"
            :loading="loadingEvents"
            @update:model-value="$emit('event-changed', $event)"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="filterText"
            append-inner-icon="mdi-magnify"
            label="Filter users"
            hide-details
            density="compact"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-alert v-if="errorMessage" type="error" class="mb-2 mx-2">{{
      errorMessage
    }}</v-alert>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="user in filteredUsers" :key="user.name">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2">
            <v-avatar size="28" v-if="user.avatar_url"
              ><img :src="user.avatar_url"
            /></v-avatar>
            <v-avatar size="28" v-else
              ><v-icon size="small">mdi-face-man</v-icon></v-avatar
            >
            <span class="font-weight-medium">{{ user.name }}</span>
            <v-spacer />
            <template v-if="(userRoles[user.name] ?? []).length">
              <v-chip
                v-for="role in (userRoles[user.name] ?? []).slice(0, 2)"
                :key="role"
                size="x-small"
                color="primary"
                variant="tonal"
                >{{ role }}</v-chip
              >
              <v-chip
                v-if="(userRoles[user.name] ?? []).length > 2"
                size="x-small"
              >
                +{{ (userRoles[user.name] ?? []).length - 2 }}
              </v-chip>
            </template>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <!-- Roles -->
          <div class="mb-3">
            <div class="text-caption text-disabled mb-1">Roles</div>
            <v-menu :close-on-content-click="false" location="bottom start">
              <template #activator="{ props: menuProps }">
                <div
                  class="d-flex flex-wrap ga-1 align-center cursor-pointer"
                  v-bind="menuProps"
                >
                  <v-chip
                    v-for="role in userRoles[user.name] ?? []"
                    :key="role"
                    size="small"
                    color="primary"
                    variant="tonal"
                    >{{ role }}</v-chip
                  >
                  <v-btn size="x-small" variant="tonal" icon v-bind="menuProps"
                    ><v-icon>mdi-pencil</v-icon></v-btn
                  >
                </div>
              </template>
              <v-card min-width="200">
                <v-card-text class="pa-2">
                  <div
                    v-if="loadingUserData[user.name]"
                    class="text-center pa-2"
                  >
                    <v-progress-circular indeterminate size="20" />
                  </div>
                  <v-list v-else density="compact">
                    <v-list-item
                      v-for="role in allRoles"
                      :key="role"
                      :title="role"
                      @click="$emit('toggle-role', user.name, role)"
                    >
                      <template #prepend>
                        <v-checkbox-btn
                          :model-value="
                            (userRoles[user.name] ?? []).includes(role)
                          "
                          @click.stop="$emit('toggle-role', user.name, role)"
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-menu>
          </div>

          <!-- Station assignments -->
          <div class="mb-3" v-if="selectedEvent">
            <div class="text-caption text-disabled mb-1">
              Station Assignments
            </div>
            <v-menu :close-on-content-click="false" location="bottom start">
              <template #activator="{ props: menuProps }">
                <div
                  class="d-flex flex-wrap ga-1 align-center cursor-pointer"
                  v-bind="menuProps"
                >
                  <v-chip
                    v-for="station in userStations[user.name] ?? []"
                    :key="station"
                    size="small"
                    color="secondary"
                    variant="tonal"
                    >{{ station }}</v-chip
                  >
                  <v-chip
                    v-if="!(userStations[user.name] ?? []).length"
                    size="small"
                    variant="tonal"
                    >None</v-chip
                  >
                  <v-btn size="x-small" variant="tonal" icon v-bind="menuProps"
                    ><v-icon>mdi-pencil</v-icon></v-btn
                  >
                </div>
              </template>
              <v-card min-width="200">
                <v-card-text class="pa-2">
                  <div
                    v-if="loadingUserData[user.name]"
                    class="text-center pa-2"
                  >
                    <v-progress-circular indeterminate size="20" />
                  </div>
                  <v-list v-else density="compact">
                    <v-list-item
                      v-for="station in availableStations"
                      :key="station"
                      :title="station"
                      @click="$emit('toggle-station', user.name, station)"
                    >
                      <template #prepend>
                        <v-checkbox-btn
                          :model-value="
                            (userStations[user.name] ?? []).includes(station)
                          "
                          @click.stop="
                            $emit('toggle-station', user.name, station)
                          "
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-menu>
          </div>
          <div v-else class="text-caption text-disabled mb-3">
            Select an event above to manage station assignments.
          </div>

          <v-divider class="my-2" />
          <div class="d-flex ga-2">
            <v-btn
              v-if="canEdit"
              variant="tonal"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="$emit('open-delete', user.name)"
              >Delete</v-btn
            >
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && filteredUsers.length === 0"
      class="text-center text-disabled pa-8"
    >
      No users found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { User } from '@/remote/model/user'
import type { EventInfo } from '@/api'

export default defineComponent({
  name: 'UserCards',
  props: {
    users: { type: Array as PropType<User[]>, required: true },
    events: { type: Array as PropType<EventInfo[]>, default: () => [] },
    selectedEvent: {
      type: Object as PropType<EventInfo | null>,
      default: null
    },
    availableStations: { type: Array as PropType<string[]>, default: () => [] },
    allRoles: { type: Array as PropType<string[]>, default: () => [] },
    userRoles: {
      type: Object as PropType<Record<string, string[]>>,
      default: () => ({})
    },
    userStations: {
      type: Object as PropType<Record<string, string[]>>,
      default: () => ({})
    },
    loadingUserData: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({})
    },
    loading: { type: Boolean, default: false },
    loadingEvents: { type: Boolean, default: false },
    errorMessage: { type: String, default: '' },
    canEdit: { type: Boolean, default: false }
  },
  emits: [
    'open-create',
    'open-delete',
    'event-changed',
    'toggle-role',
    'toggle-station'
  ],
  data() {
    return {
      filterText: '',
      expanded: [] as number[]
    }
  },
  computed: {
    filteredUsers(): User[] {
      if (this.filterText.trim() === '') return this.users
      const fltr = this.filterText.trim().toLowerCase()
      return this.users.filter((u) => u.name.toLowerCase().includes(fltr))
    }
  }
})
</script>
