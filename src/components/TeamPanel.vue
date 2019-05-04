<template>
  <center-col id="TeamList">
    <team-form :team="team" />
    <div v-if="hasRole('admin')">
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="team.name"
        actionName="deleteTeamRemote">
        <span slot="title">Do you want to delete the team "{{ team.name }}"?</span>
        <div slot="text">
          <p>this will delete the team with the name "{{ team.name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </div>
  </center-col>
</template>

<script>
import TeamForm from '@/components/forms/TeamForm'
export default {
  name: 'team-panel',
  components: {TeamForm},

  computed: {
    team () {
      return this.$store.getters.findTeam(this.$route.params.teamName)
    }
  },

  methods: {
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },

  created () {
    this.$store.commit('changeTitle', 'Team Details')
  }

}
</script>
