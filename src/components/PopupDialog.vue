<template>
  <transition name="slide">
    <v-card v-show="dialogVisible" class="mb-3">
      <v-card-title>
        <span>{{ title }}</span>
        <v-spacer></v-spacer>
        <v-btn @click="dismiss" icon><v-icon>close</v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <slot>Dialog Content</slot>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn @click="confirm">Add</v-btn>
      </v-card-actions>
    </v-card>
  </transition>
</template>

<script>
export default {
  name: 'popup-dialog',
  props: ['title', 'dialogVisible'],
  methods: {
    confirm: function (event) {
      this.$emit('dialogConfirmed')
    },
    dismiss () {
      this.$emit('dialogDismissed')
    }
  }
}
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
