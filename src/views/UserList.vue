<template>
  <center-col>
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add new User"
    >
      <v-text-field
        name="user-input"
        id="UserNameInput"
        @keyup.enter.native="onDialogConfirmed"
        type="text"
        v-model="selectedUser.name"
        label="Enter a new username"
      />
      <v-text-field
        name="password"
        @keyup.enter.native="onDialogConfirmed"
        type="password"
        v-model="selectedUser.password"
        label="Password"
      />
    </popup-dialog>

    <v-dialog max-width="500px" v-model="isEditDialogVisible">
      <user-block
        ref="userDialog"
        :name="selectedUserName"
        @closeButtonClicked="closeUserDialog"
      ></user-block>
    </v-dialog>

    <v-alert :value="errorMessage !== ''" type="error">
      {{ errorMessage }}
    </v-alert>

    <v-text-field
      label="Filter"
      v-model="userFilterText"
      append-icon="mdi-magnify"
      hint="Filter list of users by name"
    ></v-text-field>

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-list v-else two-line>
      <template v-for="item in filteredUsers">
        <v-list-item :key="item.name" @click="openUserDialog(item.name)">
          <v-list-item-avatar v-if="item.avatar_url">
            <img :src="item.avatar_url" />
          </v-list-item-avatar>
          <v-list-item-avatar v-else>
            <v-icon>mdi-face-man</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.email }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>

    <v-list-item v-if="hasRole(['admin'])">
      <v-spacer />
      <v-list-item-action>
        <v-btn @click="openCreateDialog">Add new User</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import model from '@/model'
import UserBlock from '@/components/UserBlock.vue'
import type { User } from '@/remote/model/user'
import type { Session } from '@/App.vue'

const UserList = Vue.extend({
  name: 'user_list',
  components: { UserBlock },
  inject: ['session'],

  data() {
    return {
      loading: false,
      users: [] as User[],
      userFilterText: '',
      errorMessage: '',
      isAddBlockVisible: false,
      selectedUserName: '',
      isEditDialogVisible: false,
      selectedUser: model.user.makeEmpty() as any,
      sendMode: model.SEND_MODE.CREATE,
      SEND_MODE: model.SEND_MODE
    }
  },

  computed: {
    filteredUsers(): User[] {
      if (this.userFilterText.trim() === '') return this.users
      const fltr = this.userFilterText.trim().toLowerCase()
      return this.users.filter((u) => u.name.toLowerCase().includes(fltr))
    }
  },

  async created() {
    this.loading = true
    try {
      this.users = await api.fetchUsers()
      this.errorMessage = ''
    } catch {
      this.errorMessage = 'Unable to fetch users (are you logged in?)'
    } finally {
      this.loading = false
    }
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      // @ts-expect-error inject
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    closeUserDialog() {
      this.selectedUserName = ''
      this.isEditDialogVisible = false
    },
    openUserDialog(userName: string) {
      this.selectedUserName = userName
      this.isEditDialogVisible = true
      this.$nextTick(() => {
        // @ts-expect-error - ref typing
        this.$refs.userDialog?.refresh?.()
      })
    },
    openCreateDialog() {
      this.selectedUser = model.user.makeEmpty()
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    async onDialogConfirmed() {
      const user = this.selectedUser

      if (this.sendMode === model.SEND_MODE.CREATE) {
        try {
          const created = await api.addUser(user)
          this.users.push(created)
        } catch (e) {
          console.error('Failed to add user', e)
        }
      } else {
        console.warn('Updating users is not implemented yet!')
      }

      this.selectedUser = model.user.makeEmpty()
      this.isAddBlockVisible = false
    }
  }
})
export default UserList
</script>

<style scoped>
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
