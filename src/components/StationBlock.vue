<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>{{ station.name }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>mdi-pencil</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action v-if="hasRole('station_manager')">
      <v-btn icon ripple @click="openDashBoard(station)">
        <v-icon>mdi-clipboard-text</v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-action class="ml-3" v-if="hasRole('admin')">
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="station.name"
        @confirmed="deleteStation"
      >
        <template #title
          >Do you want to delete the station "{{ station.name }}"?</template
        >
        <template #text>
          <div>
            <p>
              this will delete the station with the name "{{ station.name }}"
              and all related information!
            </p>
            <p>Are you sure?</p>
          </div>
        </template>
      </confirmation-dialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import model from '@/model'
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { Session } from '@/App.vue'

const StationBlock = defineComponent({
  name: 'station-block',
  inject: ['session', 'getSelectedEventId'],
  props: {
    station: {
      type: Object,
      default: function () {
        return model.station.makeEmpty()
      }
    }
  },
  methods: {
    openDashBoard(station: Record<string, any>) {
      const eventId = (this.getSelectedEventId as () => number | null)()
      this.$router.push(
        `/event/${eventId}/station/${(station as { name: string }).name}`
      )
    },
    hasRole(roleName: string): boolean {
      const session = this.session as Session
      return session.roles.includes(roleName)
    },
    openEditDialog() {
      this.$emit('openEditDialog')
    },
    async deleteStation(stationName: string) {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        await api.deleteStation(stationName, eventId)
        this.$emit('deleted', stationName)
      } catch (e) {
        console.error('Failed to delete station', e)
      }
    }
  }
})
export default StationBlock
</script>
