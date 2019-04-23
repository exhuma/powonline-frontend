<template>
  <v-checkbox @change="onValueChanged" v-model="checked" :label="label"></v-checkbox>
</template>

<script>
export default {
  name: 'user-station-checkbox',
  props: [
    'user',
    'station',
    'label'
  ],
  data () {
    return {
      checked: false
    }
  },
  methods: {
    onValueChanged (newValue) {
      if (newValue) {
        this.$remoteProxy.addStationToUser(this.user, this.station)
      } else {
        this.$remoteProxy.removeStationFromUser(this.user, this.station)
      }
    }
  },
  created () {
    this.$remoteProxy.fetchAssignedStationState(this.user, this.station)
      .then(data => {
        this.checked = data
      })
      .catch(e => {
        this.$store.commit('logError', e)
      })
  }
}
</script>
