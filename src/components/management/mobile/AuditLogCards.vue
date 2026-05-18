<template>
  <div>
    <!-- Mobile toolbar -->
    <v-container class="pa-2">
      <v-row align="center" class="mb-1">
        <v-col class="d-flex align-center">
          <v-icon class="mr-2">mdi-clipboard-text-clock</v-icon>
          <span class="text-h6">Audit Log</span>
          <v-spacer />
          <v-btn size="small" @click="$emit('refresh')">
            <v-icon start>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-model="filterText"
            append-inner-icon="mdi-magnify"
            clearable
            label="Filter entries"
            hide-details
            density="compact"
            @click:clear="filterText = ''"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-progress-linear v-if="loading" indeterminate />

    <v-expansion-panels v-model="expanded" multiple variant="accordion">
      <v-expansion-panel v-for="(entry, idx) in filteredEntries" :key="idx">
        <v-expansion-panel-title>
          <div class="d-flex align-center ga-2 w-100 pr-2 overflow-hidden">
            <div class="d-flex flex-column" style="min-width: 0">
              <span class="text-caption text-disabled"
                >{{ formatTs(entry.timestamp) }} · {{ entry.username }}</span
              >
              <span class="text-body-2 text-truncate">{{ entry.message }}</span>
            </div>
            <v-spacer />
            <v-chip size="x-small" variant="tonal">{{ entry.type }}</v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="text-body-2">{{ entry.message }}</div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div
      v-if="!loading && filteredEntries.length === 0"
      class="text-center text-disabled pa-8"
    >
      No audit log entries found.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import moment from 'moment'
import type { AuditLogRow } from '@/remote/model/auditLogRow'

export default defineComponent({
  name: 'AuditLogCards',
  props: {
    entries: { type: Array as PropType<AuditLogRow[]>, required: true },
    loading: { type: Boolean, default: false }
  },
  emits: ['refresh'],
  data() {
    return {
      filterText: '',
      expanded: [] as number[]
    }
  },
  computed: {
    filteredEntries(): AuditLogRow[] {
      if (!this.filterText || this.filterText.length < 3) return this.entries
      const fltr = this.filterText.toLowerCase()
      return this.entries.filter(
        (item) =>
          item.username.toLowerCase().includes(fltr) ||
          item.type.toLowerCase().includes(fltr) ||
          item.message.toLowerCase().includes(fltr)
      )
    }
  },
  methods: {
    formatTs(ts: string): string {
      return moment(ts).format('YYYY-MM-DD HH:mm:ss')
    }
  }
})
</script>
