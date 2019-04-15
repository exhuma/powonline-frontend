<template>
  <v-checkbox @change="onValueChanged" v-model="checked" :label="label"></v-checkbox>
</template>

<script>
export default {
  name: 'user-role-checkbox',
  props: [
    'user',
    'role',
    'label'
  ],
  data () {
    return {
      checked: false
    }
  },
  methods: {
    onValueChanged (newValue) {
      if (newValue) {
        this.$remote.addUserRole(this.user, this.role)
      } else {
        this.$remote.removeUserRole(this.user, this.role)
      }
    }
  },
  created () {
    this.$remote.getUserRole(this.user, this.role)
      .then(data => {
        this.checked = data
      })
      .catch(e => {
        this.$store.commit('logError', e)
      })
  }
}
</script>
