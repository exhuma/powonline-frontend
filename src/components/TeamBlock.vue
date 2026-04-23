<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>{{ team.name }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-icon v-show="routeColor !== null" :style="routeColor"
        >mdi-gesture</v-icon
      >
    </v-list-item-action>
    <v-list-item-action v-if="hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>mdi-pencil</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action class="ml-3" v-if="hasRole('admin')">
      <confirmation-dialog
        buttonText="Delete"
        :actionArgument="team.name"
        @confirmed="deleteTeam"
      >
        <template #title
          >Do you want to delete the team "{{ team.name }}"?</template
        >
        <template #text>
          <div>
            <p>
              this will delete the team with the name "{{ team.name }}" and all
              related information!
            </p>
            <p>Are you sure?</p>
          </div>
        </template>
      </confirmation-dialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import model from '@/model'
import { defineComponent } from 'vue'
import { api } from '@/main'
import type { Team } from '@/remote/model/team'
import type { Route } from '@/remote/model/route'
import type { Session } from '@/App.vue'

const TeamBlock = defineComponent({
  name: 'team-block',
  inject: ['session', 'getSelectedEventId'],
  props: {
    team: {
      type: Object as () => Team,
      default: model.team.makeEmpty()
    },
    teams: {
      type: Array as () => Team[],
      default: () => []
    },
    routes: {
      type: Array as () => Route[],
      default: () => []
    }
  },

  computed: {
    routeColor(): string | null {
      const teamData = (this.teams as Team[]).find(
        (t: Team) => t.name === this.team.name
      )
      if (!teamData) return null
      const route = (this.routes as Route[]).find(
        (r: Route) => r.name === teamData.route_name
      )
      if (!route) return null
      return route.color ? `color: ${route.color};` : 'color: #000000;'
    }
  },

  methods: {
    hasRole(roleName: string): boolean {
      const session = this.session as Session
      return session.roles.includes(roleName)
    },
    openEditDialog() {
      this.$emit('openEditDialog')
    },
    async deleteTeam(teamName: string) {
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        await api.deleteTeam(teamName, eventId)
        this.$emit('deleted', teamName)
      } catch (e) {
        console.error('Failed to delete team', e)
      }
    }
  }
})
export default TeamBlock
</script>
