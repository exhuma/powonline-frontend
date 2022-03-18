<template>
  <CenterCol id="TeamList">
    <v-dialog v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
      </v-card>
      <v-card-text class="white--text">
        {{ errorText }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="errorDialog = false">OK</v-btn>
      </v-card-actions>
    </v-dialog>
    <PopupDialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="this.sendMode == this.SEND_MODE.UPDATE"
      title="Add New Team"
    >
      <TeamForm :team="selectedTeam" />
    </PopupDialog>
    <v-list two-line>
      <TeamBlock
        v-for="team in teams"
        @openEditDialog="onOpenEditDialog(team)"
        :identity="identity"
        :team="team"
        :key="team.name"
      ></TeamBlock>
      <v-list-item>
        <v-spacer />
        <v-btn @click="openCreateDialog" v-if="identity.hasRole('admin')"
          >Add new Team</v-btn
        >
      </v-list-item>
    </v-list>
  </CenterCol>
</template>

<script>
const LOG = window.console.log;

import model from "@/model";
import CenterCol from "@/components/CenterCol";
import PopupDialog from "@/components/PopupDialog";
import TeamBlock from "@/components/TeamBlock";
import TeamForm from "@/components/TeamForm";

export default {
  name: "TeamList",
  props: {
    identity: {
      type: Object,
    },
  },
  methods: {
    onOpenEditDialog: function (team) {
      this.selectedTeam = team;
      this.isAddBlockVisible = true;
      this.sendMode = model.SEND_MODE.UPDATE;
    },
    onDialogConfirmed: function () {
      const team = this.selectedTeam;

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch("addTeamRemote", team);
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        team.contact = team.contact || "";
        team.phone = team.phone || "";
        this.$remoteProxy.updateTeam(team.name, team).catch((error) => {
          this.errorDialog = true;
          this.errorText = error.response.data;
        });
      } else {
        LOG.error("Invalid send mode: " + this.sendMode);
      }

      this.$emit("teamSaved", team);
      this.selectedTeam = model.team.makeEmpty();

      this.isAddBlockVisible = false;
    },
    closeAddBlock() {
      this.isAddBlockVisible = false;
    },
    openCreateDialog: function () {
      const newTeam = model.team.makeEmpty();

      this.selectedTeam = newTeam;
      this.isAddBlockVisible = true;
      this.sendMode = model.SEND_MODE.CREATE;
    },
  },
  created() {
    this.$store.commit("changeTitle", "Team List");
  },
  data() {
    return {
      isAddBlockVisible: false,
      selectedTeam: model.team.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      errorDialog: false,
      errorText: "",
      SEND_MODE: model.SEND_MODE,
    };
  },
  computed: {
    teams() {
      let copy = this.$store.state.teams.concat();
      copy.sort((a, b) => {
        return parseInt(a.order, 10) - parseInt(b.order, 10);
      });
      return copy;
    },
  },
  components: {
    CenterCol,
    PopupDialog,
    TeamBlock,
    TeamForm,
  },
};
</script>

<style scoped>
#TeamList {
  padding-bottom: 5em;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}
.slide-enter {
  transform: translateY(-100px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}
</style>
