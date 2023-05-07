<template>
  <v-layout row>
    <v-flex xs1
      ><v-icon :title="tooltip">{{ icon }}</v-icon></v-flex
    >
    <v-flex
      v-if="isConstructed()"
      xs11
      class="text-xs-left"
      v-html="muvalue"
    ></v-flex>
    <v-flex v-if="!isConstructed()" xs11 class="text-xs-left">{{
      this.value
    }}</v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'optional-team-row',
  props: ['tooltip', 'icon', 'value', 'mu'],
  methods: {
    isConstructed: function () {
      return this.mu === 'email' || this.mu === 'tel'
    }
  },
  computed: {
    muvalue() {
      if (this.mu === 'email') {
        return `<a href="mailto:${this.value}">${this.value}</a>`
      }
      if (this.mu === 'tel') {
        return `<a href="tel:${this.value}">${this.value}</a>`
      }
      return this.value
    }
  }
}
</script>
