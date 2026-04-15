<template>
  <center-col id="Manual">
    <v-tabs v-model="activeTab" grow>
      <v-tab>Public</v-tab>
      <v-tab v-if="isLoggedIn">Registered Users</v-tab>
      <v-tab v-if="isStaff">Staff</v-tab>
      <v-tab v-if="isAdmin">Admin</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab" class="pa-5">
      <v-tab-item>
        <div v-html="publicManual"></div>
      </v-tab-item>
      <v-tab-item>
        <div v-html="registeredManual"></div>
      </v-tab-item>
      <v-tab-item>
        <div v-html="staffManual"></div>
      </v-tab-item>
      <v-tab-item>
        <div v-html="adminManual"></div>
      </v-tab-item>
    </v-tabs-items>
  </center-col>
</template>

<script lang="ts">
import * as publicManualMd from '@/assets/manual/manual-public.md'
import * as registeredManualMd from '@/assets/manual/manual-user.md'
import * as staffManualMd from '@/assets/manual/manual-staff.md'
import * as adminManualMd from '@/assets/manual/manual-admin.md'
import Vue from 'vue'
import type { Session } from '@/App.vue'

export default Vue.extend({
  name: 'Manual',
  inject: ['session'],
  data() {
    return {
      activeTab: 'public'
    }
  },
  computed: {
    isLoggedIn(): boolean {
      return Boolean((this as any).session.userName)
    },
    isAdmin(): boolean {
      const roles: string[] = (this as any).session.roles
      return roles.includes('admin')
    },
    isStaff(): boolean {
      const roles: string[] = (this as any).session.roles
      return (
        roles.includes('admin') ||
        roles.includes('staff') ||
        roles.includes('station_manager')
      )
    },
    publicManual(): string {
      // @ts-expect-error - markdown imports don't seem to be typed properly
      return publicManualMd.html
    },
    registeredManual(): string {
      // @ts-expect-error - markdown imports don't seem to be typed properly
      return registeredManualMd.html
    },
    staffManual(): string {
      // @ts-expect-error - markdown imports don't seem to be typed properly
      return staffManualMd.html
    },
    adminManual(): string {
      // @ts-expect-error - markdown imports don't seem to be typed properly
      return adminManualMd.html
    }
  }
})
</script>

<style>
#Manual H1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--v-primary-base);
  padding: 0;
  margin-top: 1em;
  margin-bottom: 1em;
}
#Manual H2 {
  color: var(--v-accent-lighten5);
  border-bottom: 1px solid var(--v-primary-darken3);
  font-size: 120%;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
#Manual H3 {
  color: var(--v-accent-lighten4);
  font-size: 100%;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
#Manual H4 {
  margin-top: 0.7em;
  margin-bottom: 0.1em;
}
#Manual .admonition {
  border: 1px solid var(--admonition-border-color) !important;
  border-left: 7px solid var(--admonition-border-color) !important;
  background: var(--admonition-color) !important;
  border-radius: 3px;
  padding: 0.5em 1em;
  margin: 1em;
}
#Manual .admonition.important {
  --admonition-content: 'Important';
  --admonition-color: hsl(214, 46%, 33%) !important;
  --admonition-border-color: hsl(214, 46%, 64%) !important;
}
#Manual .admonition.tip {
  --admonition-content: 'Tip';
  --admonition-color: hsl(125, 33%, 34%) !important;
  --admonition-border-color: hsl(125, 33%, 64%) !important;
}
#Manual .admonition.warning {
  --admonition-content: 'Warning';
  --admonition-border-color: hsl(44, 50%, 62%) !important;
  --admonition-color: hsl(44, 50%, 34%) !important;
}
#Manual .admonition::before {
  font-weight: bold;
  border-bottom: 1px solid white;
  display: block;
  margin-bottom: 1em;
  content: var(--admonition-content);
}
#Manual IMG {
  border: 1px solid var(--v-primary-base);
  max-width: 100%;
  margin-top: 1em;
  margin-bottom: 1em;
  -webkit-box-shadow: 3px 3px 3px 0px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 3px 3px 3px 0px rgba(0, 0, 0, 0.75);
  box-shadow: 3px 3px 3px 0px rgba(0, 0, 0, 0.75);
}
#Manual HR {
  margin-top: 2em;
  margin-bottom: 2em;
  color: var(--v-primary-lighten2);
  background-color: var(--v-primary-lighten2);
  height: 3px;
}
LI {
  margin-left: 0.5em;
}
</style>
