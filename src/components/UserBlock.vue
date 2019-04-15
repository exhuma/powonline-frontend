<template>
  <v-card class="mt-3">
    <v-card-title><span>User: "{{ name }}"</span></v-card-title>
    <v-card-text>
      <h2>Roles</h2>
      <user-role-checkbox
        v-for="role in roles"
        :key="role[0]"
        :user="name"
        :label="role[0]"
        :role="role[0]"></user-role-checkbox>
      <h2>Stations</h2>
      <user-station-checkbox
        v-for="station in stations"
        :key="station[0]"
        :user="name"
        :label="station[0]"
        :station="station[0]"></user-station-checkbox>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions v-if="hasRole('admin')">
      <v-spacer />
      <confirmation-dialog buttonText="Delete" :actionArgument="name" actionName="deleteUserRemote">
        <span slot="title">Do you want to delete the user "{{ name }}"?</span>
        <div slot="text">
          <p>this will delete the user with the name "{{ name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'user-block',
  data () {
    return {
      roles: [],
      stations: []
    }
  },
  methods: {
    refreshStations () {
      this.$remote.fetchUserStations(this.name)
        .then(items => {
          this.stations = items
        })
        .catch(e => {
          this.$store.commit('logError', e)
        })
    },
    refreshRoles () {
      this.$remote.fetchUserRoles(this.name)
        .then(items => {
          this.roles = items
        })
        .catch(e => {
          this.$store.commit('logError', e)
        })
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },
  created () {
    this.refreshRoles()
    this.refreshStations()
  },
  props: {
    'name': {
      type: String,
      default: 'Unknown User'
    }
  }
}
</script>
