<template>
  <div>
    <v-toolbar flat color="transparent">
      <v-icon class="mr-2">mdi-clipboard-text-clock</v-icon>
      <v-toolbar-title>Audit Log</v-toolbar-title>
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-text-field
        v-model="filterText"
        append-inner-icon="mdi-magnify"
        clearable
        label="Filter entries"
        hide-details
        density="compact"
        style="max-width: 250px"
        class="mr-2"
        @click:clear="filterText = ''"
      ></v-text-field>
      <v-btn @click="$emit('refresh')">
        <v-icon start>mdi-refresh</v-icon>
        Refresh
      </v-btn>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="filteredEntries"
      :items-per-page="15"
      :loading="loading"
      class="elevation-0"
    >
      <template v-slot:item.timestamp="{ item }">
        {{ formatTs(item.timestamp) }}
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import moment from 'moment'
import type { AuditLogRow } from '@/remote/model/auditLogRow'

export default defineComponent({
  name: 'AuditLogTable',
  props: {
    entries: { type: Array as PropType<AuditLogRow[]>, required: true },
    loading: { type: Boolean, default: false }
  },
  emits: ['refresh'],
  data() {
    return {
      filterText: '',
      headers: [
        { title: 'Timestamp', key: 'timestamp', sortable: true },
        { title: 'User', key: 'username', sortable: true },
        { title: 'Type', key: 'type', sortable: true },
        { title: 'Message', key: 'message', sortable: false }
      ]
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
