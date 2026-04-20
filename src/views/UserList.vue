<template>
  <div id="UserList">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-toolbar flat color="transparent">
            <v-icon class="mr-2">mdi-account-multiple</v-icon>
            <v-toolbar-title>User Management</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-text-field
              v-model="userFilterText"
              append-inner-icon="mdi-magnify"
              label="Filter users"
              hide-details
              density="compact"
              style="max-width: 250px"
              class="mr-2"
            ></v-text-field>
            <v-btn
              v-if="hasRole(['admin'])"
              color="primary"
              @click="openCreateDialog"
            >
              <v-icon start>mdi-plus</v-icon>
              New User
            </v-btn>
          </v-toolbar>

          <v-alert v-if="errorMessage" type="error" class="mb-2">
            {{ errorMessage }}
          </v-alert>

          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :items-per-page="15"
            :loading="loading"
            class="elevation-0"
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar size="32" v-if="item.avatar_url">
                  <img :src="item.avatar_url" />
                </v-avatar>
                <v-avatar size="32" v-else>
                  <v-icon>mdi-face-man</v-icon>
                </v-avatar>
                {{ item.name }}
              </div>
            </template>
            <template v-slot:item.actions="{ item }">
              <RowActions>
                <template #pinned>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="openEditDialog(item.name)"
                    title="Edit user"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </RowActions>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create dialog -->
    <v-dialog v-model="showCreateDialog" max-width="400px">
      <v-card>
        <v-card-title>New User</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newUser.name"
            label="Username"
            @keyup.enter="onCreateConfirmed"
          />
          <v-text-field
            v-model="newUser.password"
            type="password"
            label="Password"
            @keyup.enter="onCreateConfirmed"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="onCreateConfirmed">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit user dialog (roles, stations) -->
    <v-dialog v-model="showEditDialog" max-width="500px">
      <UserBlock
        ref="userDialog"
        :name="editingUserName"
        @closeButtonClicked="showEditDialog = false"
        @deleted="onUserDeleted"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { Session } from '@/App.vue'
import { api } from '@/main'
import model from '@/model'
import type { User } from '@/remote/model/user'
import UserBlock from '@/components/UserBlock.vue'
import RowActions from '@/components/RowActions.vue'

export default defineComponent({
  name: 'UserList',
  components: { UserBlock, RowActions },
  inject: ['session'],

  data() {
    return {
      loading: false,
      users: [] as User[],
      userFilterText: '',
      errorMessage: '',
      showCreateDialog: false,
      showEditDialog: false,
      editingUserName: '',
      newUser: model.user.makeEmpty() as any,
      headers: [
        { title: 'Name', key: 'name', sortable: true },
        { title: 'Email', key: 'email', sortable: true },
        { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
      ]
    }
  },

  computed: {
    filteredUsers(): User[] {
      if (this.userFilterText.trim() === '') return this.users
      const fltr = this.userFilterText.trim().toLowerCase()
      return this.users.filter((u) => u.name.toLowerCase().includes(fltr))
    }
  },

  async mounted() {
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
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    openCreateDialog() {
      this.newUser = model.user.makeEmpty()
      this.showCreateDialog = true
    },
    openEditDialog(userName: string) {
      this.editingUserName = userName
      this.showEditDialog = true
      this.$nextTick(() => {
        // @ts-expect-error - ref typing
        this.$refs.userDialog?.refresh?.()
      })
    },
    onUserDeleted(userName: string) {
      this.users = this.users.filter((u) => u.name !== userName)
      this.showEditDialog = false
    },
    async onCreateConfirmed() {
      try {
        const created = await api.addUser(this.newUser)
        this.users.push(created)
      } catch (e) {
        console.error('Failed to add user', e)
      }
      this.newUser = model.user.makeEmpty()
      this.showCreateDialog = false
    }
  }
})
</script>
