<template>
  <center-col id="StationList">
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Station">
      <v-text-field
        @keyup.enter.native="onDialogConfirmed"
        type='text'
        v-model='selectedStation.name'
        label='Enter a new stationname' />
      <v-text-field
        name="order"
        type='number'
        v-model='selectedStation.order'
        hint="This field is used to sort stations"
        label="Station Ordering" />
    </popup-dialog>
    <v-list two-line>
      <station-block
        v-for="station in stations"
        @openEditDialog="onOpenEditDialog(station)"
        :name="station.name"
        :key="station.name"></station-block>
      <v-list-tile>
        <v-spacer />
        <v-list-tile-action v-if="hasRole('admin')">
          <v-btn @click="openCreateDialog" v-if="hasRole('admin')">Add new Station</v-btn>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </center-col>
</template>

<script>
import model from '@/model'

export default {
  name: 'station_list',
  methods: {
    onOpenEditDialog: function (station) {
      this.selectedStation = station
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.UPDATE
    },
    onDialogConfirmed: function (event) {
      const station = this.selectedStation

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch('addStationRemote', station)
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        console.warn('Updating stations is not implemented yet!')
      } else {
        console.error('Invalid send mode: ' + this.sendMode)
      }

      this.$emit('stationSaved', station)
      this.selectedStation = model.station.makeEmpty()

      this.isAddBlockVisible = false
    },
    closeAddBlock () {
      this.isAddBlockVisible = false
    },
    openCreateDialog: function () {
      const newStation = model.station.makeEmpty()

      this.selectedStation = newStation
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Station List')
  },
  data () {
    return {
      isAddBlockVisible: false,
      selectedStation: model.station.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE
    }
  },
  computed: {
    stations () {
      return this.$store.state.stations
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
