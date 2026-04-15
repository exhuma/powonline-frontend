<template>
  <div>
    <v-list-item :class="{ 'route-block--expanded': expanded }">
      <!-- Colour bar on the left -->
      <v-list-item-content
        class="pl-2 py-2"
        :style="'border-left: 3px solid ' + routeColor"
      >
        <v-list-item-title class="font-weight-medium">
          {{ route.name }}
        </v-list-item-title>
      </v-list-item-content>

      <!-- Color picker (admin only) -->
      <v-list-item-action v-if="hasRole('admin')">
        <swatches
          @input="setRouteColor"
          colors="text-advanced"
          v-model="route.color"
          popover-to="left"
          shapes="circles"
          swatch-size="30"
        />
      </v-list-item-action>

      <!-- Expand / collapse toggle (admin only) -->
      <v-list-item-action v-if="hasRole('admin')">
        <v-btn
          icon
          :title="expanded ? 'Collapse assignments' : 'Manage assignments'"
          @click="expanded = !expanded"
        >
          <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-puzzle' }}</v-icon>
        </v-btn>
      </v-list-item-action>

      <!-- Delete (admin only) -->
      <v-list-item-action v-if="hasRole('admin')">
        <confirmation-dialog
          buttonText="Delete"
          :actionArgument="route.name"
          @confirmed="deleteRoute"
        >
          <span slot="title"
            >Do you want to delete the route "{{ route.name }}"?</span
          >
          <div slot="text">
            <p>
              This will delete the route with the name "{{ route.name }}" and
              all related information!
            </p>
            <p>Are you sure?</p>
          </div>
        </confirmation-dialog>
      </v-list-item-action>
    </v-list-item>

    <!-- Inline assignment panel -->
    <v-expand-transition>
      <div v-show="expanded" class="route-assignments-panel">
        <v-card
          flat
          outlined
          class="mx-3 mb-3"
          :style="'border-left: 3px solid ' + routeColor"
        >
          <v-card-text class="py-3 px-4">
            <route-assignments :route="route" />
          </v-card-text>
        </v-card>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
import RouteAssignments from '@/components/forms/RouteAssignments.vue'
import Vue from 'vue'
import { api } from '@/main'
import type { Session } from '@/App.vue'

const RouteBlock = Vue.extend({
  name: 'route-block',
  components: { Swatches, RouteAssignments },
  inject: ['session', 'getSelectedEventId'],
  props: {
    route: {
      type: Object,
      default: 'Unknown Route'
    }
  },
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    routeColor(): string {
      return this.route.color || '#000000'
    }
  },
  methods: {
    async setRouteColor(newColor: string) {
      // @ts-expect-error inject
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        await api.setRouteColor(this.route.name, newColor, eventId)
      } catch (e) {
        console.error('Failed to set route color', e)
      }
    },
    async deleteRoute(routeName: string) {
      // @ts-expect-error inject
      const eventId = (this.getSelectedEventId as () => number | null)()
      if (!eventId) return
      try {
        await api.deleteRoute(routeName, eventId)
        this.$emit('deleted', routeName)
      } catch (e) {
        console.error('Failed to delete route', e)
      }
    },
    hasRole(roleName: string): boolean {
      // @ts-expect-error inject
      const session = this.session as Session
      return session.roles.includes(roleName)
    }
  }
})
export default RouteBlock
</script>

<style scoped>
.route-block--expanded {
  background-color: rgba(0, 0, 0, 0.02);
}

.route-assignments-panel {
  background-color: rgba(0, 0, 0, 0.015);
}
</style>
