<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>{{ team.name }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-icon v-show="routeColor !== null" :style="routeColor">gesture</v-icon>
    </v-list-tile-action>
    <v-list-tile-action v-if="hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>edit</v-icon></v-btn>
    </v-list-tile-action>
    <v-list-tile-action class="ml-3" v-if="hasRole('admin')">
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="name"
        actionName="deleteTeamRemote"
      >
        <span slot="title"
          >Do you want to delete the team "{{ team.name }}"?</span
        >
        <div slot="text">
          <p>
            this will delete the team with the name "{{ team.name }}" and all
            related information!
          </p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import model from "@/model";
export default {
  name: "team-block",
  data() {
    return {
      stations: [],
    };
  },
  props: {
    team: {
      type: Object,
      default: model.team.makeEmpty(),
    },
  },

  computed: {
    routeColor() {
      let selectedTeam = null;
      this.$store.state.teams.forEach((team) => {
        if (team.name !== this.team.name) {
          return;
        }
        selectedTeam = team;
      });

      let selectedRoute = null;
      this.$store.state.routes.forEach((route) => {
        if (route.name !== selectedTeam.route_name) {
          return;
        }
        selectedRoute = route;
      });

      if (selectedRoute === null) {
        return null;
      }
      if (selectedRoute.color) {
        return `color: ${selectedRoute.color};`;
      } else {
        return "color: #000000;";
      }
    },
  },

  created() {
    this.$remoteProxy.fetchTeamStations(this.team.name).then((items) => {
      this.stations = items;
    });
  },
  methods: {
    hasRole(roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1;
    },
    openEditDialog() {
      this.$emit("openEditDialog");
    },
  },
};
</script>
