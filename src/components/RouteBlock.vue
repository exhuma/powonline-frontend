<template>
  <v-list-item>
    <v-dialog v-model="dialogVisible">
      <v-card>
        <v-app-bar flat>
          <v-toolbar-title>Assignments for "{{ route.name }}"</v-toolbar-title>
          <v-spacer />
          <v-btn @click="dismissDialog" icon><v-icon>close</v-icon></v-btn>
        </v-app-bar>
        <v-card-text>
          <route-assignments :route="route" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dismissDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-list-item-content class="pl-2" :style="'border-left: 3px solid ' + routeColor">
      <v-list-item-title>{{ route.name }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="hasRole('admin')">
      <swatches
        @input="setRouteColor"
        colors="text-advanced"
        v-model="route.color"
        popover-to="left"
        shapes="circles"
        swatch-size="30"/>
    </v-list-item-action>
    <v-list-item-action v-if="hasRole('admin')">
      <v-btn class="mr-2" icon @click="dialogVisible = true"><v-icon>extension</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action v-if="hasRole('admin')">
      <confirmation-dialog buttonText="Delete" :actionArgument="route.name" actionName="deleteRouteRemote">
        <span slot="title">Do you want to delete the route "{{ route.name }}"?</span>
        <div slot="text">
          <p>this will delete the route with the name "{{ route.name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-list-item-action>

  </v-list-item>
</template>

<script>
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'
export default {
  name: 'route-block',
  components: {Swatches},
  props: {
    'route': {
      type: Object,
      default: 'Unknown Route'
    }
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    routeColor () {
      if (this.route.color) {
        return this.route.color
      } else {
        return '#000000'
      }
    }
  },
  methods: {
    setRouteColor: function (newColor) {
      this.$remoteProxy.setRouteColor(this.route.name, newColor)
        .then(() => {
          console.log('Color changed') // XXX snack
        }).catch((e) => {
          console.lerror(e) // XXX snack
        })
    },
    dismissDialog: function () {
      this.dialogVisible = false
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  }
}
</script>
