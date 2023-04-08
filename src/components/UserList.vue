<template>
  <div>
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

    <v-data-table
      :headers="headers"
      :items="users"
      :pagination.sync="pagination"
      :loading="loading"
      item-key="name"
      class="elevation-1"
    >
      <template v-slot:items="props">
        <td class="text-xs-left"><a @click="() => openUserDialog(props.item.name)">{{ props.item.name }}</a></td>
        <td class="text-xs-left">{{ props.item.email }}</td>
        <td class="text-xs-left">{{ props.item.active }}</td>
        <td class="text-xs-left">{{ props.item.inserted }}</td>
        <td class="text-xs-left">{{ props.item.confirmed_at }}</td>
        <td class="text-xs-left">{{ props.item.updated }}</td>
      </template>
    </v-data-table>

    <div v-if="hasRole('admin')">
      <v-btn @click="openCreateDialog" v-if="hasRole('admin')"
        >Add new User</v-btn
      >
    </div>
  </div>
</template>

<script>
import model from '@/model'
import UserBlock from './UserBlock.vue'

export default {
  components: { UserBlock },
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
    this.loading = true
    let users = await this.$remoteProxy.fetchUsers()
    this.users = users
    this.loading = false
  },
  data () {
    return {
      isAddBlockVisible: false,
      selectedUserName: '',
      isEditDialogVisible: false,
      selectedUser: model.user.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      users: [],
      loading: false,
      pagination: {
        rowsPerPage: 12
      },
      headers: [
        {
          text: 'Name',
          align: 'start',
          sortable: true,
          value: 'name'
        },
        {
          text: 'e-mail',
          align: 'start',
          sortable: true,
          value: 'email'
        },
        {
          text: 'Is Active',
          align: 'start',
          sortable: true,
          value: 'active'
        },
        {
          text: 'Created at',
          align: 'start',
          sortable: true,
          value: 'inserted'
        },
        {
          text: 'Confirmed at',
          align: 'start',
          sortable: true,
          value: 'confirmed_at'
        },
        {
          text: 'Last Modified',
          align: 'start',
          sortable: true,
          value: 'updated'
        }
      ]
    }
  }
}
</script>

<style scoped>
#UserList {
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
