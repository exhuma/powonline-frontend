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
      <user-block ref="userDialog" :name="selectedUserName"></user-block>
    </v-dialog>

    <v-alert :value="errorMessage !== ''" type="error">
      {{ errorMessage }}
    </v-alert>

    <v-list two-line>
      <template v-for="item in users">
        <v-list-tile
          :key="item.name"
          avatar
          @click="() => openUserDialog(item.name)"
        >
          <v-list-tile-avatar v-if="item.avatar_url">
            <img :src="item.avatar_url">
          </v-list-tile-avatar>
          <v-list-tile-avatar v-else>
            <v-icon>account_circle</v-icon>
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ item.name }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ item.email }}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>

    <div v-if="hasRole('admin')">
      <v-btn @click="openCreateDialog" v-if="hasRole('admin')"
        >Add new User</v-btn
      >
    </div>
  </center-col>
</template>

<script>
import model from '@/model'
import UserBlock from './UserBlock.vue'
import CenterCol from './CenterCol.vue'

export default {
  components: { UserBlock, CenterCol },
  name: 'user_list',
  methods: {
    openUserDialog: function (userName) {
      this.selectedUserName = userName
      this.isEditDialogVisible = true
      this.$nextTick(() => {
        this.$refs.userDialog.refresh()
      });
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

    closeAddBlock () {
      this.isAddBlockVisible = false
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },
  async created () {
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
  data () {
    return {
      errorMessage: '',
      isAddBlockVisible: false,
      selectedUserName: '',
      isEditDialogVisible: false,
      selectedUser: model.user.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      users: []
    }
  }
}
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
