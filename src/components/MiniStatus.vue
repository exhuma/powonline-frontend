<template>
  <v-icon>{{ stateIcon }}</v-icon>
</template>

<script lang="ts">
import util from '@/util'
import Vue from 'vue'
const MiniStatus = Vue.extend({
  name: 'mini-status',
  props: ['team', 'station'],
  data() {
    return {
      state: 'unknown',
      stateIcon: 'u'
    }
  },
  created() {
    this.$remoteProxy
      .fetchTeamState(this.station, this.team)
      .then((state) => {
        const icon = util.getStateIcon(state)
        this.stateIcon = icon
      })
      .catch((e) => {
        this.$store.commit('logError', e)
      })
  }
})
export default MiniStatus
</script>
