<template>
  <v-row>
    <v-col cols="1"
      ><v-icon :title="tooltip">{{ icon }}</v-icon></v-col
    >
    <v-col
      v-if="isConstructed()"
      cols="11"
      class="text-xs-left"
      v-html="muvalue"
    ></v-col>
    <v-col v-if="!isConstructed()" cols="11" class="text-xs-left">{{
      value
    }}</v-col>
  </v-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
const OptionalTeamRow = defineComponent({
  name: 'optional-team-row',
  props: {
    tooltip: { type: String, default: '' },
    icon: { type: String, default: '' },
    value: { type: String, default: '' },
    mu: { type: String, default: '' }
  },
  methods: {
    isConstructed(): boolean {
      return this.mu === 'email' || this.mu === 'tel'
    }
  },
  computed: {
    muvalue(): string {
      if (this.mu === 'email') {
        return `<a href="mailto:${this.value}">${this.value}</a>`
      }
      if (this.mu === 'tel') {
        return `<a href="tel:${this.value}">${this.value}</a>`
      }
      return this.value
    }
  }
})
export default OptionalTeamRow
</script>
