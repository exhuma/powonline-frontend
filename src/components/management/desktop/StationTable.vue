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
      v-model:sort-by="sortBy"
      :headers="visibleHeaders"
      :items="stations"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template #item.order="{ item, index }">
        <div class="d-flex align-center ga-1">
          <template v-if="isSortedByOrder && canEdit">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :disabled="index === 0"
              @click="moveUp(index)"
            >
              <v-icon size="small">mdi-chevron-up</v-icon>
            </v-btn>
          </template>
          <span>{{ item.order }}</span>
          <template v-if="isSortedByOrder && canEdit">
            <v-btn
              icon
              size="x-small"
              variant="text"
              :disabled="index === stations.length - 1"
              @click="moveDown(index)"
            >
              <v-icon size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
        </div>
      </template>
      <template #item.is_start="{ item }">
        <v-icon v-if="item.is_start" color="green">mdi-check</v-icon>
      </template>
      <template #item.is_end="{ item }">
        <v-icon v-if="item.is_end" color="green">mdi-check</v-icon>
      </template>
      <template #item.actions="{ item }">
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
import type { AnyStation } from '@/remote/model/station'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'StationTable',
  components: { RowActions },
  props: {
    stations: { type: Array as PropType<AnyStation[]>, required: true },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    myStations: {
      type: Object as PropType<Set<string>>,
      default: () => new Set<string>()
    },
    canOpenAnyDashboard: { type: Boolean, default: false },
    hasContactData: { type: Boolean, default: false }
  },
  emits: [
    'open-create',
    'open-edit',
    'open-delete',
    'open-dashboard',
    'reorder'
  ],
  data() {
    return {
      sortBy: [{ key: 'order', order: 'asc' as const }]
    }
  },
  computed: {
    isSortedByOrder(): boolean {
      return this.sortBy.length > 0 && this.sortBy[0].key === 'order'
    },
    visibleHeaders(): object[] {
      const base: object[] = [
        { title: 'Order', key: 'order', sortable: true },
        { title: 'Name', key: 'name', sortable: true }
      ]
      if (this.hasContactData) {
        base.push(
          { title: 'Contact', key: 'contact', sortable: true },
          { title: 'Phone', key: 'phone', sortable: false }
        )
      }
      base.push(
        { title: 'Departure', key: 'is_start', sortable: false },
        { title: 'Arrival', key: 'is_end', sortable: false },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      )
      return base
    }
  },
  methods: {
    canDashboard(stationName: string): boolean {
      if (this.canOpenAnyDashboard) return true
      return this.myStations.has(stationName)
    },
    moveUp(index: number) {
      this.swap(index, index - 1)
    },
    moveDown(index: number) {
      this.swap(index, index + 1)
    },
    swap(i: number, j: number) {
      let list = this.stations.slice()
      // If order values are not unique, renumber sequentially before swapping
      const orders = list.map((s) => s.order)
      const hasduplicates = new Set(orders).size !== orders.length
      if (hasduplicates) {
        list = list.map((s, idx) => ({ ...s, order: idx + 1 }))
      }
      const tmp = list[i].order
      list[i] = { ...list[i], order: list[j].order }
      list[j] = { ...list[j], order: tmp }
      this.$emit('reorder', list)
    }
  }
})
</script>
