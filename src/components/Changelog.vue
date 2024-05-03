<template>
  <center-col id="ChangeLog">
    <div v-html="parsedChangelog"></div>
    <v-footer class="pa-3">
      <v-spacer></v-spacer>
      <router-link to="/privacy-policy">Privacy Policy</router-link>
    </v-footer>
  </center-col>
</template>

<script lang="ts">
import { parse } from 'marked'
import changelogContent from '@/assets/changelog.md?raw'
import Vue from 'vue'
const ChangeLog = Vue.extend({
  computed: {
    parsedChangelog() {
      return parse(changelogContent)
    }
  }
})
export default ChangeLog
</script>

<style>
#ChangeLog H1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--v-primary-base);
  padding: 0;
  margin-top: 1em;
  margin-bottom: 1em;
}
#ChangeLog H2 {
  color: var(--v-accent-lighten5);
  border-bottom: 1px solid var(--v-primary-darken3);
  font-size: 120%;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
#ChangeLog H3 {
  color: var(--v-accent-lighten4);
  font-size: 100%;
  margin-left: 0.5em;
}
LI {
  margin-left: 0.5em;
}
H1 SMALL {
  font-size: 50%;
  font-weight: normal;
  font-style: italic;
}
</style>
