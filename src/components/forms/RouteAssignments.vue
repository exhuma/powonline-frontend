<template>
  <div class="route-assignments">
    <v-row no-gutters>
      <!-- Teams column -->
      <v-col cols="12" md="6" class="pr-md-3">
        <div class="assignment-section">
          <div class="assignment-section__header">
            <v-icon small class="mr-1">mdi-account-group</v-icon>
            <span class="subtitle-2">Teams</span>
            <v-chip x-small class="ml-2" color="primary" outlined>
              {{ assignedTeamObjects.length }}
            </v-chip>
          </div>

          <div class="assignment-section__chips">
            <span v-if="assignedTeamObjects.length === 0" class="no-items-hint">
              No teams assigned
            </span>
            <v-chip
              v-for="team in assignedTeamObjects"
              :key="team.name"
              close
              small
              class="ma-1"
              @click:close="unassignTeam(team.name)"
            >
              {{ team.name }}
            </v-chip>
          </div>

          <v-autocomplete
            v-model="selectedTeam"
            :items="unassignedTeamObjects"
            item-text="name"
            item-value="name"
            label="Add team..."
            placeholder="Search teams"
            prepend-inner-icon="mdi-magnify"
            dense
            outlined
            clearable
            hide-details
            no-data-text="All teams assigned"
            class="mt-3"
            @change="onTeamSelected"
          />
        </div>
      </v-col>

      <v-divider vertical class="d-none d-md-flex mx-2" />

      <!-- Stations column -->
      <v-col cols="12" md="6" class="pl-md-3 mt-4 mt-md-0">
        <div class="assignment-section">
          <div class="assignment-section__header">
            <v-icon small class="mr-1">mdi-map-marker</v-icon>
            <span class="subtitle-2">Stations</span>
            <v-chip x-small class="ml-2" color="primary" outlined>
              {{ assignedStationObjects.length }}
            </v-chip>
          </div>

          <div class="assignment-section__chips">
            <span v-if="assignedStationObjects.length === 0" class="no-items-hint">
              No stations assigned
            </span>
            <v-chip
              v-for="station in assignedStationObjects"
              :key="station.name"
              close
              small
              class="ma-1"
              :color="stationChipColor(station)"
              :text-color="stationChipTextColor(station)"
              @click:close="unassignStation(station.name)"
            >
              <v-avatar left class="order-badge">
                {{ station.order }}
              </v-avatar>
              {{ station.name }}
              <v-chip
                v-if="station.is_start"
                x-small
                color="green darken-2"
                text-color="white"
                class="ml-1 px-1"
              >S</v-chip>
              <v-chip
                v-if="station.is_end"
                x-small
                color="red darken-2"
                text-color="white"
                class="ml-1 px-1"
              >E</v-chip>
            </v-chip>
          </div>

          <v-autocomplete
            v-model="selectedStation"
            :items="unassignedStationItems"
            item-text="label"
            item-value="name"
            label="Add station..."
            placeholder="Search stations"
            prepend-inner-icon="mdi-magnify"
            dense
            outlined
            clearable
            hide-details
            no-data-text="All stations assigned"
            class="mt-3"
            @change="onStationSelected"
          >
            <template v-slot:item="{ item }">
              <v-list-item-avatar
                size="28"
                color="grey lighten-2"
                class="mr-2 my-1"
                style="font-size: 0.75rem; font-weight: bold;"
              >
                {{ item.order }}
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action class="flex-row align-center my-0">
                <v-chip v-if="item.is_start" x-small color="green darken-2" text-color="white" class="mr-1">START</v-chip>
                <v-chip v-if="item.is_end" x-small color="red darken-2" text-color="white">END</v-chip>
              </v-list-item-action>
            </template>
          </v-autocomplete>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import model from '@/model'
import Vue from 'vue'
import { Station } from '@/remote/model/station'
import { Team } from '@/remote/model/team'

const RouteAssignments = Vue.extend({
  name: 'route-assignments',

  props: {
    route: {
      type: Object,
      default() {
        return model.route.makeEmpty()
      }
    }
  },

  data() {
    return {
      selectedTeam: null as string | null,
      selectedStation: null as string | null
    }
  },

  computed: {
    // Compute directly from raw state so Vue can track reactive dependencies.
    // Parametrised Vuex getters (getter-factories) return plain functions whose
    // internal state reads are invisible to Vue's dependency tracking, so
    // computed properties that only call them will NOT re-run when the
    // underlying state mutates.

    assignedTeamObjects(): Team[] {
      // route_team_map: { [teamName]: [routeName, ...] }
      const map: { [key: string]: string[] } = this.$store.state.route_team_map
      const assignedNames = Object.keys(map).filter((teamName) =>
        map[teamName].includes(this.route.name)
      )
      return (this.$store.state.teams as Team[])
        .filter((t: Team) => assignedNames.includes(t.name))
        .sort((a: Team, b: Team) => a.name.localeCompare(b.name))
    },

    unassignedTeamObjects(): Team[] {
      const map: { [key: string]: string[] } = this.$store.state.route_team_map
      const assignedNames = Object.keys(map).filter((teamName) =>
        map[teamName].includes(this.route.name)
      )
      return (this.$store.state.teams as Team[])
        .filter((t: Team) => !assignedNames.includes(t.name))
        .sort((a: Team, b: Team) => a.name.localeCompare(b.name))
    },

    assignedStationObjects(): Station[] {
      // route_station_map: { [routeName]: Station[] }
      const list: Station[] = this.$store.state.route_station_map[this.route.name] || []
      return list.slice().sort((a: Station, b: Station) => a.order - b.order)
    },

    unassignedStationObjects(): Station[] {
      const list: Station[] = this.$store.state.route_station_map[this.route.name] || []
      const assignedNames = list.map((s: Station) => s.name)
      return (this.$store.state.stations as Station[])
        .filter((s: Station) => !assignedNames.includes(s.name))
        .sort((a: Station, b: Station) => a.order - b.order)
    },

    unassignedStationItems(): (Station & { label: string })[] {
      return this.unassignedStationObjects.map((s: Station) => ({
        ...s,
        label: `#${s.order} ${s.name}${s.is_start ? ' [START]' : ''}${s.is_end ? ' [END]' : ''}`
      }))
    }
  },

  methods: {
    onTeamSelected(teamName: string | null) {
      if (!teamName) return
      this.$store.dispatch('assignTeamToRouteRemote', {
        teamName,
        routeName: this.route.name
      })
      this.$nextTick(() => {
        this.selectedTeam = null
      })
    },

    onStationSelected(stationName: string | null) {
      if (!stationName) return
      this.$store.dispatch('assignStationToRouteRemote', {
        stationName,
        routeName: this.route.name
      })
      this.$nextTick(() => {
        this.selectedStation = null
      })
    },

    unassignTeam(teamName: string) {
      this.$store.dispatch('unassignTeamFromRouteRemote', {
        teamName,
        routeName: this.route.name
      })
    },

    unassignStation(stationName: string) {
      this.$store.dispatch('unassignStationFromRouteRemote', {
        stationName,
        routeName: this.route.name
      })
    },

    stationChipColor(station: Station): string {
      if (station.is_start) return 'green lighten-4'
      if (station.is_end) return 'red lighten-4'
      return ''
    },

    stationChipTextColor(station: Station): string {
      if (station.is_start) return 'green darken-3'
      if (station.is_end) return 'red darken-3'
      return ''
    }
  }
})
export default RouteAssignments
</script>

<style scoped>
.route-assignments {
  padding: 4px 0;
}

.assignment-section__header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.assignment-section__chips {
  min-height: 36px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
}

.no-items-hint {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.38);
  padding: 4px 2px;
}

.order-badge {
  font-size: 0.7rem !important;
  font-weight: 700;
}
</style>
