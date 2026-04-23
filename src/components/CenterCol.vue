<template>
  <v-row justify="center">
    <v-col cols="12" md="8" lg="6" xl="4">
      <slot>Centered content</slot>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
const CenterCol = defineComponent({
  name: 'center-col'
})
export default CenterCol
</script>
