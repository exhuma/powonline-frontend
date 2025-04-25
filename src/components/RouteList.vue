<template>
  <center-col id="RouteList">
    <popup-dialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      title="Add New Route"
    >
      <v-layout row class="text-xs-left">
        <v-flex xs12>
          <v-text-field
            name="route-input"
            @keyup.enter.native="onDialogConfirmed"
            type="text"
            v-model="selectedRoute.name"
            label="Enter a new routename"
          />
        </v-flex>
      </v-layout>
      <v-layout row class="text-xs-left" style="min-height: 30em">
        <v-flex xs3>Color</v-flex>
        <v-flex xs9>
          <swatches
            colors="text-advanced"
            v-model="selectedRoute.color"
            shapes="circles"
            swatch-size="30"
          />
        </v-flex>
      </v-layout>
    </popup-dialog>

    <!-- List all routes -->
    <v-list two-line>
      <route-block
        v-for="route in routes"
        :route="route"
        :key="route.name"
      ></route-block>
    </v-list>

    <v-list-item v-if="hasRole(['admin'])">
      <!-- TODO: should not use v-list-item here -->
      <v-spacer />
      <v-list-item-action>
        <v-btn @click="openCreateDialog">Add new Route</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
import model from '@/model'
import Vue from 'vue'
const RouteList = Vue.extend({
  name: 'route_list',
  components: { Swatches },
  methods: {
    onDialogConfirmed: function (event) {
      const route = this.selectedRoute

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch('addRouteRemote', route)
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        console.warn('Updating routes is not implemented yet!')
      } else {
        console.error('Invalid send mode: ' + this.sendMode)
      }

      this.$emit('routeSaved', route)
      this.selectedRoute = model.route.makeEmpty()

      this.isAddBlockVisible = false
    },
    openCreateDialog: function () {
      const newRoute = model.route.makeEmpty()

      this.selectedRoute = newRoute
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    hasRole(roleName) {
      return this.$store.getters.hasRole(roleName)
    }
  },
  created() {
    this.$store.commit('changeTitle', 'Route List')
    this.$store.dispatch('refreshRemote')
  },
  data() {
    return {
      isAddBlockVisible: false,
      selectedRoute: model.route.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE
    }
  },
  computed: {
    routes() {
      const output = this.$store.state.routes.concat()
      output.sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
      return this.$store.state.routes
    }
  }
})
export default RouteList
</script>

<style scoped>
#RouteList {
  padding-bottom: 5em;
}

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
