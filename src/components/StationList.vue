<template>
  <center-col id="StationList">
    <popup-dialog
      @dialogConfirmed="addStation"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Station">
      <v-text-field
        @keyup.enter.native="addStation"
        type='text'
        v-model='stationname'
        label='Enter a new stationname' />
    </popup-dialog>
    <v-list two-line>
      <station-block
        v-for="station in stations"
        :name="station.name"
        :key="station.name"></station-block>
    </v-list>
  </center-col>
</template>

<script>
export default {
  name: 'station_list',
  methods: {
    addStation: function (event) {
      this.$store.dispatch('addStationRemote', {
        name: this.stationname
      })
      this.$store.commit('closeAddBlock', this.$route.path)
    },
    closeAddBlock () {
      this.$store.commit('closeAddBlock', this.$route.path)
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Station List')
  },
  data () {
    return {
      stationname: ''
    }
  },
  computed: {
    stations () {
      return this.$store.state.stations
    },
    isAddBlockVisible () {
      return this.$store.state.isAddBlockVisible[this.$route.path]
    }
  }
}
</script>

<style scoped>
#StationList {
  padding-bottom: 5em;
}

.slide-enter-active, .slide-leave-active {
  transition: all .3s
}
.slide-enter {
  transform: translateY(-100px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}
</style>
