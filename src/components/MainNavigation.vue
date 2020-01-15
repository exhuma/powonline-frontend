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
          :key="route.to"
          :to="route.to"
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
export default {
  name: 'MainNavigation',

  computed: {
    routes () {
      const output = [
        { label: 'Dashboard', to: '/matrix', icon: 'mdi-border-all' },
        { label: 'Scoreboard', to: '/scoreboard', icon: 'mdi-format-list-numbered' },
        { label: 'Photos', to: '/gallery', icon: 'mdi-image' }
      ]
      if (this.tokenIsAvailable) {
        output.push({ label: 'Stations', to: '/station', icon: 'mdi-place' })
        output.push({ label: 'Teams', to: '/team', icon: 'mdi-group' })
        output.push({ label: 'Uploads', to: '/uploads', icon: 'mdi-cloud_upload' })
      }
      const roles = []
      if (roles && roles.indexOf('admin') > -1) {
        output.push({ label: 'Routes', to: '/route', icon: 'mdi-gesture' })
        output.push({ label: 'Users', to: '/user', icon: 'mdi-face' })
        output.push({ label: 'Audit', to: '/auditlog', icon: 'mdi-receipt' })
      }
      output.push({ label: 'Changelog', to: '/changelog', icon: 'mdi-info' })
      return output
    },
  }

};
</script>
