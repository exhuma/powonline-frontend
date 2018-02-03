<template>
  <div id="StationList">
    <transition name="slide">
      <v-card v-show="isAddBlockVisible">
        <v-card-title>
          <span>Add New Station</span>
          <v-spacer></v-spacer>
          <v-btn @click.native="closeAddBlock" icon><v-icon>close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field
            id="StationNameImput"
            @keyup.enter.native="addStation"
            type='text'
            v-model='stationname'
            label='Enter a new stationname' />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn @click.native="addStation" flat>Add</v-btn>
        </v-card-actions>
      </v-card>
    </transition>
    <v-list two-line>
      <station-block
        v-for="station in stations"
        :name="station.name"
        :key="station.name"></station-block>
    </v-list>
  </div>
</template>

<script>
export default {
  name: 'station_list',
  methods: {
    addStation: function (event) {
      this.$store.dispatch('addStationRemote', {name: this.stationname})
      const input = document.getElementById('StationNameImput')
      input.focus()
      input.select()
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