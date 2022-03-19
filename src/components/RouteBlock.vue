<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>
        <div class="swatch" :style="dynamicColor">&nbsp;</div>
        {{ route.name }}
      </v-list-item-title>
    </v-list-item-content>
    <v-list-item-action v-if="identity.hasRole('admin')">
      <v-btn @click="openEditDialog" icon><v-icon>mdi-pencil</v-icon></v-btn>
    </v-list-item-action>
    <v-list-item-action class="ml-1" v-if="identity.hasRole('admin')">
      <ConfirmationDialog
        buttonText="Delete"
        :actionArgument="route.name"
        actionName="deleteRouteRemote"
        icon="mdi-delete-forever"
        iconColor="red"
      >
        <span slot="title"
          >Do you want to delete the route "{{ route.name }}"?</span
        >
        <div slot="text">
          <p>
            this will delete the route with the name "{{ route.name }}" and all
            related information!
          </p>
          <p>Are you sure?</p>
        </div>
      </ConfirmationDialog>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import ConfirmationDialog from "@/components/ConfirmationDialog";
import model from "@/model";
export default {
  name: "route-block",
  props: {
    route: {
      type: Object,
      default: function () {
        return model.route.makeEmpty();
      },
    },
    identity: {
      type: Object,
    },
  },
  computed: {
    dynamicColor() {
      return `background-color: ${this.route.color};`;
    },
  },
  methods: {
    openEditDialog() {
      this.$emit("openEditDialog");
    },
  },
  components: {
    ConfirmationDialog,
  },
};
</script>

<style scoped>
.swatch {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  margin-right: 1rem;
}
</style>
