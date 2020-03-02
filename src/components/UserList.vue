<template>
  <CenterCol id="UserList">

    <PopupDialog
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
    </PopupDialog>

    <UserBlock
      v-for="user in users"
      :identity="identity"
      :name="user.name"
      :key="user.name"></UserBlock>

    <div v-if="hasRole('admin')">
      <v-btn @click="openCreateDialog" v-if="hasRole('admin')">Add new User</v-btn>
    </div>

  </CenterCol>
</template>

<script>

import UserBlock from '@/components/UserBlock'
import PopupDialog from '@/components/PopupDialog'
import CenterCol from '@/components/CenterCol'
import model from '@/model'

const LOG = window.console
export default {
  name: 'user_list',
  props: [
    'identity'
  ],
  methods: {
    onDialogConfirmed: function () {
      const user = this.selectedUser

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch('addUserRemote', user)
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        LOG.warn('Updating users is not implemented yet!')
      } else {
        LOG.error('Invalid send mode: ' + this.sendMode)
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
      return this.identity.hasRole(roleName)
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
      return this.$store.state.users // XXX TODO
    }
  },
  components: {
    CenterCol,
    UserBlock,
    PopupDialog,
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
