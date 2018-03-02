<template>
  <v-list-tile>
    <v-dialog v-model="dialogVisible">
      <v-card>
        <v-toolbar card>
          <v-toolbar-title>Assignments for "{{ route.name }}"</v-toolbar-title>
          <v-spacer />
          <v-btn @click="dismissDialog" icon><v-icon>close</v-icon></v-btn>
        </v-toolbar>
        <v-card-text>
          <route-assignments :route="route" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dismissDialog">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-list-tile-content class="pl-2" :style="'border-left: 3px solid ' + routeColor">
      <v-list-tile-title>{{ route.name }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action v-if="hasRole('admin')">
      <v-btn class="mr-2" icon @click="dialogVisible = true"><v-icon>extension</v-icon></v-btn>
    </v-list-tile-action>
    <v-list-tile-action v-if="hasRole('admin')">
      <confirmation-dialog buttonText="Delete" :actionArgument="route.name" actionName="deleteRouteRemote">
        <span slot="title">Do you want to delete the route "{{ route.name }}"?</span>
        <div slot="text">
          <p>this will delete the route with the name "{{ route.name }}" and all
            related information!</p>
          <p>Are you sure?</p>
        </div>
      </confirmation-dialog>
    </v-list-tile-action>

  </v-list-tile>
</template>

<script>
export default {
  name: 'route-block',
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
    dismissDialog: function () {
      this.dialogVisible = false
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  }
}
</script>
