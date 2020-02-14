<template>
  <v-navigation-drawer permanent app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Application
          </v-list-item-title>
          <v-list-item-subtitle>
            subtext
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list
        dense
        nav
      >
        <v-list-item
          v-for="route in routes"
          :key="route.path"
          :to="route.path"
        >
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
import {getRoutes} from '@/router'
import auth from '@/auth.js'

export default {
  name: 'MainNavigation',

  computed: {
    routes () {
      const roles = auth.getAuthInfo().roles
      const output = getRoutes(roles)
        .filter((item) => {
          return item.inMenu
        })
      return output
    }
  }

}
</script>
