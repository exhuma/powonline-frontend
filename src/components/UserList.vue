<template>
  <center-col id="UserList">

    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add new User">
      <v-text-field
        name="user-input"
        id="UserNameImput"
        @keyup.enter.native="onDialogConfirmed"
        type='text'
        v-model='selectedUser.name'
        label='Enter a new username' />
      <v-text-field
        name="password"
        @keyup.enter.native="onDialogConfirmed"
        type='password'
        v-model='selectedUser.password'
        label='Password' />
    </popup-dialog>

    <user-block
      v-for="user in users"
      :name="user.name"
      :key="user.name"></user-block>

    <div v-if="hasRole('admin')">
      <v-btn @click="openCreateDialog" v-if="hasRole('admin')">Add new User</v-btn>
    </div>

  </center-col>
</template>

<script>
import model from '@/model'

export default {
  name: 'user_list',
  methods: {

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
  created () {
    this.$store.commit('changeTitle', 'User List')
    this.$store.dispatch('refreshUsers')
  },
  data () {
    return {
      isAddBlockVisible: false,
      selectedUser: model.user.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE
    }
  },
  computed: {
    users () {
      return this.$store.state.users
    }
  }
}
</script>

<style scoped>
#UserList {
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
