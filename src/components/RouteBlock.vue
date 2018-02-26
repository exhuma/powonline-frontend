<template>
  <v-card
      class="mt-3"
      :style="'border-left: 3px solid ' + routeColor">
    <v-card-title><span class="white--text">Route: "{{ route.name }}"</span></v-card-title>
    <v-card-text>
      <v-layout row wrap>
        <!-- Assigned Items -->
        <v-flex xs6>
          <v-card class="mx-3">
            <v-card-title>Assigned Teams</v-card-title>
            <div v-for="team in assignedTeams" :key="team.name">
              <v-flex xs6>{{ team }}</v-flex>
              <v-flex xs6>
                <v-btn @click="unassignTeam(team)" flat><v-icon>arrow_downward</v-icon></v-btn>
              </v-flex>
            </div>
          </v-card>
        </v-flex>
        <v-flex xs6>
          <v-card class="mx-3">
            <v-card-title>Assigned Stations</v-card-title>
            <div v-for="station in assignedStations" :key="station.name">
              <v-flex xs6>{{ station }}</v-flex>
              <v-flex xs6>
                <v-btn @click="unassignStation(station)" flat><v-icon>arrow_downward</v-icon></v-btn>
              </v-flex>
            </div>
          </v-card>
        </v-flex>

        <!-- Unassigned Items -->
        <v-flex xs6 class="mt-4">
          <v-card class="mx-3">
            <v-card-title>Unassigned Teams</v-card-title>
            <div v-for="team in unassignedTeams" :key="team.name">
              <v-flex xs6>{{ team }}</v-flex>
              <v-flex xs6>
                <v-btn @click="assignTeam(team)" flat><v-icon>arrow_upward</v-icon></v-btn>
              </v-flex>
            </div>
          </v-card>
        </v-flex>
        <v-flex xs6 class="mt-4">
          <v-card class="mx-3">
            <v-card-title>Unassigned Stations</v-card-title>
            <div v-for="station in unassignedStations" :key="station.name">
              <v-flex xs6>{{ station }}</v-flex>
              <v-flex xs6>
                <v-btn @click="assignStation(station)" flat><v-icon>arrow_upward</v-icon></v-btn>
              </v-flex>
            </div>
          </v-card>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions v-if="hasRole('admin')">
      <confirmation-dialog buttonText="Delete" :actionArgument="route.name" actionName="deleteRouteRemote">
        <span slot="title">Do you want to delete the route "{{ route.name }}"?</span>
        <div slot="text">
          <p>this will delete the route with the name "{{ route.name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'route-block',
  props: {
    'route': {
      type: Object,
      default: 'Unknown Route'
    }
  },
  computed: {
    routeColor () {
      if (this.route.color) {
        return this.route.color
      } else {
        return '#000000'
      }
    },
    assignedTeams () {
      return this.$store.getters.assignedTeams(this.route.name)
    },
    unassignedTeams () {
      return this.$store.getters.unassignedTeams
    },
    assignedStations () {
      return this.$store.getters.assignedStations(this.route.name)
    },
    unassignedStations () {
      return this.$store.getters.unassignedStations(this.route.name)
    }
  },
  methods: {
    unassignTeam: function (team) {
      this.$store.dispatch('unassignTeamFromRouteRemote', {teamName: team, routeName: this.route.name})
    },
    assignTeam: function (team) {
      this.$store.dispatch('assignTeamToRouteRemote', {teamName: team, routeName: this.route.name})
    },
    unassignStation: function (station) {
      this.$store.dispatch('unassignStationFromRouteRemote', {stationName: station, routeName: this.route.name})
    },
    assignStation: function (station) {
      this.$store.dispatch('assignStationToRouteRemote', {stationName: station, routeName: this.route.name})
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  }
}
</script>
