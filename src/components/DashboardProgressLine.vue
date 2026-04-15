<template>
  <v-layout>
    <v-flex
      xs5
      sm4
      md2
      :class="{
        'd-flex': true,
        'align-center': true,
        'justify-end': true,
        'white--text': true,
        'mr-3': true,
        'text-xs-left': true,
        cancelled: data.cancelled
      }"
    >
      {{ data.team }}
    </v-flex>
    <v-flex class="d-flex align-center" xs7 sm8 md10>
      <v-progress-linear
        style="background: rgba(0, 0, 0, 0.2)"
        :color="dynamicColor"
        :value="data.pct_finished"
        :buffer-value="data.pct_finished + data.pct_waiting"
      ></v-progress-linear>
    </v-flex>
  </v-layout>
</template>

<style scoped>
.cancelled {
  text-decoration: line-through;
  color: #888 !important;
}
</style>

<script lang="ts">
import Vue from 'vue'
const DashboardProgressLine = Vue.extend({
  name: 'dashboard-progress-line',
  props: {
    color: {
      type: String,
      required: true
    },
    data: {
      type: Object as () => {
        team: string
        cancelled: boolean
        pct_finished: number
        pct_waiting: number
      },
      required: true
    }
  },
  computed: {
    dynamicColor(): string {
      if ((this.data as any).cancelled) {
        return '#444'
      }
      return this.color
    }
  }
})
export default DashboardProgressLine
</script>
