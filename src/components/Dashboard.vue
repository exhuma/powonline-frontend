<template>
  <v-container id="GlobalDashboard">
    <v-layout row wrap>
      <v-flex xs12>
        <RouteDashboard
          v-for="route in routes"
          class="mb-5"
          :route="route"
          :key="route.name"
        ></RouteDashboard>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import RouteDashboard from "@/components/RouteDashboard";
export default {
  name: "Dashboard",
  components: {
    RouteDashboard,
  },
  computed: {
    routes() {
      return this.$store.state.routes;
    },
  },
  created() {
    this.$store.dispatch("refreshGlobalDashboard");
    this.$store.dispatch("fetchQuestionnaireScores");
    this.$store.commit("changeTitle", "Global Dashboard");
  },
};
</script>
