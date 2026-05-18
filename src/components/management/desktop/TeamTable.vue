<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-account-group</v-icon>
      <v-toolbar-title>Team Management</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-text-field
        v-model="filterText"
        append-inner-icon="mdi-magnify"
        clearable
        label="Filter teams"
        hide-details
        density="compact"
        style="max-width: 250px"
        class="mr-2"
        @click:clear="filterText = ''"
      ></v-text-field>
      <v-btn v-if="canEdit" color="primary" @click="$emit('open-create')">
        <v-icon start>mdi-plus</v-icon>
        New Team
      </v-btn>
    </v-toolbar>
    <v-data-table
      v-model:sort-by="sortBy"
      :headers="visibleHeaders"
      :items="filteredItems"
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
              :disabled="index === filteredItems.length - 1"
              @click="moveDown(index)"
            >
              <v-icon size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
        </div>
      </template>
      <template #item.route_name="{ item }">
        <v-chip v-if="item.route_name" size="small">{{
          item.route_name
        }}</v-chip>
      </template>
      <template #item.status="{ item }">
        <v-chip size="small" :color="statusColor(item)">
          {{ statusLabel(item) }}
        </v-chip>
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
              title="Edit team"
            >
              <v-icon>mdi-pencil</v-icon>
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
import type { AnyTeam } from '@/remote/model/team'
import { isFullTeam } from '@/remote/model/team'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'TeamTable',
  components: { RowActions },
  props: {
    teams: { type: Array as PropType<AnyTeam[]>, required: true },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false }
  },
  emits: ['open-create', 'open-edit', 'open-delete', 'reorder'],
  data() {
    return {
      filterText: '',
      sortBy: [{ key: 'order', order: 'asc' as const }]
    }
  },
  computed: {
    isSortedByOrder(): boolean {
      return this.sortBy.length > 0 && this.sortBy[0].key === 'order'
    },
    hasContactData(): boolean {
      return this.teams.some((t) => isFullTeam(t))
    },
    visibleHeaders(): object[] {
      const base: object[] = [
        { title: 'Order', key: 'order', sortable: true },
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Route', key: 'route_name', sortable: true }
      ]
      if (this.hasContactData) {
        base.push(
          { title: 'Contact', key: 'contact', sortable: true },
          { title: 'Email', key: 'email', sortable: true }
        )
      }
      base.push(
        { title: 'Status', key: 'status', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false }
      )
      return base
    },
    filteredItems(): AnyTeam[] {
      if (!this.filterText || this.filterText.length < 3) return this.teams
      const fltr = this.filterText.toLowerCase()
      return this.teams.filter(
        (t) =>
          t.name.toLowerCase().includes(fltr) ||
          (isFullTeam(t) && (t.contact || '').toLowerCase().includes(fltr))
      )
    }
  },
  methods: {
    statusLabel(team: AnyTeam): string {
      if (team.cancelled) return 'Cancelled'
      if (team.completed) return 'Completed'
      if (!team.accepted) return 'Pending'
      return 'Active'
    },
    statusColor(team: AnyTeam): string {
      if (team.cancelled) return 'error'
      if (team.completed) return 'success'
      if (!team.accepted) return 'warning'
      return 'primary'
    },
    moveUp(index: number) {
      this.swap(index, index - 1)
    },
    moveDown(index: number) {
      this.swap(index, index + 1)
    },
    swap(i: number, j: number) {
      let list = this.filteredItems.slice()
      // If order values are not unique, renumber sequentially before swapping
      const orders = list.map((t) => t.order)
      const hasDuplicates = new Set(orders).size !== orders.length
      if (hasDuplicates) {
        list = list.map((t, idx) => ({ ...t, order: idx + 1 }))
      }
      const tmp = list[i].order
      list[i] = { ...list[i], order: list[j].order }
      list[j] = { ...list[j], order: tmp }
      this.$emit('reorder', list)
    }
  }
})
</script>
