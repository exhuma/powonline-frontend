<template>
  <center-col id="TeamList">
    <team-form :team.sync="team" />
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

<script lang="ts">
import TeamForm from '@/components/forms/TeamForm.vue'

import Vue from 'vue'
const TeamPanel = Vue.extend({
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
      return this.$store.getters.hasRole(roleName)
    },
    save() {
      this.team.comments = this.team.comments || ''
      this.$remoteProxy
        .updateTeam(this.$route.params.teamName, this.team)
        .then(() => {
          this.$emit('snackRequested', {
            message: 'Save successful'
          })
        })
      // TODO: error-handling
    }
  }
})
export default TeamPanel
</script>
