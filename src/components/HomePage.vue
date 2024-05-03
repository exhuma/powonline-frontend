<template>
  <div id="HomePage">
    <center>Hello</center>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
const HomePage = Vue.extend({
  name: 'homepage',
  created() {
    this.$store.commit('changeTitle', 'PowOnline v1.1.1')
  }
})
export default HomePage
</script>
