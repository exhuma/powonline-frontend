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

<script>
export default {
  name: 'dashboard-progress-line',
  computed: {
    dynamicColor() {
      if (this.data.cancelled) {
        return '#444'
      }
      return this.color
    }
  },
  props: {
    color: {
      required: true
    },
    data: {
      required: true
    }
  }
}
</script>
