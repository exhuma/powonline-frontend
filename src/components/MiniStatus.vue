<template>
  <v-icon>{{ stateIcon }}</v-icon>
</template>

<script lang="ts">
import util from '@/util'
import { defineComponent } from 'vue'
const MiniStatus = defineComponent({
  name: 'mini-status',
  props: {
    team: {
      type: String,
      default: ''
    },
    station: {
      type: String,
      default: ''
    },
    // Pass state directly if known; if not provided, icon defaults to unknown.
    state: {
      type: String,
      default: 'unknown'
    }
  },
  computed: {
    stateIcon(): string {
      return util.getStateIcon(this.state)
    }
  }
})
export default MiniStatus
</script>
