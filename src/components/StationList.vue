<template>
  <CenterCol id="StationList">
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
    <PopupDialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="this.sendMode == this.SEND_MODE.UPDATE"
      title="Add New Station">
      <StationForm :station="selectedStation" />
    </PopupDialog>
    <v-list two-line>
      <StationBlock
        v-for="station in stations"
        @openEditDialog="onOpenEditDialog(station)"
        :station="station"
        :key="station.name"></StationBlock>
      <v-list-item>
        <v-spacer />
        <v-btn @click="openCreateDialog" v-if="identity.hasRole('admin')">Add new Station</v-btn>
      </v-list-item>
    </v-list>
  </CenterCol>
</template>

<script>

const LOG = window.console.log

import model from '@/model'
import CenterCol from '@/components/CenterCol'
import PopupDialog from '@/components/PopupDialog'
import StationBlock from '@/components/StationBlock'
import StationForm from '@/components/StationForm'

export default {
  name: 'StationList',
  props: {
    'identity': {
      type: Object
    }
  },
  methods: {
    onOpenEditDialog: function (station) {
      this.selectedStation = station
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.UPDATE
    },
    onDialogConfirmed: function () {
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
        LOG.error('Invalid send mode: ' + this.sendMode)
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
  },
  components: {
    CenterCol,
    PopupDialog,
    StationBlock,
    StationForm,
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
