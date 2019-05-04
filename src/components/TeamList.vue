<template>
  <center-col id="TeamList">
    <v-dialog
      v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
      </v-card>
      <v-card-text class="white--text">
        {{errorText}}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="errorDialog = false"
        >OK</v-btn>
      </v-card-actions>
    </v-dialog>
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="this.sendMode == this.SEND_MODE.UPDATE"
      title="Add New Team">
      <team-form
        :send-mode='sendMode'
        :team='selectedTeam'
        />
    </popup-dialog>
    <v-text-field
      v-model="teamFilter"
      append-icon="search"
      clearable
      label="Filter"
      @click:clear="onFilterCleared"
      hint="Filter list of teams by name and/or contact"
      ></v-text-field>
    <v-list>
      <v-list-group
        :key="item.title"
        :value="item.active"
        v-for="item in listItems"
        no-action>

        <v-list-tile slot="item" no-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ item.data.name }}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon>keyboard_arrow_down</v-icon>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-if="item.data.contact" :key="item.data.name + 'contact'">
          <v-list-tile-content>
            <v-list-tile-title>{{item.data.contact}}</v-list-tile-title>
            <v-list-tile-sub-title>Contact</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-icon>face</v-icon>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-if="item.data.phone" :key="item.data.name + 'phone'">
          <v-list-tile-content>
            <v-list-tile-title>
              <a class="yellow--text" :href="`tel:${item.data.phone}`">{{item.data.phone}}</a>
            </v-list-tile-title>
            <v-list-tile-sub-title>Phone</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <a :href="`tel:${item.data.phone}`">
              <v-btn icon flat class="yellow--text"><v-icon>phone</v-icon></v-btn></a>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-if="item.data.email" :key="item.data.name + 'email'">
          <v-list-tile-content>
            <v-list-tile-title>
              <a class="yellow--text" :href="`mailto:${item.data.email}`">{{item.data.email}}</a>
            </v-list-tile-title>
            <v-list-tile-sub-title>e-mail</v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <a :href="`mailto:${item.data.email}`">
              <v-btn icon flat class="yellow--text"><v-icon>email</v-icon></v-btn></a>
          </v-list-tile-action>
        </v-list-tile>

        <v-list-tile v-if="hasRole('admin')" :key="item.data.name + 'info'" no-action>
          <v-list-tile-content>
            <v-list-tile-content>
              <v-btn :to="`/team/${item.data.name}`">Open Team Panel</v-btn>
            </v-list-tile-content>
          </v-list-tile-content>
        </v-list-tile>

      </v-list-group>
    </v-list>

    <v-list-tile v-if="hasRole('admin')"> <!-- TODO: should not use v-list-tile here -->
      <v-spacer />
      <v-list-tile-action>
        <v-btn @click="openCreateDialog">Add new Team</v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </center-col>
</template>

<script>
import model from '@/model'

export default {
  name: 'team_list',
  data () {
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
    onFilterCleared (e) {
      this.teamFilter = ''
    },
    onTeamSelected (team) {
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
    onDialogConfirmed () {
      const team = this.selectedTeam

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$remoteProxy.addTeam(team)
          .then(team => {
            this.$store.commit('addTeam', team)
          })
          .catch(error => {
            this.errorDialog = true
            this.errorText = error.response.data
            console.error(error)
          })
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        this.$remoteProxy.updateTeam(team.name, team)
          .catch(error => {
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
    closeAddBlock () {
      this.isAddBlockVisible = false
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    },
    onOpenEditDialog: function (team) {
      this.selectedTeam = team
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.UPDATE
    }
  },

  created () {
    this.$store.commit('changeTitle', 'Team List')
  },

  computed: {
    listItems () {
      let all = this.$store.state.teams
      let filtered = null
      if (!this.teamFilter || this.teamFilter.length < 3) {
        filtered = all
      } else {
        filtered = all.filter((item) => {
          let fltr = this.teamFilter.toLowerCase()
          let nameMatches = item.name.toLowerCase().includes(fltr)
          let contactMatches = item.contact.toLowerCase().includes(fltr)
          return nameMatches || contactMatches
        })
      }
      const output = []
      filtered.forEach((item) => {
        output.push({
          active: true,
          data: item
        })
      })
      return output
    },
    teams () {
      let all = this.$store.state.teams
      if (!this.teamFilter || this.teamFilter.length < 3) {
        return all
      }
      let filtered = all.filter((item) => {
        let fltr = this.teamFilter.toLowerCase()
        let nameMatches = item.name.toLowerCase().includes(fltr)
        let contactMatches = item.contact.toLowerCase().includes(fltr)
        return nameMatches || contactMatches
      })
      return filtered
    }
  }
}
</script>

<style scoped>

#TeamList {
  padding-bottom: 5em;
}

.slide-enter-active, .slide-leave-active {
  transition: all .3s
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
