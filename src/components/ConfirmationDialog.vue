<template>
  <v-dialog v-model="isDialogVisible" hide-overlay max-width="40em">
    <template v-slot:activator="{ on }">
      <v-btn v-if="icon !== ''" icon primary v-on="on" :color="iconColor"
        ><v-icon>{{ icon }}</v-icon></v-btn
      >
      <v-btn v-if="icon === ''" primary v-on="on">{{ buttonText }}</v-btn>
    </template>
    <v-card>
      <v-card-title><slot name="title">Confirm Action</slot></v-card-title>
      <v-card-text><slot name="text">Are you sure?</slot></v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click.native="discardAction">No</v-btn>
        <v-btn class="error" @click.native="acceptAction">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConfirmationDialog",
  data() {
    return {
      isDialogVisible: false
    };
  },
  props: {
    actionArgument: { required: true },
    actionName: { required: true },
    buttonText: { required: false, default: "buttonText" },
    icon: { required: false, default: "" },
    iconColor: { required: false, default: "" }
  },
  methods: {
    discardAction() {
      this.isDialogVisible = false;
    },
    acceptAction() {
      this.$store.dispatch(this.actionName, this.actionArgument);
      this.isDialogVisible = false;
    }
  }
};
</script>
