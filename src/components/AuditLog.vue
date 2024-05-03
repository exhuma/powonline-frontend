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

<script>
import moment from 'moment'
export default {
  name: 'auditlog',
  data() {
    return {
      entries: [],
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
    filteredEntries() {
      const all = this.entries
      let filtered = null
      if (!this.entryFilter || this.entryFilter.length < 3) {
        filtered = all
      } else {
        filtered = all.filter((item) => {
          const fltr = this.entryFilter.toLowerCase()
          const userMatches = item.username.toLowerCase().includes(fltr)
          const typeMatches = item.type.toLowerCase().includes(fltr)
          const msgMatches = item.message.toLowerCase().includes(fltr)
          return userMatches || typeMatches || msgMatches
        })
      }
      return filtered
    }
  },
  methods: {
    format_ts(ts) {
      const obj = moment(ts)
      return obj.format('YYYY-MM-DD HH:mm:ss')
    },
    refresh() {
      this.$remoteProxy
        .fetchAuditLog()
        .then((result) => {
          this.entries = result
        })
        .catch((e) => {
          console.error(e)
          this.$emit('snackRequested', {
            message: `Unable to update audit-log (${e.response.data})`,
            color: 'red'
          })
        })
    },
    onFilterCleared(e) {
      this.entryFilter = ''
    }
  },
  created() {
    this.refresh()
  }
}
</script>
