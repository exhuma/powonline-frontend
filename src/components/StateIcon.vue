<template>
  <v-icon>{{ stateIcon() }}</v-icon>
</template>

<script>
import util from '@/util';

export default {
  name: 'state-icon',
  props: ['state'],
  methods: {
    stateIcon () {
       return util.getStateIcon(this.state)
    }
  }
}
</script>
