<template>
  <v-dialog v-model="dialog" max-width="640px">
    <v-card>
      <v-card-title class="primary white--text">
        <v-icon dark class="mr-2">mdi-account-multiple</v-icon>
        Manage Event Members
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- Add member row -->
        <v-row align="center">
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="selectedUser"
              :items="availableUsers"
              item-text="name"
              item-value="name"
              label="Select user to add"
              outlined
              dense
              hide-details
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedRole"
              :items="availableRoles"
              label="Role"
              outlined
              dense
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn
              color="primary"
              :disabled="!selectedUser"
              @click="addMember"
              block
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <div v-if="loading" class="text-center py-4">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>

        <div
          v-else-if="members.length === 0"
          class="text-center py-4 grey--text"
        >
          No members assigned yet.
        </div>

        <v-list v-else dense>
          <v-list-item
            v-for="member in members"
            :key="`${member.user_name}-${member.role_name}`"
          >
            <v-list-item-avatar color="primary" size="32">
              <v-icon dark small>mdi-account</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ member.user_name }}</v-list-item-title>
              <v-list-item-subtitle>{{
                member.role_name
              }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon small color="red" @click="removeMember(member)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import type { EventMember } from '@/api'
import type { User } from '@/remote/model/user'

export default Vue.extend({
  name: 'EventMemberManager',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    eventId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      members: [] as EventMember[],
      availableUsers: [] as User[],
      selectedUser: null as string | null,
      selectedRole: 'event_co_admin' as string,
      availableRoles: [
        { text: 'Co-Admin', value: 'event_co_admin' },
        { text: 'Owner', value: 'event_owner' }
      ],
      loading: false
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val: boolean) {
        this.dialog = val
        if (val) {
          this.loadMembers()
          if (this.availableUsers.length === 0) {
            this.loadUsers()
          }
        }
      }
    },
    dialog(val: boolean) {
      if (!val) {
        this.$emit('close')
      }
    }
  },
  methods: {
    async loadUsers() {
      try {
        this.availableUsers = await api.fetchUsers()
      } catch (e) {
        console.error('Failed to fetch users', e)
      }
    },
    async loadMembers() {
      this.loading = true
      try {
        this.members = await api.fetchEventMembers(this.eventId)
      } catch (e) {
        console.error('Failed to fetch event members', e)
      } finally {
        this.loading = false
      }
    },
    async addMember() {
      if (!this.selectedUser) return
      const member: EventMember = {
        user_name: this.selectedUser,
        role_name: this.selectedRole
      }
      try {
        const added = await api.addEventMember(this.eventId, member)
        this.members.push(added)
        this.selectedUser = null
      } catch (e) {
        console.error('Failed to add member', e)
      }
    },
    async removeMember(member: EventMember) {
      try {
        await api.removeEventMember(
          this.eventId,
          member.user_name,
          member.role_name
        )
        const idx = this.members.findIndex(
          (m) =>
            m.user_name === member.user_name && m.role_name === member.role_name
        )
        if (idx > -1) {
          this.members.splice(idx, 1)
        }
      } catch (e) {
        console.error('Failed to remove member', e)
      }
    },
    closeDialog() {
      this.dialog = false
    }
  }
})
</script>
