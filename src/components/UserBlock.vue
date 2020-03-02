<template>
  <v-card class="mt-3">
    <v-card-title><span>User: "{{ name }}"</span></v-card-title>
    <v-card-text>
      <h2>Roles</h2>
      <UserRoleCheckbox
        v-for="role in this.$store.state.roles"
        :key="role"
        :user="name"
        :label="role"
        :role="role"></UserRoleCheckbox>
      <h2>Stations</h2>
      <UserStationCheckbox
        v-for="station in this.$store.state.stations"
        :key="station"
        :user="name"
        :label="station"
        :station="station"></UserStationCheckbox>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions v-if="hasRole('admin')">
      <v-spacer />
      <ConfirmationDialog buttonText="Delete" :actionArgument="name" actionName="deleteUserRemote">
        <span slot="title">Do you want to delete the user "{{ name }}"?</span>
        <div slot="text">
          <p>this will delete the user with the name "{{ name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </ConfirmationDialog>
    </v-card-actions>
  </v-card>
</template>

<script>
import ConfirmationDialog from '@/components/ConfirmationDialog'
import UserRoleCheckbox from '@/components/UserRoleCheckbox'
import UserStationCheckbox from '@/components/UserStationCheckbox'
export default {
  name: 'UserBlock',
  methods: {
    hasRole (roleName) {
      return this.identity.hasRole(roleName)
    }
  },
  props: {
    'identity': {
      type: Object,
    },
    'name': {
      type: String,
      default: 'Unknown User'
    }
  },
  components: {
    ConfirmationDialog,
    UserRoleCheckbox,
    UserStationCheckbox,
  }
}
</script>
