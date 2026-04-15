<template>
  <center-col id="TeamList">
    <v-dialog v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
        <v-card-text class="white--text">{{ errorText }}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="errorDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="sendMode === SEND_MODE.UPDATE"
      title="Add New Team"
    >
      <team-form
        :send-mode="sendMode"
        :team="selectedTeam"
        :routes="routes"
        @update:team="onTeamUpdated"
      />
    </popup-dialog>

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else>
      <v-text-field
        v-model="teamFilter"
        append-icon="mdi-magnify"
        clearable
        label="Filter"
        @click:clear="onFilterCleared"
        hint="Filter list of teams by name and/or contact"
      ></v-text-field>

      <v-list>
        <v-list-group
          v-for="item in listItems"
          :key="item.data.name"
          v-model="item.active"
        >
          <template v-slot:activator>
            <v-list-item-title>{{ item.data.name }}</v-list-item-title>
          </template>

          <v-list-item
            v-if="hasRole(['admin', 'staff']) && item.data.contact"
            :key="item.data.name + 'contact'"
          >
            <v-list-item-content>
              <v-list-item-title>{{ item.data.contact }}</v-list-item-title>
              <v-list-item-subtitle>Contact</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-contacts</v-icon>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            v-if="hasRole(['admin', 'staff']) && item.data.phone"
            :key="item.data.name + 'phone'"
          >
            <v-list-item-content>
              <v-list-item-title>
                <a class="yellow--text" :href="`tel:${item.data.phone}`">{{
                  item.data.phone
                }}</a>
              </v-list-item-title>
              <v-list-item-subtitle>Phone</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <a :href="`tel:${item.data.phone}`">
                <v-btn icon text class="yellow--text"
                  ><v-icon>mdi-card-account-phone</v-icon></v-btn
                >
              </a>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            v-if="hasRole(['admin', 'staff']) && item.data.email"
            :key="item.data.name + 'email'"
          >
            <v-list-item-content>
              <v-list-item-title>
                <a class="yellow--text" :href="`mailto:${item.data.email}`">{{
                  item.data.email
                }}</a>
              </v-list-item-title>
              <v-list-item-subtitle>e-mail</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <a :href="`mailto:${item.data.email}`">
                <v-btn icon text class="yellow--text"
                  ><v-icon>mdi-card-account-mail</v-icon></v-btn
                >
              </a>
            </v-list-item-action>
          </v-list-item>

          <v-list-item
            v-if="hasRole(['admin'])"
            :key="item.data.name + 'info'"
            no-action
          >
            <v-list-item-content>
              <v-list-item-content>
                <v-btn :to="`/team/${item.data.name}`">Open Team Panel</v-btn>
              </v-list-item-content>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>

      <v-list-item v-if="hasRole(['admin'])">
        <v-spacer />
        <v-list-item-action>
          <v-btn @click="openCreateDialog">Add new Team</v-btn>
        </v-list-item-action>
      </v-list-item>
    </template>
  </center-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import model from '@/model'
import type { Team } from '@/remote/model/team'
import type { Route } from '@/remote/model/route'
import type { Session } from '@/App.vue'

const TeamList = Vue.extend({
  name: 'team_list',
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      teams: [] as Team[],
      routes: [] as Route[],
      isAddBlockVisible: false,
      selectedTeam: model.team.makeEmpty() as any,
      sendMode: model.SEND_MODE.CREATE,
      errorDialog: false,
      errorText: '',
      SEND_MODE: model.SEND_MODE,
      teamFilter: ''
    }
  },

  computed: {
    listItems(): { active: boolean; data: Team }[] {
      const all = this.teams
      let filtered: Team[]
      if (!this.teamFilter || this.teamFilter.length < 3) {
        filtered = all
      } else {
        const fltr = this.teamFilter.toLowerCase()
        filtered = all.filter((item) => {
          const nameMatches = item.name.toLowerCase().includes(fltr)
          const contactMatches = (item.contact || '')
            .toLowerCase()
            .includes(fltr)
          return nameMatches || contactMatches
        })
      }
      return filtered.map((item) => ({ active: false, data: item }))
    }
  },

  async created() {
    await this.fetchData()
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      // @ts-expect-error inject
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    async fetchData() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        const [teams, routes] = await Promise.all([
          api.fetchTeams(eventId),
          api.fetchRoutes(eventId)
        ])
        this.teams = teams
        this.routes = routes
      } catch (e) {
        console.error('Failed to fetch data', e)
      } finally {
        this.loading = false
      }
    },
    onFilterCleared() {
      this.teamFilter = ''
    },
    onTeamUpdated(team: Team) {
      this.selectedTeam = team
    },
    openCreateDialog() {
      const newTeam = model.team.makeEmpty() as any
      newTeam.accepted = true
      newTeam.is_confirmed = true
      this.selectedTeam = newTeam
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    async onDialogConfirmed() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      const team = this.selectedTeam

      if (!team.route_name) {
        this.$emit('snackRequested', {
          message: 'You must select a route!',
          color: 'red'
        })
        return
      }
      if (!team.name) {
        this.$emit('snackRequested', {
          message: 'The team must have a name!',
          color: 'red'
        })
        return
      }

      if (this.sendMode === model.SEND_MODE.CREATE) {
        try {
          const created = await api.addTeam(team, eventId)
          this.teams.push(created)
          this.$emit('snackRequested', { message: 'Save successful' })
        } catch (e: any) {
          this.errorDialog = true
          this.errorText = e?.response?.data ?? String(e)
          return
        }
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        try {
          const updated = await api.updateTeam(team.name, team, eventId)
          const idx = this.teams.findIndex((t) => t.name === team.name)
          if (idx >= 0) this.$set(this.teams, idx, updated)
          this.$emit('snackRequested', { message: 'Save successful' })
        } catch (e: any) {
          this.errorDialog = true
          this.errorText = e?.response?.data ?? String(e)
          return
        }
      }

      this.selectedTeam = model.team.makeEmpty()
      this.isAddBlockVisible = false
    }
  }
})
export default TeamList
</script>

<style scoped>
#TeamList {
  padding-bottom: 5em;
}
</style>
