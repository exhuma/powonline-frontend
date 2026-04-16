<template>
  <v-row>
    <v-col
      cols="5"
      sm="4"
      md="2"
      :class="{
        'd-flex': true,
        'align-center': true,
        'justify-end': true,
        'text-white': true,
        'mr-3': true,
        'text-xs-left': true,
        cancelled: data.cancelled
      }"
    >
      {{ data.team }}
    </v-col>
    <v-col class="d-flex align-center" cols="7" sm="8" md="10">
      <v-progress-linear
        style="background: rgba(0, 0, 0, 0.2)"
        :color="dynamicColor"
        :model-value="data.pct_finished"
        :buffer-value="data.pct_finished + data.pct_waiting"
      ></v-progress-linear>
    </v-col>
  </v-row>
</template>

<style scoped>
.cancelled {
  text-decoration: line-through;
  color: #888 !important;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'
const DashboardProgressLine = defineComponent({
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
