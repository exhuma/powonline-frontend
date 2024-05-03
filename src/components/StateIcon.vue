<template>
  <v-icon :color="adaptiveColor">{{ stateIcon() }}</v-icon>
</template>

<script lang="ts">
import util from '@/util'

import Vue from 'vue'
const StateIcon = Vue.extend({
  name: 'state-icon',
  props: ['state'],
  computed: {
    adaptiveColor() {
      switch (this.state) {
        case 'arrived':
          return 'yellow'
        case 'finished':
          return 'green'
        default:
          return 'white'
      }
    }
  },
  methods: {
    stateIcon() {
      return util.getStateIcon(this.state)
    }
  }
})
export default StateIcon
</script>
