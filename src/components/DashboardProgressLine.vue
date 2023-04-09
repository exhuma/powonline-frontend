<template>
    <v-layout>
        <v-flex xs8 sm5 md3 lg2 :class="{'white--text': true, 'mr-3': true, 'text-xs-left': true, 'cancelled': line.cancelled}">
            {{ line.team }}
        </v-flex>
        <v-flex xs4 sm7 md9 lg10>
          <v-progress-linear
            style="background: rgba(0, 0, 0, 0.20)"
            :color="route.color"
            :value="line.pct_finished"
            :buffer-value="line.pct_finished + line.pct_waiting"
            ></v-progress-linear>
        </v-flex>
    </v-layout>
</template>

<script>
export default {
  name: 'dashboard-progress-line',
  props: {
    route: {
      required: true
    },
    line: {
      required: true
    }
  }
}
</script>
