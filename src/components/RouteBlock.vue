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
          actionName="deleteRouteRemote"
        >
          <span slot="title">Do you want to delete the route "{{ route.name }}"?</span>
          <div slot="text">
            <p>
              This will delete the route with the name "{{ route.name }}" and all
              related information!
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

const RouteBlock = Vue.extend({
  name: 'route-block',
  components: { Swatches, RouteAssignments },
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
    setRouteColor(newColor: string) {
      this.$remoteProxy
        .setRouteColor(this.route.name, newColor)
        .then(() => {
          console.log('Color changed') // XXX snack
        })
        .catch((e: unknown) => {
          console.error(e) // XXX snack
        })
    },
    hasRole(roleName: string): boolean {
      return this.$store.getters.hasRole(roleName)
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
