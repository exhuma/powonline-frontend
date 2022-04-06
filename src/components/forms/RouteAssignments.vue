<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs6>
        <v-card class="mx-3">
          <v-card-title>Assigned Teams</v-card-title>
          <div v-for="team in assignedTeams" :key="team.name">
            <v-flex xs6>{{ team }}</v-flex>
            <v-flex xs6>
              <v-btn @click="unassignTeam(team)" flat
                ><v-icon>arrow_downward</v-icon></v-btn
              >
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
              <v-btn @click="unassignStation(station)" flat
                ><v-icon>arrow_downward</v-icon></v-btn
              >
            </v-flex>
          </div>
        </v-card>
      </v-flex>

      <v-flex xs6 class="mt-4">
        <v-card class="mx-3">
          <v-card-title>Unassigned Teams</v-card-title>
          <div v-for="team in unassignedTeams" :key="team.name">
            <v-flex xs6>{{ team }}</v-flex>
            <v-flex xs6>
              <v-btn @click="assignTeam(team)" flat
                ><v-icon>arrow_upward</v-icon></v-btn
              >
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
              <v-btn @click="assignStation(station)" flat
                ><v-icon>arrow_upward</v-icon></v-btn
              >
            </v-flex>
          </div>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import model from "@/model";

export default {
  name: "route-assignments",

  props: {
    route: {
      type: Object,
      default() {
        return model.route.makeEmpty();
      },
    },
  },

  computed: {
    assignedTeams() {
      return this.$store.getters.assignedTeams(this.route.name);
    },
    unassignedTeams() {
      return this.$store.getters.unassignedTeams;
    },
    assignedStations() {
      return this.$store.getters.assignedStations(this.route.name);
    },
    unassignedStations() {
      return this.$store.getters.unassignedStations(this.route.name);
    },
  },

  methods: {
    unassignTeam: function (team) {
      this.$store.dispatch("unassignTeamFromRouteRemote", {
        teamName: team,
        routeName: this.route.name,
      });
    },
    assignTeam: function (team) {
      this.$store.dispatch("assignTeamToRouteRemote", {
        teamName: team,
        routeName: this.route.name,
      });
    },
    unassignStation: function (station) {
      this.$store.dispatch("unassignStationFromRouteRemote", {
        stationName: station,
        routeName: this.route.name,
      });
    },
    assignStation: function (station) {
      this.$store.dispatch("assignStationToRouteRemote", {
        stationName: station,
        routeName: this.route.name,
      });
    },
  },
};
</script>
