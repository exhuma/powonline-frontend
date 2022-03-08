<template>
  <CenterCol id="UserList">
    <v-container>
      <v-data-table
        :headers="headers"
        :items="users"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Users</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-btn
              @click="openCreateDialog"
              color="primary"
              icon
              v-if="hasRole('admin')"
            >
              <v-icon>mdi-account-plus</v-icon>
            </v-btn>
            <v-btn
              @click="refresh"
              color="primary"
              icon
              v-if="hasRole('admin')"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>

            <PopupDialog
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
            </PopupDialog>
          </v-toolbar>
        </template>
        <template v-slot:item.action="{ item }">
          <ConfirmationDialog
            buttonText="Delete"
            :actionArgument="item.name"
            actionName="deleteUserRemote"
          >
            <span slot="title"
              >Do you want to delete the user "{{ item.name }}"?</span
            >
            <div slot="text">
              <p>
                this will delete the user with the name "{{ item.name }}" and
                all related information!
              </p>
              <p>Are you sure?</p>
            </div>
          </ConfirmationDialog>
        </template>
      </v-data-table>
    </v-container>
  </CenterCol>
</template>

<script>
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PopupDialog from "@/components/PopupDialog";
import CenterCol from "@/components/CenterCol";
import model from "@/model";

const LOG = window.console;
export default {
  name: "user_list",
  props: ["identity"],
  methods: {
    refresh: function() {
      this.$store.dispatch("refreshUsers");
    },
    onDialogConfirmed: function() {
      const user = this.selectedUser;

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch("addUserRemote", user);
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        LOG.warn("Updating users is not implemented yet!");
      } else {
        LOG.error("Invalid send mode: " + this.sendMode);
      }

      this.$emit("userSaved", user);
      this.selectedUser = model.user.makeEmpty();

      this.isAddBlockVisible = false;
    },

    openCreateDialog: function() {
      const newUser = model.user.makeEmpty();

      this.selectedUser = newUser;
      this.isAddBlockVisible = true;
      this.sendMode = model.SEND_MODE.CREATE;
    },

    closeAddBlock() {
      this.isAddBlockVisible = false;
    },
    hasRole(roleName) {
      return this.identity.hasRole(roleName);
    }
  },
  created() {
    this.$store.commit("changeTitle", "User List");
    this.$store.dispatch("refreshUsers");
  },
  data() {
    return {
      isAddBlockVisible: false,
      selectedUser: model.user.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      headers: [
        {
          text: "Login",
          align: "start",
          value: "name"
        },
        {
          text: "Actions",
          value: "action",
          align: "end",
          sortable: false
        }
      ]
    };
  },
  computed: {
    users() {
      return this.$store.state.users;
    }
  },
  components: {
    CenterCol,
    ConfirmationDialog,
    PopupDialog
  }
};
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
