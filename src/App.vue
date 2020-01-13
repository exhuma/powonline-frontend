<template>
  <v-app>
    <v-content>
      <WelcomePage />
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
