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
    <v-list two-line>
      <team-block
        @openEditDialog="onOpenEditDialog(team)"
        v-for="team in teams"
        :name="team.name"
        :key="team.name"></team-block>
      <v-list-tile>
        <v-spacer />
        <v-list-tile-action v-if="hasRole('admin')">
          <v-btn @click="openCreateDialog" v-if="hasRole('admin')">Add new Team</v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
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
    onOpenEditDialog: function (team) {
      this.selectedTeam = team
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.UPDATE
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
    dismissForm: function (event) {
      this.$emit('formDismissed')
      this.selectedTeam = model.team.makeEmpty()
    },
    onDialogConfirmed () {
      const team = this.selectedTeam

      // TODO // TODO: Add "order"
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
