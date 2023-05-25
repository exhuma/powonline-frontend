<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>{{ team.name }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-icon v-show="routeColor !== null" :style="routeColor"
        >mdi-gesture</v-icon
      >
    </v-list-item-action>
    <v-list-item-action v-if="hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>mdi-pencil</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action class="ml-3" v-if="hasRole('admin')">
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="name"
        actionName="deleteTeamRemote"
      >
        <span slot="title"
          >Do you want to delete the team "{{ team.name }}"?</span
        >
        <div slot="text">
          <p>
            this will delete the team with the name "{{ team.name }}" and all
            related information!
          </p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import model from '@/model'
export default {
  name: 'team-block',
  data() {
    return {
      stations: []
    }
  },
  props: {
    team: {
      type: Object,
      default: model.team.makeEmpty()
    }
  },

  computed: {
    routeColor() {
      let selectedTeam = null
      this.$store.state.teams.forEach((team) => {
        if (team.name !== this.team.name) {
          return
        }
        selectedTeam = team
      })

      let selectedRoute = null
      this.$store.state.routes.forEach((route) => {
        if (route.name !== selectedTeam.route_name) {
          return
        }
        selectedRoute = route
      })

      if (selectedRoute === null) {
        return null
      }
      if (selectedRoute.color) {
        return `color: ${selectedRoute.color};`
      } else {
        return 'color: #000000;'
      }
    }
  },

  created() {
    this.$remoteProxy.fetchTeamStations(this.team.name).then((items) => {
      this.stations = items
    })
  },
  methods: {
    hasRole(roleName) {
      return this.$store.getters.hasRole(roleName)
    },
    openEditDialog() {
      this.$emit('openEditDialog')
    }
  }
}
</script>
