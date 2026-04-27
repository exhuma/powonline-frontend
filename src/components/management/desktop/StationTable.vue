<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-map-marker-multiple</v-icon>
      <v-toolbar-title>Station Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-btn v-if="canEdit" color="primary" @click="$emit('open-create')">
        <v-icon start>mdi-plus</v-icon>
        New Station
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="stations"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.is_start="{ item }">
        <v-icon v-if="item.is_start" color="green">mdi-check</v-icon>
      </template>
      <template v-slot:item.is_end="{ item }">
        <v-icon v-if="item.is_end" color="green">mdi-check</v-icon>
      </template>
      <template v-slot:item.actions="{ item }">
        <RowActions>
          <template #pinned>
            <v-btn
              v-if="canEdit"
              icon
              size="small"
              variant="text"
              @click="$emit('open-edit', item)"
              title="Edit station"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="canDashboard(item.name)"
              icon
              size="small"
              variant="text"
              @click="$emit('open-dashboard', item)"
              title="Open dashboard"
            >
              <v-icon>mdi-clipboard-text</v-icon>
            </v-btn>
          </template>
          <v-list-item
            v-if="canEdit"
            prepend-icon="mdi-delete"
            title="Delete"
            class="text-error"
            @click="$emit('open-delete', item)"
          />
        </RowActions>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { Station } from '@/remote/model/station'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'StationTable',
  components: { RowActions },
  props: {
    stations: { type: Array as PropType<Station[]>, required: true },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    myStations: {
      type: Object as PropType<Set<string>>,
      default: () => new Set<string>()
    },
    canOpenAnyDashboard: { type: Boolean, default: false }
  },
  emits: ['open-create', 'open-edit', 'open-delete', 'open-dashboard'],
  data() {
    return {
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Order', key: 'order', sortable: true },
        { title: 'Contact', key: 'contact', sortable: true },
        { title: 'Phone', key: 'phone', sortable: false },
        { title: 'Departure', key: 'is_start', sortable: false },
        { title: 'Arrival', key: 'is_end', sortable: false },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      ]
    }
  },
  methods: {
    canDashboard(stationName: string): boolean {
      if (this.canOpenAnyDashboard) return true
      return this.myStations.has(stationName)
    }
  }
})
</script>
