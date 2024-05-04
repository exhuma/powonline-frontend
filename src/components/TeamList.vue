<template>
  <center-col id="TeamList">
    <v-dialog v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
      </v-card>
      <v-card-text class="white--text">
        {{ errorText }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="errorDialog = false">OK</v-btn>
      </v-card-actions>
    </v-dialog>
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="this.sendMode == this.SEND_MODE.UPDATE"
      title="Add New Team"
    >
      <team-form :send-mode="sendMode" :team="selectedTeam" />
    </popup-dialog>
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
        :key="item.title"
        v-model="item.active"
        v-for="item in listItems"
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
              ></a
            >
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
              ></a
            >
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
      <!-- TODO: should not use v-list-item here -->
      <v-spacer />
      <v-list-item-action>
        <v-btn @click="openCreateDialog">Add new Team</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import model from '@/model'

import Vue from 'vue'
const TeamList = Vue.extend({
  name: 'team_list',
  data() {
    return {
      isAddBlockVisible: false,
      selectedTeam: model.team.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      errorDialog: false,
      errorText: '',
      SEND_MODE: model.SEND_MODE,
      teamFilter: ''
    }
  },
  methods: {
    onFilterCleared(e) {
      this.teamFilter = ''
    },
    onTeamSelected(team) {
      this.selectedTeam = team
    },
    openCreateDialog: function () {
      const newTeam = model.team.makeEmpty()

      // The new team is automatically accepted and confirmed
      // because it's added via the admin interface
      newTeam.accepted = true
      newTeam.is_confirmed = true

      this.selectedTeam = newTeam
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    onDialogConfirmed() {
      const team = this.selectedTeam
      if (!team.route_name) {
        this.$emit('snackRequested', {
          message: 'You must select a route!',
          color: 'red'
        })
        return false
      }

      if (!team.name) {
        this.$emit('snackRequested', {
          message: 'The team must have a name!',
          color: 'red'
        })
        return false
      }

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$remoteProxy
          .addTeam(team)
          .then((team) => {
            this.$store.commit('addTeam', team)
            this.$emit('snackRequested', {
              message: 'Save successful'
            })
          })
          .catch((error) => {
            this.errorDialog = true
            this.errorText = error.response.data
            console.error(error)
          })
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        this.$remoteProxy
          .updateTeam(team.name, team)
          .then((team) => {
            this.$emit('snackRequested', {
              message: 'Save successful'
            })
          })
          .catch((error) => {
            this.errorDialog = true
            this.errorText = error.response.data
          })
      } else {
        console.error('Invalid send mode: ' + this.sendMode)
      }

      this.$emit('teamSaved', team)
      this.selectedTeam = model.team.makeEmpty()

      this.isAddBlockVisible = false
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    hasRole(roleNames: string[]) {
      let output = false
      const roles = this.$store.state.roles as string[]
      roleNames.forEach((role) => {
        output = output || roles.includes(role)
      })
      return output
    }
  },

  created() {
    this.$store.commit('changeTitle', 'Team List')
  },

  computed: {
    listItems() {
      const all = this.$store.state.teams
      let filtered = null
      if (!this.teamFilter || this.teamFilter.length < 3) {
        filtered = all
      } else {
        filtered = all.filter((item) => {
          const fltr = this.teamFilter.toLowerCase()
          const nameMatches = item.name.toLowerCase().includes(fltr)
          const contactMatches = item.contact.toLowerCase().includes(fltr)
          return nameMatches || contactMatches
        })
      }
      const output = []
      filtered.forEach((item) => {
        output.push({
          active: false,
          data: item
        })
      })
      return output
    },
    teams() {
      const all = this.$store.state.teams
      if (!this.teamFilter || this.teamFilter.length < 3) {
        return all
      }
      const filtered = all.filter((item) => {
        const fltr = this.teamFilter.toLowerCase()
        const nameMatches = item.name.toLowerCase().includes(fltr)
        const contactMatches = item.contact.toLowerCase().includes(fltr)
        return nameMatches || contactMatches
      })
      return filtered
    }
  }
})
export default TeamList
</script>

<style scoped>
#TeamList {
  padding-bottom: 5em;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}
.slide-enter {
  transform: translateY(-100px);
  opacity: 0;
}
.slide-leave-to {
  transform: translateY(-100px);
  opacity: 0;
}
</style>
