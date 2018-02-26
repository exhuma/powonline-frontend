<template>
  <center-col id="TeamList">
    <popup-dialog
      @dialogConfirmed="addTeam"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Team">
      <v-tabs
        v-model="activeTab">
        <v-tabs-bar>
          <v-tabs-item href="#teamInfo" key="teamInfo" ripple>Team Info</v-tabs-item>
          <v-tabs-item href="#contactInfo" key="contactInfo" ripple>Contact Info</v-tabs-item>
          <v-tabs-item href="#regInfo" key="regInfo" ripple>Registration Info</v-tabs-item>
          <v-tabs-item href="#commentsTab" key="commentsTab" ripple>Comments</v-tabs-item>
          <v-tabs-slider color="accent" />
        </v-tabs-bar>

        <v-tabs-items>
          <v-tabs-content key="teamInfo" id="teamInfo">
            <v-card flat><v-card-text>
              <v-select
                v-bind:items="routes"
                v-model='teamRoute'
                item-value="name"
                item-text="name"
                label='Route' />
              <v-text-field
                name="team-input"
                type='text'
                v-model='teamname'
                label='Enter a new teamname' />
              <v-text-field
                name="email-input"
                type='text'
                v-model='email'
                label='Enter a new email' />
              <v-text-field
                name="numParticipants"
                type='number'
                v-model='numParticipants'
                label='Total number of particibpants' />
              <v-text-field
                name="numVegetarians"
                type='number'
                v-model='numVegetarians'
                hint="How many people of the team are vegetarians"
                label='Total number of vegetarians' />
              <v-text-field
                name="plannedStartTime"
                type='datetime-local'
                v-model='plannedStartTime'
                hint="The time the team was scheduled to start"
                label='Planned Start Time' />
              <v-text-field
                name="effectiveStartTime"
                type='datetime-local'
                v-model='effectiveStartTime'
                hint="The time the team <em>actually</em> started"
                label='Effective Start Time' />
              <v-checkbox
                label="Team has cancelled the event"
                v-model="hasCancelled" />
              <v-checkbox
                label="Team has completed the event"
                v-model="hasCompleted" />
            </v-card-text></v-card>
          </v-tabs-content>

          <v-tabs-content key="contactInfo" id="contactInfo">
            <v-card flat><v-card-text>
              <v-text-field
                name="email-input"
                type='text'
                v-model='email'
                label='Enter a new email' />
              <v-text-field
                name="contactName"
                type='text'
                v-model='contactName'
                label='Contact Name' />
              <v-text-field
                name="contactPhone"
                type='text'
                v-model='contactPhone'
                label='Contact Phone #' />
            </v-card-text></v-card>
          </v-tabs-content>

          <v-tabs-content key="regInfo" id="regInfo">
            <v-card flat><v-card-text>
              <v-checkbox
                label="Team has accepted the registration"
                v-model="hasAccepted" />
              <v-checkbox
                label="Team was confirmed by the registration staff"
                v-model="isConfirmed" />
              <v-select
                v-bind:items="routes"
                v-model='teamRoute'
                item-value="name"
                item-text="name"
                label='Route' />
            </v-card-text></v-card>
          </v-tabs-content>

          <v-tabs-content key="commentsTab" id="commentsTab">
            <v-card flat><v-card-text>
              <v-text-field
                name="comments"
                type='text'
                v-model='comments'
                multi-line
                />
            </v-card-text></v-card>
          </v-tabs-content>

        </v-tabs-items>

      </v-tabs>
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
      // TODO: Add "order"

      const payload = {
        name: this.teamname,
        email: this.email,
        order: 500, // TODO
        cancelled: this.hasCancelled,
        is_confirmed: this.isConfirmed,
        accepted: this.hasAccepted,
        completed: this.hasCompleted,
        comments: this.comments,
        contact: this.contactName,
        phone: this.contactPhone,
        num_vegetarians: this.numVegetarians,
        num_participants: this.numParticipants,
        planned_start_time: this.plannedStartTime,
        effective_start_time: this.effectiveStartTime,
        route_name: this.teamRoute
      }

      // clean up empty strings (fix needed due to a limitation of ths
      // "marshmallow" package on the backend: Some empty strings will not
      // validate to "null".
      if (payload.email === '') payload.email = null
      if (payload.num_vegetarians === '') payload.num_vegetarians = null
      if (payload.num_participants === '') payload.num_participants = null

      this.$store.dispatch('addTeamRemote', payload)
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
      teamRoute: null,
      activeTab: 'teamInfo',
      hasCancelled: false,
      hasCompleted: false,
      hasAccepted: true, // <- because it's added via the admin interface
      isConfirmed: true, // <- because it's added via the admin interface
      email: '',
      comments: '',
      contactName: '',
      contactPhone: '',
      numVegetarians: '',
      numParticipants: '',
      plannedStartTime: '',
      effectiveStartTime: ''
    }
  },

  computed: {
    teams () {
      return this.$store.state.teams
    },
    routes () {
      return this.$store.state.routes
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
