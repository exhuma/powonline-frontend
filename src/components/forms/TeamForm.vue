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
                  v-model="localTeam.name"
                  label="Enter a new teamname"
                  @input="emitChangeEvent"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-select
                  v-bind:items="routes"
                  v-model="localTeam.route_name"
                  item-value="name"
                  item-text="name"
                  label="Route"
                  @input="emitChangeEvent"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="email-input"
                  type="text"
                  v-model="localTeam.email"
                  label="Enter a new email"
                  @input="emitChangeEvent"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="numParticipants"
                  type="number"
                  v-model="localTeam.num_participants"
                  label="Total number of particibpants"
                  @input="emitChangeEvent"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  name="numVegetarians"
                  type="number"
                  v-model="localTeam.num_vegetarians"
                  hint="How many people of the team are vegetarians"
                  label="Total number of vegetarians"
                  @input="emitChangeEvent"
                />
              </v-flex>
            </v-layout>

            <date-time-picker
              @timeValueChanged="updatePlannedTime"
              :time-value="localTeam.planned_start_time"
              hint="The time the team was scheduled to start"
              label="Planned Start Time"
            />

            <date-time-picker
              @timeValueChanged="updateEffectiveTime"
              :time-value="localTeam.effective_start_time"
              hint="The time the team effectively left the departure station"
              label="Effective Start Time"
            />

            <date-time-picker
              @timeValueChanged="updateFinishTime"
              :time-value="localTeam.finish_time"
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
              v-model="localTeam.cancelled"
              @change="emitChangeEvent"
            />
            <v-checkbox
              label="Team has completed the event"
              v-model="localTeam.completed"
              @change="emitChangeEvent"
            /> </v-card-text
        ></v-card>
      </v-tab-item>

      <v-tab-item key="contactInfo" value="contactInfo">
        <v-card flat
          ><v-card-text>
            <v-text-field
              name="email-input"
              type="text"
              v-model="localTeam.email"
              label="Enter a new email"
              @input="emitChangeEvent"
            />
            <v-text-field
              name="contactName"
              type="text"
              v-model="localTeam.contact"
              label="Contact Name"
              @input="emitChangeEvent"
            />
            <v-text-field
              name="contactPhone"
              type="text"
              v-model="localTeam.phone"
              label="Contact Phone #"
              @input="emitChangeEvent"
            /> </v-card-text
        ></v-card>
      </v-tab-item>

      <v-tab-item key="regInfo" value="regInfo">
        <v-card flat
          ><v-card-text>
            <v-checkbox
              label="Team has accepted the registration"
              v-model="localTeam.accepted"
              @change="emitChangeEvent"
            />
            <v-checkbox
              label="Team was confirmed by the registration staff"
              v-model="localTeam.is_confirmed"
              @change="emitChangeEvent"
            />
            <v-select
              v-bind:items="routes"
              v-model="localTeam.route_name"
              item-value="name"
              item-text="name"
              label="Route"
              @input="emitChangeEvent"
            /> </v-card-text
        ></v-card>
      </v-tab-item>

      <v-tab-item key="commentsTab" value="commentsTab">
        <v-card flat
          ><v-card-text>
            <v-textarea
              name="comments"
              type="text"
              v-model="localTeam.comments"
              @input="emitChangeEvent"
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
      showFinishTimeDialog: false,
      localTeam: JSON.parse(JSON.stringify(this.team))
    }
  },

  methods: {
    emitChangeEvent() {
      this.$emit('update:team', JSON.parse(JSON.stringify(this.localTeam)))
    },
    updatePlannedTime(newValue: string) {
      this.localTeam.planned_start_time = newValue
      this.emitChangeEvent()
    },
    updateEffectiveTime(newValue: string) {
      this.localTeam.effective_start_time = newValue
      this.emitChangeEvent()
    },
    updateFinishTime(newValue: string) {
      this.localTeam.finish_time = newValue
      this.emitChangeEvent()
    }
  },
  computed: {
    finishTime: {
      get: function (): string {
        let output = null
        if (this.team.finish_time) {
          output = moment(this.team.finish_time)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('HH:mm')
      },
      set: function (newValue: string): void {
        let old = moment(this.team.finish_time)
        if (!old.isValid()) {
          console.debug('Old for finish time invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        const nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.localTeam.finish_time = nw.format('YYYY-MM-DDTHH:mm:00')
          this.emitChangeEvent()
        } else {
          console.error({ 'Cannot set date value to': nw })
        }
      }
    },
    effectiveStartTime: {
      get: function (): string {
        let output = null
        if (this.team.effective_start_time) {
          output = moment(this.team.effective_start_time)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('HH:mm')
      },
      set: function (newValue: string): void {
        let old = moment(this.team.effective_start_time)
        if (!old.isValid()) {
          console.debug('Old for planned start time invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        const nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.localTeam.effective_start_time = nw.format('YYYY-MM-DDTHH:mm:00')
          this.emitChangeEvent()
        } else {
          console.error({ 'Cannot set date value to': nw })
        }
      }
    },
    routes(): unknown {
      return this.$store.state.routes
    }
  }
})
export default TeamForm
</script>
