<template>
    <v-card class="card--flex-toolbar">
      <v-toolbar card>
        <v-toolbar-title>{{ team.name }}</v-toolbar-title>
        <v-spacer />
        <small>{{st_display}}</small>
        <v-btn @click="openEditDialog" icon><v-icon>edit</v-icon></v-btn>
        <v-btn icon v-if="!expanded__" @click="showInfos(team)"><v-icon>expand_more</v-icon></v-btn>
        <v-btn icon v-else @click="hideInfos()"><v-icon>expand_less</v-icon></v-btn>
      </v-toolbar>
      <v-divider />
      <v-card-text v-show="expanded__">
        <v-container>
          <template v-if="team.cancelled">
            <v-layout row>
              <v-flex xs12><h1 class="error--text">Cancelled</h1></v-flex>
            </v-layout>
            <v-divider class="mt-2 mb-4"/>
          </template>

          <optional-team-row tooltip="Status" :value="statusText(team)" :icon="statusIcon(team)" />
          <optional-team-row tooltip="Contact Name" v-if="team.contact" :value="team.contact" icon="person" />
          <optional-team-row mu="email" tooltip="EMail" v-if="team.email" :value="team.email" icon="contact_mail" />
          <optional-team-row mu="tel" tooltip="Phone #" v-if="team.phone" :value="team.phone" icon="contact_phone" />
          <optional-team-row tooltip="Participants" :value="team.num_participants" icon="group" />
          <optional-team-row tooltip="Vegetarians" :value="team.num_vegetarians" icon="local_florist" />

          <template v-if="team.comments">
            <v-layout row>
              <v-flex xs12><h1>Notes</h1></v-flex>
            </v-layout>
            <v-layout row class="text-xs-left">
              <v-flex xs12><div class="textblock">{{ team.comments }}</div></v-flex>
            </v-layout>
          </template>

          <confirmation-dialog
            v-if="hasRole('admin')"
            buttonText="Delete Team"
            :actionArgument="team.name"
            actionName="deleteTeamRemote">
            <span slot="title">Do you want to delete the team "{{ team.name }}"?</span>
            <div slot="text">
              <p>this will delete the team with the name "{{ team.name }}" and all
                related information!</p>
              <p>Are you sure?</p>
            </div>
          </confirmation-dialog>

        <!--  TODO
        is_confirmed: false,
        accepted: false,
        completed: false,

        planned_start_time: null,
        effective_start_time: null,
        route_name: ''
        -->
        </v-container>
      </v-card-text>
    </v-card>
</template>

<script>
import moment from 'moment'
export default {
  name: 'expandable-card',
  props: [
    'team',
    'expanded'
  ],
  data () {
    return {
      state: 'unknown',
      stateIcon: 'u',

      // properties should not be mutated so we need an indirection
      expanded__: false
    }
  },
  computed: {
    st_display () {
      return moment(this.team.planned_start_time).format('HH:mm')
    }
  },
  methods: {
    hideInfos: function () {
      this.teamInfo = null
      this.expanded__ = false
    },
    showInfos: function (team) {
      this.teamInfo = team.name
      this.expanded__ = true
      this.$emit('team-selected', team)
    },
    statusIcon (team) {
      if (team.cancelled) {
        return 'cancelled'
      }
      if (team.effective_start_time) {
        return 'hourglass_empty'
      }
      if (team.completed) {
        return 'done_all'
      }
      return 'directions_walk'
    },
    statusText (team) {
      if (team.cancelled) {
        return 'Cancelled'
      }
      if (team.completed) {
        return 'Completed'
      }
      if (team.effective_start_time) {
        return 'Not yet started'
      }
      return 'En Route'
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    },
    openEditDialog () {
      this.$emit('openEditDialog', this.team)
    }
  },
  created () {
    this.expanded__ = this.expanded
  }
}
</script>

<style scoped>
DIV.textblock {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1em 2em;
  background: rgba(255, 255, 255, 0.1);
  font-style: italic;
}
</style>
