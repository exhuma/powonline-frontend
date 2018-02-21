<template>
  <v-list-tile>
    <v-list-tile-content>
      <v-list-tile-title>{{ name }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action class="ml-3" v-if="hasRole('admin')">
      <confirmation-dialog buttonText="Delete" :actionArgument="name" actionName="deleteTeamRemote">
        <span slot="title">Do you want to delete the team "{{ name }}"?</span>
        <div slot="text">
          <p>this will delete the team with the name "{{ name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
import axios from 'axios'
export default {
  name: 'team-block',
  data () {
    return {
      stations: []
    }
  },
  props: {
    'name': {
      type: String,
      default: 'Unknown Team'
    }
  },
  created () {
    const baseUrl = this.$store.state.baseUrl
    axios.get(baseUrl + '/team/' + this.name + '/stations')
      .then(response => {
        this.stations = response.data.items
      })
  },
  methods: {
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  }
}
</script>
