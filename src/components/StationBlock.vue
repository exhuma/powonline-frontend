<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>{{ station.name }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="identity.hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>mdi-pencil</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action>
      <v-btn icon ripple @click.native="openDashBoard(station)">
        <v-icon>mdi-pencil-box-multiple</v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-action class="ml-3" v-if="identity.hasRole('admin')">
      <ConfirmationDialog
        buttonText="Delete"
        :actionArgument="station.name"
        actionName="deleteStationRemote">
        <span slot="title">Do you want to delete the station "{{ station.name }}"?</span>
        <div slot="text">
          <p>this will delete the station with the name "{{ station.name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </ConfirmationDialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import ConfirmationDialog from '@/components/ConfirmationDialog'
import model from '@/model'
export default {
  name: 'station-block',
  props: {
    'station': {
      type: Object,
      default: function () { return model.station.makeEmpty() }
    },
    'identity': {
      type: Object,
    }
  },
  methods: {
    openDashBoard (station) {
      this.$router.push('/station/' + station.name)
    },
    openEditDialog () {
      this.$emit('openEditDialog')
    }
  },
  components: {
    ConfirmationDialog
  }
}
</script>
