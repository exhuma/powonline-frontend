<template>
  <center-col id="StationList">
    <v-dialog
      v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
      </v-card>
      <v-card-text class="white--text">
        {{errorText}}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="errorDialog = false"
        >OK</v-btn>
      </v-card-actions>
    </v-dialog>
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="this.sendMode == this.SEND_MODE.UPDATE"
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
      <v-checkbox
        name="is_start"
        label="Departure Station"
        v-model="selectedStation.is_start" />
      <v-checkbox
        name="is_end"
        label="Arrival Station"
        v-model="selectedStation.is_end" />
      <v-text-field
        name="phone"
        v-model='selectedStation.phone'
        label="Phone Number" />
      <v-text-field
        name="contact"
        v-model='selectedStation.contact'
        label="Contact" />
    </popup-dialog>
    <v-list two-line>
      <station-block
        v-for="station in stations"
        @openEditDialog="onOpenEditDialog(station)"
        :station="station"
        :key="station.name"></station-block>
      <v-list-tile>
        <v-spacer />
        <v-list-tile-action v-if="hasRole('admin')">
          <v-btn class="pa-3" @click="openCreateDialog" v-if="hasRole('admin')">Add new Station</v-btn>
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
        station.contact = station.contact || ''
        station.phone = station.phone || ''
        this.$remoteProxy.updateStation(station.name, station)
          .catch(error => {
            this.errorDialog = true
            this.errorText = error.response.data
          })
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
      sendMode: model.SEND_MODE.CREATE,
      errorDialog: false,
      errorText: '',
      SEND_MODE: model.SEND_MODE
    }
  },
  computed: {
    stations () {
      let copy = this.$store.state.stations.concat()
      copy.sort((a, b) => {
        return parseInt(a.order, 10) - parseInt(b.order, 10)
      })
      return copy
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
