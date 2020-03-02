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
import {accessibleRoutes} from '@/router'
export default {
  name: 'BottomNavigation',
  props: [
    'identity'
  ],
  computed: {
    here () {
      return this.$route.path
    },
    routes () {
      const output = accessibleRoutes(this.identity.roles)
      return output
    }
  },
  data: () => ({
    isVisible: true
  })
}
</script>
