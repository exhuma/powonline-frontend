<template>

  <v-container id="GlobalDashboard">
    <v-layout row wrap>
      <v-flex xs12 elevation-1>

        <table class="dashboard">
          <tr>
            <th>&nbsp;</th>
            <th v-for="station in matrix[0]['stations']" :key="station['name']">
              {{ station['name'] }}
            </th>
          </tr>
          <tr v-for="row in matrix" :key="row['team']">
            <th>{{ row['team'] }}</th>
            <td v-for="station in row['stations']" :key="row['team']+station['name']">
              <v-tooltip top>
                <v-icon v-if="station['state'] !== 'unreachable'" slot="activator">{{ getStateIcon(station['state']) }}</v-icon>
                <div>{{ row['team'] }} @ {{ station }}<br />{{ station['state'] }}</div>
              </v-tooltip>
            </td>
          </tr>
        </table>

      </v-flex>
    </v-layout>
  </v-container>

</template>

<script>
import util from '@/util'
export default {
  name: 'global_dashboard',
  computed: {
    matrix () {
      return this.$store.state.global_dashboard
    }
  },
  methods: {
    getStateIcon (state) {
      return util.getStateIcon(state)
    }
  },
  created () {
    this.$store.dispatch('fetchGlobalDashboard')
    this.$store.commit('changeTitle', 'Global Dashboard')
  }
}
</script>

<style scoped>
.dashboard {
  color: white;
  width: 100%;
  margin: 1em;
}
</style>
