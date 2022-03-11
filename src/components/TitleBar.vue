<template>
  <v-app-bar app dense dark>
    <v-app-bar-nav-icon @click="onMenuClicked"></v-app-bar-nav-icon>
    <v-toolbar-title
      >{{ title }} <small>v{{ version }}</small></v-toolbar-title
    >
    <v-spacer></v-spacer>
    <span v-if="loggedIn"
      >Logged in as
      <span class="accent--text">{{ identity.username }}</span></span
    >
    <v-tooltip bottom v-if="loggedIn">
      <template v-slot:activator="{ on }">
        <slot v-on="on" name="logoutButton"></slot>
      </template>
      <span>Logout</span>
    </v-tooltip>
    <template v-else>
      <slot name="loginButton"></slot>
    </template>
  </v-app-bar>
</template>

<script>
export default {
  name: "TitleBar",
  props: ["title", "version", "identity"],
  methods: {
    onMenuClicked() {
      this.$emit("menuClicked");
    },
  },
  computed: {
    loggedIn: function () {
      return this.identity !== null && this.identity.isUsable();
    },
  },
};
</script>
