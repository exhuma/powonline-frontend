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
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="team-input"
                  type='text'
                  v-model='team.name'
                  label='Enter a new teamname' />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-select
                  v-bind:items="routes"
                  v-model='team.route_name'
                  item-value="name"
                  item-text="name"
                  label='Route' />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="email-input"
                  type='text'
                  v-model='team.email'
                  label='Enter a new email' />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="numParticipants"
                  type='number'
                  v-model='team.num_participants'
                  label='Total number of particibpants' />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="numVegetarians"
                  type='number'
                  v-model='team.num_vegetarians'
                  hint="How many people of the team are vegetarians"
                  label='Total number of vegetarians' />
              </v-flex>
            </v-layout>
            <v-layout row wrap justify-space-between>
              <v-flex xs12 sm6>
                <h2>Planned Start Time</h2>
                <v-time-picker
                  v-model="plannedStartTime"
                  hint="The time the team was scheduled to start"
                  format="24hr"
                  label='Planned Start Time' />
              </v-flex>
              <v-flex xs12 sm6>
                <h2>Effective Start Time</h2>
                <v-time-picker
                  v-model="effectiveStartTime"
                  hint="The time the team <em>actually</em> started"
                  format="24hr"
                  label='Effective Start Time' />
              </v-flex>
            </v-layout>
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
import moment from 'moment'

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

  computed: {
    plannedStartTime: {
      get: function () {
        let output = null
        if (this.team.planned_start_time) {
          output = moment(this.team.planned_start_time)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('HH:mm')
      },
      set: function (newValue) {
        let old = moment(this.team.planned_start_time)
        if (!old.isValid()) {
          console.debug('Old for planned start time invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        let nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.team.planned_start_time = nw.format('YYYY-MM-DDTHH:mm:00')
        } else {
          console.error({'Cannot set date value to': nw})
        }
      }
    },
    effectiveStartTime: {
      get: function () {
        let output = null
        if (this.team.effective_start_time) {
          output = moment(this.team.effective_start_time)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('HH:mm')
      },
      set: function (newValue) {
        let old = moment(this.team.effective_start_time)
        if (!old.isValid()) {
          console.debug('Old for planned start time invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        let nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.team.effective_start_time = nw.format('YYYY-MM-DDTHH:mm:00')
        } else {
          console.error({'Cannot set date value to': nw})
        }
      }
    },
    routes () {
      return this.$store.state.routes
    }
  }
}
</script>
