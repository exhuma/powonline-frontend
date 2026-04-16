<template>
  <v-dialog v-model="isDialogVisible" hide-overlay max-width="40em">
    <template v-slot:activator="{ props }">
      <v-btn primary v-bind="props">{{ buttonText }}</v-btn>
    </template>
    <v-card>
      <v-card-title><slot name="title">Confirm Action</slot></v-card-title>
      <v-card-text><slot name="text">Are you sure?</slot></v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="discardAction">No</v-btn>
        <v-btn class="error" @click="acceptAction">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
const ConfirmationDialog = defineComponent({
  name: 'confirmation-dialog',
  data() {
    return {
      isDialogVisible: false
    }
  },
  props: ['actionArgument', 'buttonText'],
  methods: {
    discardAction() {
      this.isDialogVisible = false
    },
    acceptAction() {
      this.isDialogVisible = false
      this.$emit('confirmed', this.actionArgument)
      // kept for backward compat with any callers still listening for actionAccepted
      this.$emit('actionAccepted', this.actionArgument)
    }
  }
})
export default ConfirmationDialog
</script>
