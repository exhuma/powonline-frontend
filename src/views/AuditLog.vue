<template>
  <div>
    <v-text-field
      v-model="entryFilter"
      append-icon="mdi-magnify"
      clearable
      label="Filter"
      @click:clear="onFilterCleared"
      hint="Filter entries"
    ></v-text-field>
    <v-data-table :headers="headers" :items="filteredEntries">
      <template v-slot:top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <v-btn class="secondary" @click="refresh()">
            Refresh
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item="props">
        <tr>
          <td>{{ format_ts(props.item.timestamp) }}</td>
          <td>{{ props.item.username }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.message }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import Vue from 'vue'
import { api } from '@/main'
import type { AuditLogRow } from '@/remote/model/auditLogRow'

export default Vue.extend({
  name: 'AuditLog',
  inject: ['getSelectedEventId'],
  data() {
    return {
      entries: [] as AuditLogRow[],
      entryFilter: '',
      headers: [
        { text: 'Timestamp', sortable: false },
        { text: 'User', sortable: false },
        { text: 'Type', sortable: false },
        { text: 'Message', sortable: false }
      ]
    }
  },
  computed: {
    filteredEntries(): AuditLogRow[] {
      const all = this.entries
      if (!this.entryFilter || this.entryFilter.length < 3) {
        return all
      }
      return all.filter((item) => {
        const fltr = this.entryFilter.toLowerCase()
        const userMatches = item.username.toLowerCase().includes(fltr)
        const typeMatches = item.type.toLowerCase().includes(fltr)
        const msgMatches = item.message.toLowerCase().includes(fltr)
        return userMatches || typeMatches || msgMatches
      })
    }
  },
  methods: {
    format_ts(ts: string): string {
      return moment(ts).format('YYYY-MM-DD HH:mm:ss')
    },
    async refresh() {
      const eventId: number | null = (this as any).getSelectedEventId()
      if (!eventId) return
      try {
        this.entries = await api.fetchAuditLog(eventId)
      } catch (e: any) {
        console.error(e)
        this.$emit('snackRequested', {
          message: `Unable to update audit-log (${e?.response?.data ?? e?.message})`,
          color: 'red'
        })
      }
    },
    onFilterCleared() {
      this.entryFilter = ''
    }
  },
  created() {
    this.refresh()
  }
})
</script>
