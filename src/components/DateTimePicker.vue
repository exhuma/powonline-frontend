<template>
  <v-row>
    <v-col cols="6">
      <v-menu v-model="dateMenuOpen" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-text-field
            :label="label"
            :model-value="innerDateValue"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="menuProps"
          />
        </template>
        <v-date-picker
          :model-value="innerDateValue"
          @update:model-value="onDateSelected"
        />
      </v-menu>
    </v-col>
    <v-col cols="6">
      <v-menu v-model="timeMenuOpen" :close-on-content-click="false">
        <template #activator="{ props: menuProps }">
          <v-text-field
            :label="label"
            :model-value="innerTimeValue"
            prepend-icon="mdi-clock"
            readonly
            v-bind="menuProps"
          />
        </template>
        <v-time-picker
          :model-value="innerTimeValue"
          format="24hr"
          @update:model-value="onTimeSelected"
        />
      </v-menu>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import moment from 'moment'
import { defineComponent } from 'vue'
const DateTimePicker = defineComponent({
  name: 'date-time-picker',
  props: ['label', 'hint', 'timeValue'],
  computed: {
    innerTimeValue(): string {
      let output = null
      if (this.timeValue) {
        output = moment(this.timeValue)
      } else {
        output = moment('2019-10-05T19:00')
      }
      return output.format('HH:mm')
    },
    innerDateValue(): string {
      let output = null
      if (this.timeValue) {
        output = moment(this.timeValue)
      } else {
        output = moment('2019-10-05T19:00')
      }
      return output.format('YYYY-MM-DD')
    }
  },
  data() {
    return {
      timeMenuOpen: false,
      dateMenuOpen: false
    }
  },
  methods: {
    onDateSelected(newValue: string) {
      let old = moment(this.timeValue)
      if (!old.isValid()) {
        console.debug('Old for planned start date invalid. Using default')
        old = moment('2019-10-05T19:00')
      }
      const nw = moment(`${newValue}T${old.format('HH:mm')}:00`)
      if (nw.isValid()) {
        this.$emit('timeValueChanged', nw.format('YYYY-MM-DDTHH:mm:00'))
      } else {
        console.error({ 'Cannot set date value to': nw })
      }
      this.dateMenuOpen = false
    },
    onTimeSelected(newValue: string) {
      let old = moment(this.timeValue)
      if (!old.isValid()) {
        console.debug('Old for planned start time invalid. Using default')
        old = moment('2019-10-05T19:00')
      }
      const nw = moment(`${old.format('YYYY-MM-DD')}T${newValue}:00`)
      if (nw.isValid()) {
        this.$emit('timeValueChanged', nw.format('YYYY-MM-DDTHH:mm:00'))
      } else {
        console.error({ 'Cannot set date value to': nw })
      }
      this.timeMenuOpen = false
    }
  }
})
export default DateTimePicker
</script>
