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
            label="Enter a new route name"
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

    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-list v-else two-line>
      <route-block
        v-for="route in sortedRoutes"
        :route="route"
        :key="route.name"
        @deleted="onRouteDeleted(route)"
      ></route-block>
    </v-list>

    <v-list-item v-if="hasRole(['admin'])">
      <v-spacer />
      <v-list-item-action>
        <v-btn @click="openCreateDialog">Add new Route</v-btn>
      </v-list-item-action>
    </v-list-item>
  </center-col>
</template>

<script lang="ts">
import Vue from 'vue'
import { api } from '@/main'
import model from '@/model'
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
import type { Route } from '@/remote/model/route'
import type { Session } from '@/App.vue'

const RouteList = Vue.extend({
  name: 'route_list',
  components: { Swatches },
  inject: ['getSelectedEventId', 'session'],

  data() {
    return {
      loading: false,
      routes: [] as Route[],
      isAddBlockVisible: false,
      selectedRoute: model.route.makeEmpty() as any,
      sendMode: model.SEND_MODE.CREATE,
      SEND_MODE: model.SEND_MODE
    }
  },

  computed: {
    sortedRoutes(): Route[] {
      return this.routes.slice().sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })
    }
  },

  async created() {
    await this.fetchRoutes()
  },

  methods: {
    hasRole(roleNames: string[]): boolean {
      // @ts-expect-error inject
      const session = this.session as Session
      return roleNames.some((r) => session.roles.includes(r))
    },
    async fetchRoutes() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      if (!eventId) return
      this.loading = true
      try {
        this.routes = await api.fetchRoutes(eventId)
      } catch (e) {
        console.error('Failed to fetch routes', e)
      } finally {
        this.loading = false
      }
    },
    openCreateDialog() {
      this.selectedRoute = model.route.makeEmpty()
      this.isAddBlockVisible = true
      this.sendMode = model.SEND_MODE.CREATE
    },
    closeAddBlock() {
      this.isAddBlockVisible = false
    },
    async onDialogConfirmed() {
      // @ts-expect-error inject
      const eventId = this.getSelectedEventId()
      const route = this.selectedRoute

      if (this.sendMode === model.SEND_MODE.CREATE) {
        try {
          const created = await api.addRoute(route, eventId)
          this.routes.push(created)
        } catch (e) {
          console.error('Failed to add route', e)
        }
      } else {
        console.warn('Updating routes is not implemented yet!')
      }

      this.selectedRoute = model.route.makeEmpty()
      this.isAddBlockVisible = false
    },
    onRouteDeleted(route: Route) {
      this.routes = this.routes.filter((r) => r.name !== route.name)
    }
  }
})
export default RouteList
</script>

<style scoped>
#RouteList {
  padding-bottom: 5em;
}
</style>
