<template>
  <center-col id="TeamList">
    <popup-dialog
      @dialogConfirmed="addTeam"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Team">
      <v-text-field
        name="team-input"
        @keyup.enter.native="addTeam"
        type='text'
        v-model='teamname'
        label='Enter a new teamname' />
      <v-text-field
        name="email-input"
        type='text'
        v-model='email'
        label='Enter a new email' />
    </popup-dialog>
    <v-list two-line>
      <team-block
        v-for="team in teams"
        :name="team.name"
        :key="team.name"></team-block>
    </v-list>
  </center-col>
</template>

<script>
export default {
  name: 'team_list',
  methods: {
    addTeam: function (event) {
      this.$store.dispatch('addTeamRemote', {
        // TODO: Add missing fields to the form
        name: this.teamname,
        email: this.email,
        order: 500,
        cancelled: false,
        is_confirmed: true, // <- because it's added via the admin interface
        accepted: true, // <- because it's added via the admin interface
        completed: false,
        inserted: '2000-01-01 10:00:00',
        confirmation_key: ''
      })
      this.$store.commit('closeAddBlock', this.$route.path)
    },
    closeAddBlock () {
      this.$store.commit('closeAddBlock', this.$route.path)
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Team List')
  },
  data () {
    return {
      teamname: '',
      email: ''
    }
  },
  computed: {
    teams () {
      return this.$store.state.teams
    },
    isAddBlockVisible () {
      return this.$store.state.isAddBlockVisible[this.$route.path]
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
