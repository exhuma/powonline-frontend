<template>
  <v-navigation-drawer
    :bottom="$vuetify.breakpoint.xs"
    app
    :value="isVisible"
    @input="onToggle"
  >
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="title"> Application </v-list-item-title>
        <v-list-item-subtitle> subtext </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav>
      <v-list-item v-for="route in routes" :key="route.path" :to="route.path">
        <v-list-item-icon>
          <v-icon>{{ route.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ route.label }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { accessibleRoutes } from "@/router";

export default {
  name: "MainNavigation",
  props: ["identity", "isVisible"],
  created() {
    console.log(this.$vuetify); // eslint-disable-line
  },
  methods: {
    onToggle(value) {
      this.$emit("toggled", value);
    },
  },
  computed: {
    routes() {
      const output = accessibleRoutes(this.identity.roles);
      return output;
    },
  },
};
</script>
