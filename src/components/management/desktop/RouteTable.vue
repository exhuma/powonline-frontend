<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-map-marker-path</v-icon>
      <v-toolbar-title>Route Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn v-if="canEdit" color="primary" @click="$emit('open-create')">
        <v-icon start>mdi-plus</v-icon>
        New Route
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="routes"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.color="{ item }">
        <span
          class="d-inline-block rounded"
          :style="{
            width: '24px',
            height: '24px',
            backgroundColor: item.color || '#000000',
            verticalAlign: 'middle'
          }"
        ></span>
        <span class="ml-2">{{ item.color }}</span>
      </template>

      <template v-slot:item.assignedTeams="{ item }">
        <v-menu :close-on-content-click="false" max-height="300">
          <template #activator="{ props: menuProps }">
            <v-btn
              variant="outlined"
              size="small"
              v-bind="menuProps"
              :color="
                assignedTeamNames(item).length > 0 ? 'primary' : undefined
              "
            >
              <v-icon start>mdi-account-group</v-icon>
              {{ assignedTeamNames(item).length }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item v-if="allTeams.length === 0">
              <v-list-item-title class="text-disabled"
                >No teams available</v-list-item-title
              >
            </v-list-item>
            <v-list-item
              v-for="team in allTeams"
              :key="team.name"
              :value="team.name"
              @click.stop
            >
              <template #prepend>
                <v-checkbox-btn
                  :model-value="isTeamAssigned(item, team.name)"
                  :loading="isTeamToggling(item, team.name)"
                  @update:model-value="
                    (val) => $emit('toggle-team', item, team, val)
                  "
                  @click.stop
                />
              </template>
              <v-list-item-title>{{ team.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-slot:item.assignedStations="{ item }">
        <v-menu :close-on-content-click="false" max-height="300">
          <template #activator="{ props: menuProps }">
            <v-btn
              variant="outlined"
              size="small"
              v-bind="menuProps"
              :color="
                assignedStationNames(item).length > 0 ? 'primary' : undefined
              "
            >
              <v-icon start>mdi-map-marker</v-icon>
              {{ assignedStationNames(item).length }}
              <v-icon end>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item v-if="allStations.length === 0">
              <v-list-item-title class="text-disabled"
                >No stations available</v-list-item-title
              >
            </v-list-item>
            <v-list-item
              v-for="station in sortedStations"
              :key="station.name"
              :value="station.name"
              @click.stop
            >
              <template #prepend>
                <v-checkbox-btn
                  :model-value="isStationAssigned(item, station.name)"
                  :loading="isStationToggling(item, station.name)"
                  @update:model-value="
                    (val) => $emit('toggle-station', item, station, val)
                  "
                  @click.stop
                />
              </template>
              <v-list-item-title>
                {{ station.name }}
                <v-chip
                  v-if="station.is_start"
                  size="x-small"
                  color="success"
                  class="ml-1"
                  >S</v-chip
                >
                <v-chip
                  v-if="station.is_end"
                  size="x-small"
                  color="error"
                  class="ml-1"
                  >E</v-chip
                >
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-slot:item.actions="{ item }">
        <RowActions>
          <template #pinned>
            <v-menu v-if="canEdit" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  v-bind="menuProps"
                  :style="{ color: item.color || undefined }"
                  title="Change color"
                >
                  <v-icon>mdi-palette</v-icon>
                </v-btn>
              </template>
              <v-color-picker
                :model-value="item.color"
                @update:model-value="(c) => $emit('set-color', item, c)"
                mode="hex"
              />
            </v-menu>
          </template>
          <v-list-item
            v-if="canEdit"
            prepend-icon="mdi-delete"
            title="Delete"
            class="text-error"
            @click="$emit('open-delete', item)"
          />
        </RowActions>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { AssignmentMap } from '@/remote/model/assignmentMap'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'RouteTable',
  components: { RowActions },
  props: {
    routes: { type: Array as PropType<Route[]>, required: true },
    allTeams: { type: Array as PropType<Team[]>, default: () => [] },
    allStations: { type: Array as PropType<Station[]>, default: () => [] },
    assignments: {
      type: Object as PropType<AssignmentMap>,
      default: () => ({ teams: {}, stations: {} })
    },
    togglingTeams: {
      type: Object as PropType<Set<string>>,
      default: () => new Set<string>()
    },
    togglingStations: {
      type: Object as PropType<Set<string>>,
      default: () => new Set<string>()
    },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false }
  },
  emits: [
    'open-create',
    'open-delete',
    'toggle-team',
    'toggle-station',
    'set-color'
  ],
  data() {
    return {
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Color', key: 'color', sortable: false },
        { title: 'Assigned Teams', key: 'assignedTeams', sortable: false },
        {
          title: 'Assigned Stations',
          key: 'assignedStations',
          sortable: false
        },
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
    sortedStations(): Station[] {
      return this.allStations.slice().sort((a, b) => a.order - b.order)
    }
  },
  methods: {
    assignedTeamNames(route: Route): string[] {
      return (this.assignments.teams[route.name] || []).map((t) => t.name)
    },
    assignedStationNames(route: Route): string[] {
      return (this.assignments.stations[route.name] || []).map((s) => s.name)
    },
    isTeamAssigned(route: Route, teamName: string): boolean {
      return this.assignedTeamNames(route).includes(teamName)
    },
    isStationAssigned(route: Route, stationName: string): boolean {
      return this.assignedStationNames(route).includes(stationName)
    },
    isTeamToggling(route: Route, teamName: string): boolean {
      return this.togglingTeams.has(`${route.name}:${teamName}`)
    },
    isStationToggling(route: Route, stationName: string): boolean {
      return this.togglingStations.has(`${route.name}:${stationName}`)
    }
  }
})
</script>
