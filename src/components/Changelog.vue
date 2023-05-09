<template>
  <center-col id="ChangeLog">
    <div v-html="parsedChangelog"></div>
    <v-footer class="pa-3">
      <v-spacer></v-spacer>
      <router-link to="/privacy-policy">Privacy Policy</router-link>
    </v-footer>
  </center-col>
</template>

<script>
import { parse } from 'marked'
import changelogContent from '@/assets/changelog.md?raw'
export default {
  computed: {
    parsedChangelog() {
      return parse(changelogContent)
    }
  }
}
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
  color: var(--v-accent-darken2);
  font-size: 120%;
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
