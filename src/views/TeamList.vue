<template>
  <div id="TeamList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <TeamTable
            v-if="!$vuetify.display.smAndDown"
            :teams="teams"
            :loading="loading"
            :can-edit="hasRole(['admin'])"
            @open-create="openCreateDialog"
            @open-edit="openEditDialog"
            @open-delete="confirmDelete"
          />
          <TeamCards
            v-else
            :teams="teams"
            :loading="loading"
            :can-edit="hasRole(['admin'])"
            @open-create="openCreateDialog"
            @open-edit="openEditDialog"
            @open-delete="confirmDelete"
          />
        </v-col>
      </v-row>
    </v-container>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="showTeamDialog" max-width="700px">
      <v-card>
        <v-card-title>{{
          editingTeam ? 'Edit Team' : 'New Team'
        }}</v-card-title>
        <v-card-text>
          <TeamForm
            :team="teamForm"
            :routes="routes"
            @update:team="onTeamFormUpdated"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showTeamDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onSaveTeam">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Delete Team</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ deletingTeam && deletingTeam.name }}</strong
          >? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Session } from '@/App.vue'
import { api } from '@/main'
import model from '@/model'
import type { AnyTeam, Team } from '@/remote/model/team'
import { isFullTeam } from '@/remote/model/team'
import type { Route } from '@/remote/model/route'
import TeamTable from '@/components/management/desktop/TeamTable.vue'
import TeamCards from '@/components/management/mobile/TeamCards.vue'
import TeamForm from '@/components/forms/TeamForm.vue'

export default defineComponent({
  name: 'TeamList',
  components: { TeamTable, TeamCards, TeamForm },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      teams: [] as AnyTeam[],
      routes: [] as Route[],
      showTeamDialog: false,
      showDeleteDialog: false,
      editingTeam: null as Team | null,
      deletingTeam: null as AnyTeam | null,
      teamForm: model.team.makeEmpty() as any
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    async fetchData() {
      const eventId = (this as any).getSelectedEventId()
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
    openCreateDialog() {
      this.editingTeam = null
      const newTeam = model.team.makeEmpty() as any
      newTeam.accepted = true
      newTeam.is_confirmed = true
      this.teamForm = newTeam
      this.showTeamDialog = true
    },
    openEditDialog(team: AnyTeam) {
      if (!isFullTeam(team)) return
      this.editingTeam = team
      this.teamForm = { ...team }
      this.showTeamDialog = true
    },
    onTeamFormUpdated(team: Team) {
      this.teamForm = team
    },
    confirmDelete(team: AnyTeam) {
      this.deletingTeam = team
      this.showDeleteDialog = true
    },
    async onSaveTeam() {
      const eventId = (this as any).getSelectedEventId()
      const team = this.teamForm
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
      if (this.editingTeam) {
        try {
          const updated = await api.updateTeam(team.name, team, eventId)
          const idx = this.teams.findIndex((t) => t.name === team.name)
          if (idx >= 0) this.teams[idx] = updated
          this.$emit('snackRequested', { message: 'Save successful' })
        } catch (e: any) {
          this.$emit('snackRequested', {
            message: e?.response?.data ?? String(e),
            color: 'red'
          })
          return
        }
      } else {
        try {
          const created = await api.addTeam(team, eventId)
          this.teams.push(created)
          this.$emit('snackRequested', { message: 'Save successful' })
        } catch (e: any) {
          this.$emit('snackRequested', {
            message: e?.response?.data ?? String(e),
            color: 'red'
          })
          return
        }
      }
      this.teamForm = model.team.makeEmpty()
      this.showTeamDialog = false
    },
    async doDelete() {
      this.showDeleteDialog = false
      if (!this.deletingTeam) return
      const eventId = (this as any).getSelectedEventId()
      try {
        await api.deleteTeam(this.deletingTeam.name, eventId)
        this.teams = this.teams.filter(
          (t) => t.name !== this.deletingTeam!.name
        )
      } catch (e) {
        console.error('Failed to delete team', e)
      }
      this.deletingTeam = null
    }
  }
})
</script>
