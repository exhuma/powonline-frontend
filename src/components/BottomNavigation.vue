<template>
  <v-bottom-navigation
    app
    transition="slide-y-transition"
    class="hidden-xs-only"
    v-model="isVisible">
    <v-btn
      v-for="route in routes"
      :to="route.path"
      :key="route.path"
      text
      :value="here === route.path"
      >
      <span>{{ route.label }}</span>
      <v-icon>{{route.icon}}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
import {getRoutes} from '@/router'
import {getAuthInfo} from '@/auth.js'
export default {
  name: 'BottomNavigation',
  computed: {
    here () {
      return this.$route.path
    },
    routes () {
      const roles = getAuthInfo().roles
      const output = getRoutes(roles)
      return output
    },
  },
  data: () => ({
    isVisible: true
  }),
};
</script>
