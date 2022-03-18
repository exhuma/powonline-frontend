<template>
  <v-container>
    <v-layout row wrap justify-center>
      <v-flex xs11 md8 lg6 xl4>
        <slot>Centered content</slot>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: "CenterCol"
};
</script>
