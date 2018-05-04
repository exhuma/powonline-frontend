<template>
  <center-col id="TeamList">
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Team">
      <team-form
        :send-mode='sendMode'
        :team='selectedTeam'
        />
    </popup-dialog>
    <expandable-card
      :team="team"
      :expanded="team.name === selectedTeam"
      @team-selected="onTeamSelected"
      v-for="team in teams"
      :key="team.name" />
    <v-list-tile v-if="hasRole('admin')"> <!-- TODO: should not use v-list-tile here -->
      <v-spacer />
      <v-list-tile-action>
        <v-btn @click="openCreateDialog">Add new Team</v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </center-col>
</template>

<script>
import model from '@/model'

export default {
  name: 'team_list',
  data () {
    return {
      isAddBlockVisible: false,
      selectedTeam: model.team.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE
    }
  },
  methods: {
    onTeamSelected (team) {
      this.selectedTeam = team
    },
    openCreateDialog: function () {
      const newTeam = model.team.makeEmpty()

      // The new team is automatically accepted and confirmed
      // because it's added via the admin interface
      newTeam.accepted = true
      newTeam.is_confirmed = true

      this.selectedTeam = newTeam
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    onDialogConfirmed () {
      const team = this.selectedTeam

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch('addTeamRemote', team)
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        console.warn('Updating teams is not implemented yet!')
      } else {
        console.error('Invalid send mode: ' + this.sendMode)
      }

      this.$emit('teamSaved', team)
      this.selectedTeam = model.team.makeEmpty()

      this.isAddBlockVisible = false
    },
    closeAddBlock () {
      this.isAddBlockVisible = false
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },

  created () {
    this.$store.commit('changeTitle', 'Team List')
  },

  computed: {
    teams () {
      return this.$store.state.teams
    }
  }
}
</script>

<style scoped>

#TeamList {
  padding-bottom: 5em;
}

.slide-enter-active, .slide-leave-active {
  transition: all .3s
}
.slide-enter {
  transform: translateY(-100px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}
</style>
