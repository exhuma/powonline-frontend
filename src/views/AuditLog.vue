<template>
  <div id="AuditLog">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-clipboard-text-clock</v-icon>
            <v-toolbar-title>Audit Log</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-text-field
              v-model="entryFilter"
              append-inner-icon="mdi-magnify"
              clearable
              label="Filter entries"
              hide-details
              density="compact"
              style="max-width: 250px"
              class="mr-2"
              @click:clear="entryFilter = ''"
            ></v-text-field>
            <v-btn @click="refresh">
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
              {{ format_ts(item.timestamp) }}
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { AuditLogRow } from '@/remote/model/auditLogRow'

export default defineComponent({
  name: 'AuditLog',
  inject: ['getSelectedEventId'],
  data() {
    return {
      loading: false,
      entries: [] as AuditLogRow[],
      entryFilter: '',
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
      const all = this.entries
      if (!this.entryFilter || this.entryFilter.length < 3) {
        return all
      }
      const fltr = this.entryFilter.toLowerCase()
      return all.filter((item) => {
        return (
          item.username.toLowerCase().includes(fltr) ||
          item.type.toLowerCase().includes(fltr) ||
          item.message.toLowerCase().includes(fltr)
        )
      })
    }
  },
  async mounted() {
    await this.refresh()
  },
  methods: {
    format_ts(ts: string): string {
      return moment(ts).format('YYYY-MM-DD HH:mm:ss')
    },
    async refresh() {
      const eventId: number | null = (this as any).getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        this.entries = await api.fetchAuditLog(eventId)
      } catch (e: any) {
        console.error(e)
        this.$emit('snackRequested', {
          message: `Unable to update audit-log (${
            e?.response?.data ?? e?.message
          })`,
          color: 'red'
        })
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
