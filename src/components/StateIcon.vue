<template>
  <v-icon :color="adaptiveColor">{{ stateIcon() }}</v-icon>
</template>

<script>
import util from '@/util';

export default {
  name: 'state-icon',
  props: ['state'],
  computed: {
    adaptiveColor() {
      switch (this.state) {
        case 'arrived':
          return 'yellow'
        case 'finished':
          return 'green'
        default:
          return 'white'
      }

    }
  },
  methods: {
    stateIcon () {
       return util.getStateIcon(this.state)
    }
  }
}
</script>
