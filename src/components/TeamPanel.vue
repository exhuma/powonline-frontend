<template>
  <center-col id="TeamList">
    <team-form :team="team" />
    <div v-if="hasRole('admin')">
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="team.name"
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
      <v-btn @click="save">Save</v-btn>
    </div>
  </center-col>
</template>

<script>
import TeamForm from '@/components/forms/TeamForm.vue'

export default {
  name: 'team-panel',
  components: { TeamForm },

  data() {
    return {
      team: null
    }
  },

  created() {
    this.team = this.$store.getters.findTeam(this.$route.params.teamName)
    this.$store.commit('changeTitle', 'Team Details')
  },

  methods: {
    hasRole(roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    },
    save() {
      this.$remoteProxy
        .updateTeam(this.$route.params.teamName, this.team)
        .then((data) => {
          this.$emit('snackRequested', {
            message: 'Save successful'
          })
        })
        .catch((error) => {
          this.errorDialog = true
          this.errorText = error.response.data
        })
    }
  }
}
</script>
