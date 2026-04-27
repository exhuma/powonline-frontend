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
      :headers="headers"
      :items="filteredItems"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.route_name="{ item }">
        <v-chip v-if="item.route_name" size="small">{{
          item.route_name
        }}</v-chip>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip size="small" :color="statusColor(item)">
          {{ statusLabel(item) }}
        </v-chip>
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
import type { Team } from '@/remote/model/team'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'TeamTable',
  components: { RowActions },
  props: {
    teams: { type: Array as PropType<Team[]>, required: true },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false }
  },
  emits: ['open-create', 'open-edit', 'open-delete'],
  data() {
    return {
      filterText: '',
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Route', key: 'route_name', sortable: true },
        { title: 'Contact', key: 'contact', sortable: true },
        { title: 'Email', key: 'email', sortable: true },
        { title: 'Status', key: 'status', sortable: false },
        {
          title: 'Actions',
          key: 'actions',
          sortable: false,
          align: 'end' as const
        }
      ]
    }
  },
  computed: {
    filteredItems(): Team[] {
      if (!this.filterText || this.filterText.length < 3) return this.teams
      const fltr = this.filterText.toLowerCase()
      return this.teams.filter(
        (t) =>
          t.name.toLowerCase().includes(fltr) ||
          (t.contact || '').toLowerCase().includes(fltr)
      )
    }
  },
  methods: {
    statusLabel(team: Team): string {
      if (team.cancelled) return 'Cancelled'
      if (team.completed) return 'Completed'
      if (!team.accepted) return 'Pending'
      return 'Active'
    },
    statusColor(team: Team): string {
      if (team.cancelled) return 'error'
      if (team.completed) return 'success'
      if (!team.accepted) return 'warning'
      return 'primary'
    }
  }
})
</script>
