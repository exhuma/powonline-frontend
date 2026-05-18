<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-map-marker-multiple</v-icon>
          <span class="text-h6">Station Management</span>
          <v-spacer />
          <v-btn
            v-if="canEdit"
            color="primary"
            size="small"
            @click="$emit('open-create')"
          >
            <v-icon start>mdi-plus</v-icon>
            New Station
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="station in stations" :key="station.name">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2">
            <span class="text-caption text-disabled mr-1"
              >#{{ station.order }}</span
            >
            <span class="font-weight-medium">{{ station.name }}</span>
            <v-spacer />
            <v-chip
              v-if="station.is_start"
              size="x-small"
              color="success"
              class="mr-1"
              >Departure</v-chip
            >
            <v-chip v-if="station.is_end" size="x-small" color="error"
              >Arrival</v-chip
            >
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-if="isFullStation(station) && station.contact"
              prepend-icon="mdi-account"
            >
              <v-list-item-title>{{ station.contact }}</v-list-item-title>
              <v-list-item-subtitle>Contact</v-list-item-subtitle>
            </v-list-item>
            <v-list-item
              v-if="isFullStation(station) && station.phone"
              prepend-icon="mdi-phone"
            >
              <v-list-item-title>{{ station.phone }}</v-list-item-title>
              <v-list-item-subtitle>Phone</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-divider class="my-2" />
          <div class="d-flex ga-2 flex-wrap">
            <v-btn
              v-if="canEdit"
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="$emit('open-edit', station)"
              >Edit</v-btn
            >
            <v-btn
              v-if="canDashboard(station.name)"
              variant="tonal"
              size="small"
              prepend-icon="mdi-clipboard-text"
              @click="$emit('open-dashboard', station)"
              >Dashboard</v-btn
            >
            <v-btn
              v-if="canEdit"
              variant="tonal"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="$emit('open-delete', station)"
              >Delete</v-btn
            >
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && stations.length === 0"
      class="text-center text-disabled pa-8"
    >
      No stations found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { AnyStation } from '@/remote/model/station'
import { isFullStation } from '@/remote/model/station'

export default defineComponent({
  name: 'StationCards',
  props: {
    stations: { type: Array as PropType<AnyStation[]>, required: true },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    myStations: {
      type: Object as PropType<Set<string>>,
      default: () => new Set<string>()
    },
    canOpenAnyDashboard: { type: Boolean, default: false }
  },
  emits: ['open-create', 'open-edit', 'open-delete', 'open-dashboard'],
  data() {
    return {
      expanded: [] as number[]
    }
  },
  methods: {
    isFullStation,
    canDashboard(stationName: string): boolean {
      if (this.canOpenAnyDashboard) return true
      return this.myStations.has(stationName)
    }
  }
})
</script>
