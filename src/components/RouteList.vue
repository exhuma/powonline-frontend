<template>
  <div id="RouteList">
    <popup-dialog
      @dialogConfirmed="addRoute"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Route">
      <v-layout row class="text-xs-left">
        <v-flex xs12>
          <v-text-field
            name="route-input"
            @keyup.enter.native="addRoute"
            type='text'
            v-model='routeName'
            label='Enter a new routename' />
        </v-flex>
      </v-layout>
      <v-layout row class="text-xs-left">
        <v-flex xs3>Color</v-flex>
        <v-flex xs9>
          <swatches colors="material-dark" v-model="routeColor" />
        </v-flex>
      </v-layout>
    </popup-dialog>

    <!-- List all routes -->
    <route-block v-for="route in routes" :route="route" :key="route.name"></route-block>
  </div>
</template>

<script>
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
export default {
  name: 'route_list',
  components: {Swatches},
  methods: {
    addRoute: function (event) {
      this.$store.dispatch('addRouteRemote', {
        name: this.routeName,
        color: this.routeColor
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
