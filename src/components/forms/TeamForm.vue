<template>
  <div>
    <v-tabs slider-color="accent" v-model="activeTab" grow>
      <v-tab href="#teamInfo" key="teamInfo" ripple>Team Info</v-tab>
      <v-tab href="#contactInfo" key="contactInfo" ripple>Contact Info</v-tab>
      <v-tab href="#regInfo" key="regInfo" ripple>Registration Info</v-tab>
      <v-tab href="#commentsTab" key="commentsTab" ripple>Comments</v-tab>

      <v-tab-item key="teamInfo" value="teamInfo">
        <v-card flat
          ><v-card-text>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="team-input"
                  type="text"
                  v-model="team.name"
                  label="Enter a new teamname"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-select
                  v-bind:items="routes"
                  v-model="team.route_name"
                  item-value="name"
                  item-text="name"
                  label="Route"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="email-input"
                  type="text"
                  v-model="team.email"
                  label="Enter a new email"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="numParticipants"
                  type="number"
                  v-model="team.num_participants"
                  label="Total number of particibpants"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="numVegetarians"
                  type="number"
                  v-model="team.num_vegetarians"
                  hint="How many people of the team are vegetarians"
                  label="Total number of vegetarians"
                />
              </v-flex>
            </v-layout>

            <date-time-picker
              @timeValueChanged="updatePlannedTime"
              :time-value="this.team.planned_start_time"
              hint="The time the team was scheduled to start"
              label="Planned Start Time"
            />

            <date-time-picker
              @timeValueChanged="updateEffectiveTime"
              :time-value="this.team.effective_start_time"
              hint="The time the team effectively left the departure station"
              label="Effective Start Time"
            />

            <date-time-picker
              @timeValueChanged="updateFinishTime"
              :time-value="this.team.finish_time"
              hint="The time the team finished the event"
              label="Finish Time"
            />

            <v-layout row>
              <v-flex xs12>
                <h1>Status</h1>
              </v-flex>
            </v-layout>
            <v-checkbox
              label="Team has cancelled the event"
              v-model="team.cancelled"
            />
            <v-checkbox
              label="Team has completed the event"
              v-model="team.completed"
            /> </v-card-text
        ></v-card>
      </v-tab-item>

      <v-tab-item key="contactInfo" value="contactInfo">
        <v-card flat
          ><v-card-text>
            <v-text-field
              name="email-input"
              type="text"
              v-model="team.email"
              label="Enter a new email"
            />
            <v-text-field
              name="contactName"
              type="text"
              v-model="team.contact"
              label="Contact Name"
            />
            <v-text-field
              name="contactPhone"
              type="text"
              v-model="team.phone"
              label="Contact Phone #"
            /> </v-card-text
        ></v-card>
      </v-tab-item>

      <v-tab-item key="regInfo" value="regInfo">
        <v-card flat
          ><v-card-text>
            <v-checkbox
              label="Team has accepted the registration"
              v-model="team.accepted"
            />
            <v-checkbox
              label="Team was confirmed by the registration staff"
              v-model="team.is_confirmed"
            />
            <v-select
              v-bind:items="routes"
              v-model="team.route_name"
              item-value="name"
              item-text="name"
              label="Route"
            /> </v-card-text
        ></v-card>
      </v-tab-item>

      <v-tab-item key="commentsTab" value="commentsTab">
        <v-card flat
          ><v-card-text>
            <v-textarea
              name="comments"
              type="text"
              v-model="team.comments"
            /> </v-card-text
        ></v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script lang="ts">
import model from '@/model'
import moment from 'moment'
import DateTimePicker from '@/components/DateTimePicker.vue'

import Vue from 'vue'
const TeamForm = Vue.extend({
  name: 'team-form',
  components: { DateTimePicker },
  props: {
    team: {
      type: Object,
      default() {
        return model.team.makeEmpty()
      }
    }
  },

  data() {
    return {
      activeTab: 'teamInfo',
      showPlannedStartTimeDialog: false,
      showEffectiveStartTimeDialog: false,
      showFinishTimeDialog: false
    }
  },

  methods: {
    updatePlannedTime(newValue) {
      this.team.planned_start_time = newValue
    },
    updateEffectiveTime(newValue) {
      this.team.effective_start_time = newValue
    },
    updateFinishTime(newValue) {
      this.team.finish_time = newValue
    }
  },

  computed: {
    finishTime: {
      get: function () {
        let output = null
        if (this.team.finish_time) {
          output = moment(this.team.finish_time)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('HH:mm')
      },
      set: function (newValue) {
        let old = moment(this.team.finish_time)
        if (!old.isValid()) {
          console.debug('Old for finish time invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        const nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.team.finish_time = nw.format('YYYY-MM-DDTHH:mm:00')
        } else {
          console.error({ 'Cannot set date value to': nw })
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
        const nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.team.effective_start_time = nw.format('YYYY-MM-DDTHH:mm:00')
        } else {
          console.error({ 'Cannot set date value to': nw })
        }
      }
    },
    routes() {
      return this.$store.state.routes
    }
  }
})
export default TeamForm
</script>
