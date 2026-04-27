<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-map-marker-path</v-icon>
          <span class="text-h6">Route Management</span>
          <v-spacer />
          <v-btn
            v-if="canEdit"
            color="primary"
            size="small"
            @click="$emit('open-create')"
          >
            <v-icon start>mdi-plus</v-icon>
            New Route
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="route in routes" :key="route.name">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2">
            <span
              class="d-inline-block rounded flex-shrink-0"
              :style="{
                width: '16px',
                height: '16px',
                backgroundColor: route.color || '#888'
              }"
            ></span>
            <span class="font-weight-medium">{{ route.name }}</span>
            <v-spacer />
            <v-chip
              size="x-small"
              :color="
                assignedTeamNames(route).length > 0 ? 'primary' : undefined
              "
              class="mr-1"
            >
              <v-icon start size="x-small">mdi-account-group</v-icon>
              {{ assignedTeamNames(route).length }}
            </v-chip>
            <v-chip
              size="x-small"
              :color="
                assignedStationNames(route).length > 0 ? 'primary' : undefined
              "
            >
              <v-icon start size="x-small">mdi-map-marker</v-icon>
              {{ assignedStationNames(route).length }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <!-- Team assignment -->
          <div class="mb-3">
            <div class="text-caption text-disabled mb-1">Teams</div>
            <v-menu :close-on-content-click="false" max-height="300">
              <template #activator="{ props: menuProps }">
                <v-btn
                  variant="outlined"
                  size="small"
                  v-bind="menuProps"
                  :color="
                    assignedTeamNames(route).length > 0 ? 'primary' : undefined
                  "
                >
                  <v-icon start>mdi-account-group</v-icon>
                  {{ assignedTeamNames(route).length }} assigned
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
                  @click.stop
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="isTeamAssigned(route, team.name)"
                      :loading="isTeamToggling(route, team.name)"
                      @update:model-value="
                        (val) => $emit('toggle-team', route, team, val)
                      "
                      @click.stop
                    />
                  </template>
                  <v-list-item-title>{{ team.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- Station assignment -->
          <div class="mb-3">
            <div class="text-caption text-disabled mb-1">Stations</div>
            <v-menu :close-on-content-click="false" max-height="300">
              <template #activator="{ props: menuProps }">
                <v-btn
                  variant="outlined"
                  size="small"
                  v-bind="menuProps"
                  :color="
                    assignedStationNames(route).length > 0
                      ? 'primary'
                      : undefined
                  "
                >
                  <v-icon start>mdi-map-marker</v-icon>
                  {{ assignedStationNames(route).length }} assigned
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
                  @click.stop
                >
                  <template #prepend>
                    <v-checkbox-btn
                      :model-value="isStationAssigned(route, station.name)"
                      :loading="isStationToggling(route, station.name)"
                      @update:model-value="
                        (val) => $emit('toggle-station', route, station, val)
                      "
                      @click.stop
                    />
                  </template>
                  <v-list-item-title>
                    <span class="text-caption text-disabled mr-1"
                      >#{{ station.order }}</span
                    >
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
          </div>

          <v-divider class="my-2" />

          <!-- Color + delete actions -->
          <div class="d-flex ga-2 align-center flex-wrap">
            <v-menu v-if="canEdit" :close-on-content-click="false">
              <template #activator="{ props: menuProps }">
                <v-btn
                  variant="tonal"
                  size="small"
                  v-bind="menuProps"
                  :style="{ color: route.color || undefined }"
                  prepend-icon="mdi-palette"
                >
                  Color
                </v-btn>
              </template>
              <v-color-picker
                :model-value="route.color"
                @update:model-value="(c) => $emit('set-color', route, c)"
                mode="hex"
              />
            </v-menu>
            <v-btn
              v-if="canEdit"
              variant="tonal"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="$emit('open-delete', route)"
            >
              Delete
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && routes.length === 0"
      class="text-center text-disabled pa-8"
    >
      No routes found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Route } from '@/remote/model/route'
import type { Team } from '@/remote/model/team'
import type { Station } from '@/remote/model/station'
import type { AssignmentMap } from '@/remote/model/assignmentMap'

export default defineComponent({
  name: 'RouteCards',
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
      expanded: [] as number[]
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
