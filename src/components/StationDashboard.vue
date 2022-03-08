<template>
  <CenterCol id="Dashboard">
    <v-text-field
      v-model="teamFilter"
      append-icon="mdi-magnify"
      clearable
      label="Filter"
      @click:clear="onFilterCleared"
      hint="Filter list of teams by name and/or contact"
    ></v-text-field>

    <v-layout row>
      <v-flex xs-4>
        <v-checkbox name="showPending" label="Pending" v-model="showPending" />
      </v-flex>
      <v-flex xs-4>
        <v-checkbox name="showArrived" label="Arrived" v-model="showArrived" />
      </v-flex>
      <v-flex xs-4>
        <v-checkbox
          name="showFinished"
          label="Finished"
          v-model="showFinished"
        />
      </v-flex>
    </v-layout>

    <small-station-dashboard-item
      v-for="(state, idx) in teamsWithSelectedState"
      class="mb-4"
      @scoreUpdated="onScoreUpdated"
      @questionnaireScoreUpdated="onQuestionnaireScoreUpdated"
      @saveClicked="onSaveClicked"
      @stateAdvanced="onStateAdvanced"
      :state="state"
      :key="'small' + idx"
    ></small-station-dashboard-item>

    <v-snackbar
      :top="true"
      :timeout="2000"
      :color="snackColor"
      v-model="snackbar"
    >
      {{ snacktext }}
      <v-btn flat @click="snackbar = false">Close</v-btn></v-snackbar
    >
  </CenterCol>
</template>

<script>
import CenterCol from "@/components/CenterCol";
export default {
  name: "StationDashboard",
  data() {
    return {
      activeTab: "pending",
      snackbar: false,
      snacktext: "",
      snackColor: "success",
      teamFilter: "",
      showPending: true,
      showArrived: true,
      showFinished: false
    };
  },
  computed: {
    selectedStates() {
      let output = [];
      if (this.showPending) {
        output.push("unknown");
      }
      if (this.showArrived) {
        output.push("arrived");
      }
      if (this.showFinished) {
        output.push("finished");
      }
      return output;
    },
    allTeams() {
      const output = [];
      this.$store.state.global_dashboard.forEach(teamInfo => {
        teamInfo.stations.forEach(stationState => {
          if (stationState.name !== this.$route.params.stationName) {
            return; // skip states from other stations
          }
          if (stationState.state === "unreachable") {
            // This team cannot reach the current sation (not assigned)
            return;
          }
          output.push({
            team: teamInfo.team,
            station: this.$route.params.stationName,
            state: stationState.state,
            score: stationState.score
          });
        });
      });
      let filtered = this.filteredTeams(output);
      return filtered;
    },
    teamsWithSelectedState() {
      const teams = this.allTeams.filter(item => {
        return this.selectedStates.includes(item.state);
      });
      return teams;
    }
  },
  created() {
    this.$store.commit(
      "changeTitle",
      "Dashboard for " + this.$route.params.stationName
    );
    this.$store.dispatch("fetchQuestionnaireScores");
  },
  methods: {
    onFilterCleared() {
      this.teamFilter = "";
    },
    filteredTeams: function(teams) {
      let all = teams;
      if (!this.teamFilter || this.teamFilter.length < 3) {
        return all;
      }
      let filtered = all.filter(item => {
        let fltr = this.teamFilter.toLowerCase();
        let teamData = this.$store.getters.findTeam(item.team);
        let contactMatches = teamData.contact.toLowerCase().includes(fltr);
        let nameMatches = item.team.toLowerCase().includes(fltr);
        return nameMatches || contactMatches;
      });
      return filtered;
    },
    onStateAdvanced: function(state) {
      this.$store.dispatch("advanceState", {
        teamName: state.team,
        stationName: this.$route.params.stationName
      });
    },
    onScoreUpdated: function(state, newScore) {
      this.$store
        .dispatch("setStationScore", {
          teamName: state.team,
          stationName: this.$route.params.stationName,
          score: newScore
        })
        .then(() => {});
    },
    onQuestionnaireScoreUpdated: function(payload) {
      const data = {
        teamName: payload.team,
        stationName: this.$route.params.stationName,
        score: payload.score
      };
      this.$store.dispatch("setQuestionnaireScore", data);
    },
    onSaveClicked: function() {
      this.snacktext = "Changes saved";
      this.snackColor = "success";
      this.snackbar = true;
    }
  },
  components: {
    CenterCol
  }
};
</script>

<style scoped>
.bigrow {
  padding: 1em 0;
}
</style>
