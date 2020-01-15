<template>
  <v-app>
    <v-content>
      <router-view
        @fullScreenRequested="setFullscreen"
        @changeActivity="onActivityChange"
        @snackRequested="onSnackRequested"></router-view>
    </v-content>
  </v-app>
</template>

<script>
import WelcomePage from './components/WelcomePage';

export default {
  name: 'App',

  components: {
    WelcomePage,
  },

  data: () => ({
    //
  }),
};
</script>
