<template>
  <div>
    <v-text-field
      v-model="entryFilter"
      append-icon="search"
      clearable
      label="Filter"
      @click:clear="onFilterCleared"
      hint="Filter entries"
      ></v-text-field>
    <v-data-table
      :headers="headers"
      :items="filteredEntries">
      <template v-slot:item="props">
        <tr>
          <td>{{ format_ts(props.item.timestamp) }}</td>
          <td>{{ props.item.username }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.message }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-btn @click="refresh()">Refresh</v-btn>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'auditlog',
  data () {
    return {
      entries: [],
      entryFilter: '',
      headers: [
        {text: 'Timestamp', sortable: false},
        {text: 'User', sortable: false},
        {text: 'Type', sortable: false},
        {text: 'Message', sortable: false}
      ]
    }
  },
  computed: {
    filteredEntries () {
      let all = this.entries
      let filtered = null
      if (!this.entryFilter || this.entryFilter.length < 3) {
        filtered = all
      } else {
        filtered = all.filter((item) => {
          let fltr = this.entryFilter.toLowerCase()
          let userMatches = item.username.toLowerCase().includes(fltr)
          let typeMatches = item.type.toLowerCase().includes(fltr)
          let msgMatches = item.message.toLowerCase().includes(fltr)
          return userMatches || typeMatches || msgMatches
        })
      }
      return filtered
    }
  },
  methods: {
    format_ts (ts) {
      let obj = moment(ts)
      return obj.format('YYYY-MM-DD HH:mm:ss')
    },
    refresh () {
      this.$remoteProxy.fetchAuditLog()
        .then(result => {
          this.entries = result
        })
        .catch(e => {
          console.error(e)
          this.$emit('snackRequested', {
            message: `Unable to update audit-log (${e.response.data})`,
            color: 'red'
          })
        })
    },
    onFilterCleared (e) {
      this.entryFilter = ''
    }
  },
  created () {
    this.refresh()
  }
}
</script>
