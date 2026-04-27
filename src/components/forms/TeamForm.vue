<template>
  <div>
    <v-alert v-if="publicTeamWarning" type="warning" class="mb-2">
      Contact details are not available. You need the
      <strong>event_owner</strong> or <strong>event_co_admin</strong> role to
      view or edit full team information.
    </v-alert>
    <v-tabs slider-color="accent" v-model="activeTab" grow>
      <v-tab value="teamInfo" key="teamInfo" ripple>Team Info</v-tab>
      <v-tab value="contactInfo" key="contactInfo" ripple>Contact Info</v-tab>
      <v-tab value="regInfo" key="regInfo" ripple>Registration Info</v-tab>
      <v-tab value="commentsTab" key="commentsTab" ripple>Comments</v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item key="teamInfo" value="teamInfo">
        <v-card flat
          ><v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  name="team-input"
                  type="text"
                  v-model="localTeam.name"
                  label="Enter a new teamname"
                  @input="emitChangeEvent"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-bind:items="routes"
                  v-model="localTeam.route_name"
                  item-value="name"
                  item-title="name"
                  label="Route"
                  @update:model-value="emitChangeEvent"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  name="email-input"
                  type="text"
                  v-model="localTeam.email"
                  label="Enter a new email"
                  @input="emitChangeEvent"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  name="numParticipants"
                  type="number"
                  v-model="localTeam.num_participants"
                  label="Total number of particibpants"
                  @input="emitChangeEvent"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  name="numVegetarians"
                  type="number"
                  v-model="localTeam.num_vegetarians"
                  hint="How many people of the team are vegetarians"
                  label="Total number of vegetarians"
                  @input="emitChangeEvent"
                />
              </v-col>
            </v-row>

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

            <v-row>
              <v-col cols="12">
                <h1>Status</h1>
              </v-col>
            </v-row>
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
      </v-tabs-window-item>

      <v-tabs-window-item key="contactInfo" value="contactInfo">
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
      </v-tabs-window-item>

      <v-tabs-window-item key="regInfo" value="regInfo">
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
              item-title="name"
              label="Route"
              @update:model-value="emitChangeEvent"
            /> </v-card-text
        ></v-card>
      </v-tabs-window-item>

      <v-tabs-window-item key="commentsTab" value="commentsTab">
        <v-card flat
          ><v-card-text>
            <v-textarea
              name="comments"
              type="text"
              v-model="localTeam.comments"
              @input="emitChangeEvent"
            /> </v-card-text
        ></v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script lang="ts">
import model from '@/model'
import moment from 'moment'
import DateTimePicker from '@/components/DateTimePicker.vue'
import { isFullTeam } from '@/remote/model/team'

import { defineComponent } from 'vue'
const TeamForm = defineComponent({
  name: 'team-form',
  components: { DateTimePicker },
  props: {
    team: {
      type: Object,
      default() {
        return model.team.makeEmpty()
      }
    },
    routes: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      activeTab: 'teamInfo',
      showPlannedStartTimeDialog: false,
      showEffectiveStartTimeDialog: false,
      showFinishTimeDialog: false,
      localTeam: JSON.parse(JSON.stringify(this.team)),
      publicTeamWarning: !isFullTeam(this.team as any)
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
    }
  }
})
export default TeamForm
</script>
