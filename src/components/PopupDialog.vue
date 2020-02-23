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
      <v-toolbar card>
        <v-toolbar-title>{{title}}</v-toolbar-title>
        <v-spacer />
        <v-btn @click="dismiss" icon><v-icon>close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text>
        <slot>Dialog Content</slot>
      </v-card-text>
      <v-card-actions v-show="!customActionButtons">
        <v-spacer></v-spacer>
        <v-btn flat @click="dismiss">Cancel</v-btn>
        <v-btn @click="confirm">{{(editMode === true ? 'Save' : 'Add')}}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'PopupDialog',
  props: [
    'title',
    'dialogVisible',
    'customActionButtons',
    'editMode'
  ],
  methods: {
    confirm: function () {
      this.$emit('dialogConfirmed')
    },
    dismiss () {
      this.$emit('dialogDismissed')
    }
  }
};
</script>

<style scoped>
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
