<template>
  <center-col id="TeamPanel">
    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <template v-else-if="team">
      <team-form :team="team" :routes="routes" @update:team="onTeamUpdated" />
      <div v-if="hasRole('admin')">
        <confirmation-dialog
          buttonText="Delete"
          :actionArgument="team.name"
          @confirmed="onTeamDeleted"
        >
          <template #title
            ><span
              >Do you want to delete the team "{{ team.name }}"?</span
            ></template
          >
          <template #text>
            <div>
              <p>
                This will delete the team with the name "{{ team.name }}" and
                all related information!
              </p>
              <p>Are you sure?</p>
            </div>
          </template>
        </confirmation-dialog>
        <v-btn class="mt-2" @click="save">Save</v-btn>
      </div>
    </template>
    <v-alert v-else type="warning">Team not found.</v-alert>
  </center-col>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Session } from '@/App.vue'
import { api } from '@/main'
import type { AnyTeam, Team } from '@/remote/model/team'
import { isFullTeam } from '@/remote/model/team'
import type { Route } from '@/remote/model/route'
import TeamForm from '@/components/forms/TeamForm.vue'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'

const TeamPanel = defineComponent({
  name: 'team-panel',
  components: { TeamForm, ConfirmationDialog },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      team: null as AnyTeam | null,
      routes: [] as Route[]
    }
  },

  async created() {
    const eventId = (this as any).getSelectedEventId()
    this.loading = true
    try {
      const [team, routes] = await Promise.all([
        api.fetchTeam(String(this.$route.params.teamName), eventId),
        api.fetchRoutes(eventId)
      ])
      this.team = team
      this.routes = routes
    } catch (e) {
      console.error('Failed to fetch team data', e)
    } finally {
      this.loading = false
    }
  },

  methods: {
    hasRole(roleName: string): boolean {
      const session = this.session as Session
      return session.roles.includes(roleName)
    },
    onTeamUpdated(team: AnyTeam) {
      this.team = team
    },
    async onTeamDeleted() {
      const eventId = (this as any).getSelectedEventId()
      if (!this.team) return
      try {
        await api.deleteTeam(this.team.name, eventId)
        this.$emit('snackRequested', {
          message: `Team "${this.team.name}" deleted`
        })
        this.$router.push({
          name: 'team_list',
          params: { eventId: String(eventId) }
        })
      } catch (e) {
        console.error('Failed to delete team', e)
      }
    },
    async save() {
      if (!this.team) return
      if (!isFullTeam(this.team)) {
        this.$emit('snackRequested', {
          message:
            'Cannot save: full team data not available. You need the event_owner or event_co_admin role.',
          color: 'red'
        })
        return
      }
      const eventId = (this as any).getSelectedEventId()
      this.team.comments = this.team.comments || ''
      try {
        await api.updateTeam(
          String(this.$route.params.teamName),
          this.team as Team,
          eventId
        )
        this.$emit('snackRequested', { message: 'Save successful' })
        this.$router.push({
          name: 'team_list',
          params: { eventId: String(eventId) }
        })
      } catch (e) {
        console.error('Failed to save team', e)
      }
    }
  }
})
export default TeamPanel
</script>

<style scoped>
#TeamPanel {
  padding-bottom: 5em;
}
</style>
