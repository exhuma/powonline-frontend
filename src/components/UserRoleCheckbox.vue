<template>
  <v-checkbox
    @change="onValueChanged"
    v-model="checked"
    :label="label"
  ></v-checkbox>
</template>

<script>
import EventBus from "@/eventBus";

export default {
  name: "user-role-checkbox",
  props: ["user", "role", "label"],
  data() {
    return {
      checked: false
    };
  },
  methods: {
    onValueChanged(newValue) {
      if (newValue) {
        this.$remoteProxy
          .addUserRole(this.user, this.role)
          .then(() => {
            this.checked = true;
          })
          .catch(error => {
            EventBus.$emit("snackRequested", {
              text: `Unable to change user role (${error})`,
              color: "error",
              error: error
            });
            this.checked = false;
          });
      } else {
        this.$remoteProxy
          .removeUserRole(this.user, this.role)
          .then(() => {
            this.checked = false;
          })
          .catch(error => {
            EventBus.$emit("snackRequested", {
              text: `Unable to change user role (${error})`,
              color: "error",
              error: error
            });
            this.checked = true;
          });
      }
    }
  },
  created() {
    this.$remoteProxy
      .getUserRole(this.user, this.role)
      .then(data => {
        this.checked = data;
      })
      .catch(e => {
        EventBus.$emit("snackRequested", {
          text: `Unable to fetch user-roles (${e})`,
          color: "error",
          error: e
        });
      });
  }
};
</script>
