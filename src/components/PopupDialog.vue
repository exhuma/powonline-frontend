<template>
  <v-dialog
    v-model="dialogVisible"
    transition="dialog-bottom-transition"
    :overlay="false"
    scrollable
    fullscreen
    max-width="100em"
  >
    <v-card>
      <v-card-title color="primary">
        {{ title }}
      </v-card-title>
      <v-card-text>
        <slot>Dialog Content</slot>
      </v-card-text>
      <v-card-actions v-show="!customActionButtons">
        <v-spacer></v-spacer>
        <v-btn text @click="dismiss">Cancel</v-btn>
        <v-btn @click="confirm">{{ editMode === true ? 'Save' : 'Add' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'popup-dialog',
  props: ['title', 'dialogVisible', 'customActionButtons', 'editMode'],
  methods: {
    confirm: function (event) {
      this.$emit('dialogConfirmed')
    },
    dismiss() {
      this.$emit('dialogDismissed')
    }
  }
}
</script>

<style scoped>
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
