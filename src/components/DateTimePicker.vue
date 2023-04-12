<template>
  <v-layout row wrap>
    <v-flex xs6>
      <v-dialog
        persistent
        v-model="dateDialogVisible"
        width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field
            :label="label"
            v-model="innerDateValue"
            prepend-icon="event"
            readonly
            v-on="on">
          </v-text-field>
        </template>
        <v-date-picker
          v-model="innerDateValue"
          :hint="hint"
          :label="label">
            <template slot-scope="{ save, cancel }">
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn flat @click="cancel">Cancel</v-btn>
                <v-btn @click="save">OK</v-btn>
              </v-card-actions>
            </template>
        </v-date-picker>
      </v-dialog>
    </v-flex>
    <v-flex xs6>
      <v-dialog
        persistent
        v-model="timeDialogVisible"
        width="290px">
        <template v-slot:activator="{ on }">
          <v-text-field
            :label="label"
            v-model="innerTimeValue"
            prepend-icon="schedule"
            readonly
            v-on="on">
          </v-text-field>
        </template>
        <v-time-picker
          v-model="innerTimeValue"
          :hint="hint"
          format="24hr"
          :label="label">
            <template slot-scope="{ save, cancel }">
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="cancel">Cancel</v-btn>
                <v-btn @click="save">OK</v-btn>
              </v-card-actions>
            </template>
        </v-time-picker>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'
export default {
  name: 'date-time-picker',
  props: [
    'label',
    'hint',
    'timeValue'
  ],
  computed: {
    innerTimeValue: {
      get: function () {
        let output = null
        if (this.timeValue) {
          output = moment(this.timeValue)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('HH:mm')
      },
      set: function (newValue) {
        let old = moment(this.timeValue)
        if (!old.isValid()) {
          console.debug('Old for planned start time invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        let nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
        if (nw.isValid()) {
          this.$emit('timeValueChanged', nw.format('YYYY-MM-DDTHH:mm:00'))
        } else {
          console.error({'Cannot set date value to': nw})
        }
      }
    },
    innerDateValue: {
      get: function () {
        let output = null
        if (this.timeValue) {
          output = moment(this.timeValue)
        } else {
          output = moment('2019-10-05T19:00')
        }
        return output.format('YYYY-MM-DD')
      },
      set: function (newValue) {
        let old = moment(this.timeValue)
        if (!old.isValid()) {
          console.debug('Old for planned start date invalid. Using default')
          old = moment('2019-10-05T19:00')
        }
        let nw = moment(`${newValue}T${old.format('HH:mm')}:00`)
        if (nw.isValid()) {
          this.$emit('timeValueChanged', nw.format('YYYY-MM-DDTHH:mm:00'))
        } else {
          console.error({'Cannot set date value to': nw})
        }
      }
    }
  },
  data () {
    return {
      timeDialogVisible: false,
      dateDialogVisible: false
    }
  }
}
</script>
