<template>
  <v-layout row wrap justify-center>
    <v-flex xs12 md8 lg6 xl4>
      <slot>Centered content</slot>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: "center-col",
};
</script>
