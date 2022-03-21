<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>
        {{ team.name }}
        <span v-if="team.route_name === ''"
          ><v-icon color="red" style="vertical-align: text-bottom"
            >mdi-alert</v-icon
          >
          (no route assigned)</span
        >
        <span v-if="team.route_name !== ''"
          >(Route: {{ team.route_name }})</span
        >
        <v-icon v-if="team.is_end">mdi-flag-checkered</v-icon>
        <v-icon v-if="team.is_start">mdi-walk</v-icon>
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="identity.hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>mdi-pencil</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action>
      <v-btn icon ripple @click.native="openDashBoard(team)">
        <v-icon>mdi-table-eye</v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-action class="ml-1" v-if="identity.hasRole('admin')">
      <ConfirmationDialog
        buttonText="Delete"
        :actionArgument="team.name"
        actionName="deleteTeamRemote"
        icon="mdi-delete-forever"
        iconColor="red"
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
      </ConfirmationDialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import ConfirmationDialog from "@/components/ConfirmationDialog";
import model from "@/model";
export default {
  name: "team-block",
  props: {
    team: {
      type: Object,
      default: function () {
        return model.team.makeEmpty();
      },
    },
    identity: {
      type: Object,
    },
  },
  methods: {
    openDashBoard(team) {
      this.$router.push("/team/" + team.name);
    },
    openEditDialog() {
      this.$emit("openEditDialog");
    },
  },
  components: {
    ConfirmationDialog,
  },
};
</script>
