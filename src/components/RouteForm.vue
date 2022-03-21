<template>
  <v-container>
    <v-text-field
      name="name"
      type="text"
      v-model="route.name"
      label="Enter a new route name"
    />
    <v-color-picker
      name="color"
      type="text"
      v-model="route.color"
      hint="Color to use for this route"
      label="Route color"
    />
    <v-divider class="ma-5"></v-divider>
    <h3>Tams on this Route</h3>
    <ul>
      <li v-for="item in teams" :key="item">{{ item }}</li>
    </ul>
  </v-container>
</template>

<script>
export default {
  name: "RouteForm",
  props: {
    route: {
      type: Object,
    },
  },
  computed: {
    teams() {
      return this.$store.getters.assignedTeams(this.route.name);
    },
  },
};
</script>
