<template>
  <div id="TeamList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            <v-toolbar-title>Team Management</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-text-field
              v-model="teamFilter"
              append-inner-icon="mdi-magnify"
              clearable
              label="Filter teams"
              hide-details
              density="compact"
              style="max-width: 250px"
              class="mr-2"
              @click:clear="teamFilter = ''"
            ></v-text-field>
            <v-btn
              v-if="hasRole(['admin'])"
              color="primary"
              @click="openCreateDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              New Team
            </v-btn>
          </v-toolbar>
          <v-data-table
            :headers="visibleHeaders"
            :items="filteredTeams"
            :items-per-page="15"
            :loading="loading"
            class="elevation-0"
          >
            <template v-slot:item.route_name="{ item }">
              <v-chip v-if="item.route_name" size="small">{{
                item.route_name
              }}</v-chip>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip size="small" :color="teamStatusColor(item)">
                {{ teamStatusLabel(item) }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <RowActions>
                <template #pinned>
                  <v-btn
                    v-if="hasRole(['admin'])"
                    icon
                    size="small"
                    variant="text"
                    @click="openEditDialog(item)"
                    title="Edit team"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <v-list-item
                  v-if="hasRole(['admin'])"
                  prepend-icon="mdi-delete"
                  title="Delete"
                  class="text-error"
                  @click="confirmDelete(item)"
                />
              </RowActions>
            </template>
          </v-data-table>
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
import { api, pinnedEvent } from '@/main'
import model from '@/model'
import type { AnyTeam, Team } from '@/remote/model/team'
import { isFullTeam } from '@/remote/model/team'
import type { Route } from '@/remote/model/route'
import RowActions from '@/components/RowActions.vue'
import TeamForm from '@/components/forms/TeamForm.vue'

export default defineComponent({
  name: 'TeamList',
  components: { RowActions, TeamForm },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      teams: [] as AnyTeam[],
      routes: [] as Route[],
      teamFilter: '',
      showTeamDialog: false,
      showDeleteDialog: false,
      editingTeam: null as Team | null,
      deletingTeam: null as AnyTeam | null,
      teamForm: model.team.makeEmpty() as any,
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Route', key: 'route_name', sortable: true },
        { title: 'Status', key: 'status', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
      ]
    }
  },

  computed: {
    hasContactData(): boolean {
      return this.teams.some((t) => isFullTeam(t))
    },
    visibleHeaders(): object[] {
      if (this.hasContactData) {
        return [
          { title: 'Name', key: 'name', sortable: true },
          { title: 'Route', key: 'route_name', sortable: true },
          { title: 'Contact', key: 'contact', sortable: true },
          { title: 'Email', key: 'email', sortable: true },
          { title: 'Status', key: 'status', sortable: false },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
        ]
      }
      return (this as any).headers
    },
    filteredTeams(): AnyTeam[] {
      if (!this.teamFilter || this.teamFilter.length < 3) return this.teams
      const fltr = this.teamFilter.toLowerCase()
      return this.teams.filter((t) => {
        const contactMatch = isFullTeam(t)
          ? (t.contact || '').toLowerCase().includes(fltr)
          : false
        return t.name.toLowerCase().includes(fltr) || contactMatch
      })
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    teamPanelPath(teamName: string): string {
      if (pinnedEvent.value) return `/team/${teamName}`
      return `/event/${this.$route.params.eventId}/team/${teamName}`
    },
    hasRole(roleNames: string[]): boolean {
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    teamStatusLabel(team: Team): string {
      if (team.cancelled) return 'Cancelled'
      if (team.completed) return 'Completed'
      if (!team.accepted) return 'Pending'
      return 'Active'
    },
    teamStatusColor(team: Team): string {
      if (team.cancelled) return 'error'
      if (team.completed) return 'success'
      if (!team.accepted) return 'warning'
      return 'primary'
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
