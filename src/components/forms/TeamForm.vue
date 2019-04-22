<template>
  <div>
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
            <v-text-field
              name="team-input"
              type='text'
              v-model='team.name'
              label='Enter a new teamname' />
            <v-select
              v-bind:items="routes"
              v-model='team.route_name'
              item-value="name"
              item-text="name"
              label='Route' />
            <v-text-field
              name="email-input"
              type='text'
              v-model='team.email'
              label='Enter a new email' />
            <v-text-field
              name="numParticipants"
              type='number'
              v-model='team.num_participants'
              label='Total number of particibpants' />
            <v-text-field
              name="numVegetarians"
              type='number'
              v-model='team.num_vegetarians'
              hint="How many people of the team are vegetarians"
              label='Total number of vegetarians' />
            <v-text-field
              name="plannedStartTime"
              type='datetime-local'
              v-model='team.planned_start_time'
              @change="setDefaultEffectiveStartTime"
              hint="The time the team was scheduled to start"
              label='Planned Start Time' />
            <v-text-field
              name="effectiveStartTime"
              type='datetime-local'
              v-model='team.effective_start_time'
              hint="The time the team <em>actually</em> started"
              label='Effective Start Time' />
            <v-checkbox
              label="Team has cancelled the event"
              v-model="team.cancelled" />
            <v-checkbox
              label="Team has completed the event"
              v-model="team.completed" />
          </v-card-text></v-card>
        </v-tabs-content>

        <v-tabs-content key="contactInfo" id="contactInfo">
          <v-card flat><v-card-text>
            <v-text-field
              name="email-input"
              type='text'
              v-model='team.email'
              label='Enter a new email' />
            <v-text-field
              name="contactName"
              type='text'
              v-model='team.contact'
              label='Contact Name' />
            <v-text-field
              name="contactPhone"
              type='text'
              v-model='team.phone'
              label='Contact Phone #' />
          </v-card-text></v-card>
        </v-tabs-content>

        <v-tabs-content key="regInfo" id="regInfo">
          <v-card flat><v-card-text>
            <v-checkbox
              label="Team has accepted the registration"
              v-model="team.accepted" />
            <v-checkbox
              label="Team was confirmed by the registration staff"
              v-model="team.is_confirmed" />
            <v-select
              v-bind:items="routes"
              v-model='team.route_name'
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
              v-model='team.comments'
              multi-line
              />
          </v-card-text></v-card>
        </v-tabs-content>

      </v-tabs-items>

    </v-tabs>
  </div>
</template>

<script>
import model from '@/model'

export default {
  name: 'team-form',

  props: {
    'team': {
      type: Object,
      default () {
        return model.team.makeEmpty()
      }
    }
  },

  data () {
    return {
      activeTab: 'teamInfo'
    }
  },

  methods: {
    setDefaultEffectiveStartTime (newValue) {
      if (this.team.effective_start_time) {
        // We already have a value and should not overwrite it!
        return
      }

      if (newValue && newValue !== '') {
        this.team.effective_start_time = newValue
      }
    }
  },

  computed: {
    routes () {
      return this.$store.state.routes
    }
  }
}
</script>
