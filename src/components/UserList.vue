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
        id="UserNameImput"
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
      hint="Filter list of teams by name and/or contact"
    ></v-text-field>
    <v-list two-line>
      <template v-for="item in filteredUsers">
        <v-list-item :key="item.name" @click="() => openUserDialog(item.name)">
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
      <!-- TODO: should not use v-list-item here -->
      <v-spacer />
      <v-list-item-action>
        <v-btn @click="openCreateDialog">Add new User</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import model from '@/model'
import UserBlock from './UserBlock.vue'
import CenterCol from './CenterCol.vue'

import Vue from 'vue'
const UserList = Vue.extend({
  components: { UserBlock, CenterCol },
  name: 'user_list',
  computed: {
    filteredUsers: function () {
      if (this.userFilterText.trim() === '') {
        return this.users
      }
      return this.users.filter(
        (item) =>
          item.name
            .toLowerCase()
            .search(this.userFilterText.trim().toLowerCase()) >= 0
      )
    }
  },
  methods: {
    closeUserDialog: function () {
      this.selectedUserName = ''
      this.isEditDialogVisible = false
    },
    openUserDialog: function (userName) {
      this.selectedUserName = userName
      this.isEditDialogVisible = true
      this.$nextTick(() => {
        this.$refs.userDialog.refresh()
      })
    },
    onDialogConfirmed: function (event) {
      const user = this.selectedUser

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch('addUserRemote', user)
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        console.warn('Updating users is not implemented yet!')
      } else {
        console.error('Invalid send mode: ' + this.sendMode)
      }

      this.$emit('userSaved', user)
      this.selectedUser = model.user.makeEmpty()

      this.isAddBlockVisible = false
    },

    openCreateDialog: function () {
      const newUser = model.user.makeEmpty()

      this.selectedUser = newUser
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },

    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    hasRole(roleName) {
      return this.$store.getters.hasRole(roleName)
    }
  },
  async created() {
    this.$store.commit('changeTitle', 'User List')
    let users = []
    try {
      users = await this.$remoteProxy.fetchUsers()
      this.errorMessage = ''
    } catch (error) {
      this.errorMessage = 'Unable to fetch users (are you logged in?)'
    }
    this.users = users
  },
  data() {
    return {
      userFilterText: '',
      errorMessage: '',
      isAddBlockVisible: false,
      selectedUserName: '',
      isEditDialogVisible: false,
      selectedUser: model.user.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      users: []
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
