<template>

  <v-container id="GlobalDashboard">
    <v-layout row wrap>
      <v-flex xs12>

        <route-dashboard
          v-for="route in routes"
          class="mb-5"
          :route="route.name"
          :key="route.name"></route-dashboard>

      </v-flex>
    </v-layout>
  </v-container>

</template>

<script>
export default {
  name: 'global_dashboard',
  computed: {
    routes () {
      return this.$store.state.routes
    }
  },
  created () {
    this.$store.dispatch('fetchGlobalDashboard')
    this.$store.commit('changeTitle', 'Global Dashboard')
  }
}
</script>
