<template>
  <div id="AuditLog">
    <v-container>
      <v-row>
        <v-col cols="12">
          <AuditLogTable
            v-if="!$vuetify.display.smAndDown"
            :entries="entries"
            :loading="loading"
            @refresh="refresh"
          />
          <AuditLogCards
            v-else
            :entries="entries"
            :loading="loading"
            @refresh="refresh"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { AuditLogRow } from '@/remote/model/auditLogRow'
import AuditLogTable from '@/components/management/desktop/AuditLogTable.vue'
import AuditLogCards from '@/components/management/mobile/AuditLogCards.vue'

export default defineComponent({
  name: 'AuditLog',
  components: { AuditLogTable, AuditLogCards },
  inject: ['getSelectedEventId'],
  data() {
    return {
      loading: false,
      entries: [] as AuditLogRow[]
    }
  },
  async mounted() {
    await this.refresh()
  },
  methods: {
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
