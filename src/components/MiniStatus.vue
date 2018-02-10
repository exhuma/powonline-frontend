<template>
  <v-icon>{{ stateIcon }}</v-icon>
</template>

<script>
import axios from 'axios'
import util from '@/util'
export default {
  name: 'mini-status',
  props: ['team', 'station'],
  data () {
    return {
      state: 'unknown',
      stateIcon: 'u'
    }
  },
  created () {
    const baseUrl = this.$store.state.baseUrl
    axios.get(baseUrl + '/station/' + this.station + '/teams/' + this.team)
      .then(response => {
        const icon = util.getStateIcon(response.data.state)
        this.stateIcon = icon
      })
      .catch(e => {
        this.$store.commit('logError', e)
      })
  }
}
</script>
