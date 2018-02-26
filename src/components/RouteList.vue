<template>
  <div id="RouteList">
    <popup-dialog
      @dialogConfirmed="addRoute"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Route">
      <v-text-field
        name="route-input"
        @keyup.enter.native="addRoute"
        type='text'
        v-model='routeName'
        label='Enter a new routename' />
    </popup-dialog>

    <!-- List all routes -->
    <route-block v-for="route in routes" :name="route.name" :key="route.name"></route-block>
  </div>
</template>

<script>
export default {
  name: 'route_list',
  methods: {
    addRoute: function (event) {
      this.$store.dispatch('addRouteRemote', {
        name: this.routeName,
        color: '#000000'
      })
      this.$store.commit('closeAddBlock', this.$route.path)
    },
    closeAddBlock () {
      this.$store.commit('closeAddBlock', this.$route.path)
    }
  },
  created () {
    this.$store.commit('changeTitle', 'Route List')
    this.$store.dispatch('refreshRemote')
  },
  data () {
    return {
      routeName: '',
      routeColor: '#000000'
    }
  },
  computed: {
    routes () {
      return this.$store.state.routes
    },
    isAddBlockVisible () {
      return this.$store.state.isAddBlockVisible[this.$route.path]
    }
  }
}
</script>

<style scoped>
#RouteList {
  padding-bottom: 5em;
}

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
