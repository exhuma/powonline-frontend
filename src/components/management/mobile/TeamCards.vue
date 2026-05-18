<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-account-group</v-icon>
          <span class="text-h6">Team Management</span>
          <v-spacer />
          <v-btn
            v-if="canEdit"
            color="primary"
            size="small"
            @click="$emit('open-create')"
          >
            <v-icon start>mdi-plus</v-icon>
            New Team
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="filterText"
            append-inner-icon="mdi-magnify"
            clearable
            label="Filter teams"
            hide-details
            density="compact"
            @click:clear="filterText = ''"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="team in filteredItems" :key="team.name">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2">
            <span class="text-caption text-disabled mr-1"
              >#{{ team.order }}</span
            >
            <span class="font-weight-medium">{{ team.name }}</span>
            <v-spacer />
            <v-chip v-if="team.route_name" size="x-small" class="mr-1">{{
              team.route_name
            }}</v-chip>
            <v-chip size="x-small" :color="statusColor(team)">{{
              statusLabel(team)
            }}</v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-if="isFullTeam(team) && team.contact"
              prepend-icon="mdi-account"
            >
              <v-list-item-title>{{ team.contact }}</v-list-item-title>
              <v-list-item-subtitle>Contact</v-list-item-subtitle>
            </v-list-item>
            <v-list-item
              v-if="isFullTeam(team) && team.email"
              prepend-icon="mdi-email"
            >
              <v-list-item-title>{{ team.email }}</v-list-item-title>
              <v-list-item-subtitle>Email</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-divider class="my-2" />
          <div class="d-flex ga-2">
            <v-btn
              v-if="canEdit"
              variant="tonal"
              size="small"
              prepend-icon="mdi-pencil"
              @click="$emit('open-edit', team)"
              >Edit</v-btn
            >
            <v-btn
              v-if="canEdit"
              variant="tonal"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="$emit('open-delete', team)"
              >Delete</v-btn
            >
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && filteredItems.length === 0"
      class="text-center text-disabled pa-8"
    >
      No teams found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { AnyTeam } from '@/remote/model/team'
import { isFullTeam } from '@/remote/model/team'

export default defineComponent({
  name: 'TeamCards',
  props: {
    teams: { type: Array as PropType<AnyTeam[]>, required: true },
    loading: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false }
  },
  emits: ['open-create', 'open-edit', 'open-delete'],
  data() {
    return {
      filterText: '',
      expanded: [] as number[]
    }
  },
  computed: {
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
    isFullTeam,
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
    }
  }
})
</script>
