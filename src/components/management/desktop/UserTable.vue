<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-account-multiple</v-icon>
      <v-toolbar-title>User Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-select
        v-model="selectedEventProxy"
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
        @update:model-value="$emit('event-changed', $event)"
      />
      <v-text-field
        v-model="filterText"
        append-inner-icon="mdi-magnify"
        label="Filter users"
        hide-details
        density="compact"
        style="max-width: 220px"
        class="mr-2"
      ></v-text-field>
      <v-btn v-if="canEdit" color="primary" @click="$emit('open-create')">
        <v-icon start>mdi-plus</v-icon>
        New User
      </v-btn>
    </v-toolbar>

    <v-alert v-if="errorMessage" type="error" class="mb-2">{{
      errorMessage
    }}</v-alert>

    <v-data-table
      :headers="headers"
      :items="filteredUsers"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.name="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar size="32" v-if="item.avatar_url"
            ><img :src="item.avatar_url"
          /></v-avatar>
          <v-avatar size="32" v-else><v-icon>mdi-face-man</v-icon></v-avatar>
          {{ item.name }}
        </div>
      </template>

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
              <div v-if="loadingUserData[item.name]" class="text-center pa-2">
                <v-progress-circular indeterminate size="20" />
              </div>
              <v-list v-else density="compact">
                <v-list-item
                  v-for="role in allRoles"
                  :key="role"
                  :title="role"
                  @click="$emit('toggle-role', item.name, role)"
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="(userRoles[item.name] ?? []).includes(role)"
                      @click.stop="$emit('toggle-role', item.name, role)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>

      <template v-slot:item.stations="{ item }">
        <template v-if="!selectedEventProxy">
          <span class="text-grey text-caption">Select an event</span>
        </template>
        <v-menu v-else :close-on-content-click="false" location="bottom start">
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
              <div v-if="loadingUserData[item.name]" class="text-center pa-2">
                <v-progress-circular indeterminate size="20" />
              </div>
              <v-list v-else density="compact">
                <v-list-item
                  v-for="station in availableStations"
                  :key="station"
                  :title="station"
                  @click="$emit('toggle-station', item.name, station)"
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="
                        (userStations[item.name] ?? []).includes(station)
                      "
                      @click.stop="$emit('toggle-station', item.name, station)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>

      <template v-slot:item.actions="{ item }">
        <RowActions>
          <v-list-item
            v-if="canEdit"
            prepend-icon="mdi-delete"
            title="Delete"
            base-color="error"
            @click="$emit('open-delete', item.name)"
          />
        </RowActions>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { User } from '@/remote/model/user'
import type { EventInfo } from '@/api'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'UserTable',
  components: { RowActions },
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
    selectedEventProxy: {
      get() {
        return this.selectedEvent
      },
      set(val: EventInfo | null) {
        this.$emit('event-changed', val)
      }
    },
    filteredUsers(): User[] {
      if (this.filterText.trim() === '') return this.users
      const fltr = this.filterText.trim().toLowerCase()
      return this.users.filter((u) => u.name.toLowerCase().includes(fltr))
    }
  }
})
</script>
