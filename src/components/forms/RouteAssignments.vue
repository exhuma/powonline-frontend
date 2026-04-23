<template>
  <div class="route-assignments">
    <v-row no-gutters>
      <!-- Teams column -->
      <v-col cols="6" class="pr-md-3">
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
              closable
              size="small"
              class="ma-1"
              @click:close="unassignTeam(team.name)"
            >
              {{ team.name }}
            </v-chip>
          </div>

          <v-autocomplete
            v-model="selectedTeam"
            :items="unassignedTeamObjects"
            item-title="name"
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
      <v-col cols="6" class="pl-md-3 mt-4 mt-md-0">
        <div class="assignment-section">
          <div class="assignment-section__header">
            <v-icon small class="mr-1">mdi-map-marker</v-icon>
            <span class="subtitle-2">Stations</span>
            <v-chip x-small class="ml-2" color="primary" outlined>
              {{ assignedStationObjects.length }}
            </v-chip>
          </div>

          <div class="assignment-section__chips">
            <span
              v-if="assignedStationObjects.length === 0"
              class="no-items-hint"
            >
              No stations assigned
            </span>
            <v-chip
              v-for="station in assignedStationObjects"
              :key="station.name"
              closable
              size="small"
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
                >S</v-chip
              >
              <v-chip
                v-if="station.is_end"
                x-small
                color="red darken-2"
                text-color="white"
                class="ml-1 px-1"
                >E</v-chip
              >
            </v-chip>
          </div>

          <v-autocomplete
            v-model="selectedStation"
            :items="unassignedStationItems"
            item-title="label"
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
                style="font-size: 0.75rem; font-weight: bold"
              >
                {{ item.order }}
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action class="flex-row align-center my-0">
                <v-chip
                  v-if="item.is_start"
                  x-small
                  color="green darken-2"
                  text-color="white"
                  class="mr-1"
                  >START</v-chip
                >
                <v-chip
                  v-if="item.is_end"
                  x-small
                  color="red darken-2"
                  text-color="white"
                  >END</v-chip
                >
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
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { Station } from '@/remote/model/station'
import type { Team } from '@/remote/model/team'

const RouteAssignments = defineComponent({
  name: 'route-assignments',
  inject: ['getSelectedEventId'],

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
      selectedStation: null as string | null,
      allTeams: [] as Team[],
      allStations: [] as Station[],
      // teams assigned to this route: Team[]
      assignedTeams: [] as Team[],
      // stations assigned to this route: Station[]
      assignedStations: [] as Station[]
    }
  },

  computed: {
    assignedTeamObjects(): Team[] {
      return this.assignedTeams
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    unassignedTeamObjects(): Team[] {
      const assignedNames = new Set(this.assignedTeams.map((t) => t.name))
      return this.allTeams
        .filter((t) => !assignedNames.has(t.name))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    assignedStationObjects(): Station[] {
      return this.assignedStations.slice().sort((a, b) => a.order - b.order)
    },

    unassignedStationObjects(): Station[] {
      const assignedNames = new Set(this.assignedStations.map((s) => s.name))
      return this.allStations
        .filter((s) => !assignedNames.has(s.name))
        .sort((a, b) => a.order - b.order)
    },

    unassignedStationItems(): (Station & { label: string })[] {
      return this.unassignedStationObjects.map((s: Station) => ({
        ...s,
        label: `#${s.order} ${s.name}${s.is_start ? ' [START]' : ''}${
          s.is_end ? ' [END]' : ''
        }`
      }))
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    async loadData() {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        const [teams, stations, assignments] = await Promise.all([
          api.fetchTeams(eventId),
          api.fetchStations(eventId),
          api.fetchAssignments(eventId)
        ])
        this.allTeams = teams
        this.allStations = stations
        this.assignedTeams = assignments.teams[this.route.name] || []
        this.assignedStations = assignments.stations[this.route.name] || []
      } catch (e) {
        console.error('Failed to load route assignments data', e)
      }
    },

    async onTeamSelected(teamName: string | null) {
      if (!teamName) return
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      const team = this.allTeams.find((t) => t.name === teamName)
      if (!team) return
      try {
        await api.addTeamToRoute(this.route.name, team, eventId)
        if (!this.assignedTeams.find((t) => t.name === teamName)) {
          this.assignedTeams.push(team)
        }
      } catch (e) {
        console.error('Failed to assign team to route', e)
      }
      this.$nextTick(() => {
        this.selectedTeam = null
      })
    },

    async onStationSelected(stationName: string | null) {
      if (!stationName) return
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      const station = this.allStations.find((s) => s.name === stationName)
      if (!station) return
      try {
        await api.assignStationToRoute(this.route.name, station, eventId)
        if (!this.assignedStations.find((s) => s.name === stationName)) {
          this.assignedStations.push(station)
        }
      } catch (e) {
        console.error('Failed to assign station to route', e)
      }
      this.$nextTick(() => {
        this.selectedStation = null
      })
    },

    async unassignTeam(teamName: string) {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        await api.unassignTeamFromRoute(this.route.name, teamName, eventId)
        this.assignedTeams = this.assignedTeams.filter(
          (t) => t.name !== teamName
        )
      } catch (e) {
        console.error('Failed to unassign team from route', e)
      }
    },

    async unassignStation(stationName: string) {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        await api.unassignStationFromRoute(
          this.route.name,
          stationName,
          eventId
        )
        this.assignedStations = this.assignedStations.filter(
          (s) => s.name !== stationName
        )
      } catch (e) {
        console.error('Failed to unassign station from route', e)
      }
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
