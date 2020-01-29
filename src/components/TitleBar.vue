<template>
  <v-app-bar
    app dense dark
    >
    <v-app-bar-nav-icon></v-app-bar-nav-icon>
    <v-toolbar-title>{{ title }} <small>v{{version}}</small></v-toolbar-title>
    <v-spacer></v-spacer>
    <span v-if="userName">Logged in as <span class="accent--text">{{ userName }}</span></span>
    <v-tooltip bottom v-if="userName">
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          @click.native.stop="logoutUser"
          icon><v-icon>mdi-exit-to-app</v-icon></v-btn>
      </template>
      <span>Logout</span>
    </v-tooltip>
    <v-btn
      v-else
      color="success"
      @click.native.stop="showLoginDialog"
    >Login</v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: 'TitleBar',
  methods: {
    logoutUser () {
      this.$emit('logoutRequested')
    }
  },
  props: [
    "title",
    "version",
    "userName"
  ]
};
</script>
