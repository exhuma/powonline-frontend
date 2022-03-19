<template>
  <CenterCol id="RouteList">
    <v-dialog v-model="errorDialog">
      <v-card>
        <v-card-title>Error</v-card-title>
      </v-card>
      <v-card-text class="white--text">
        {{ errorText }}
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="errorDialog = false">OK</v-btn>
      </v-card-actions>
    </v-dialog>
    <PopupDialog
      @dialogConfirmed="onDialogConfirmed"
      @dialogDismissed="closeAddBlock"
      :dialogVisible="isAddBlockVisible"
      :editMode="this.sendMode == this.SEND_MODE.UPDATE"
      title="Add New Route"
    >
      <RouteForm :route="selectedRoute" />
    </PopupDialog>
    <v-list two-line>
      <RouteBlock
        v-for="route in routes"
        @openEditDialog="onOpenEditDialog(route)"
        :identity="identity"
        :route="route"
        :key="route.name"
      ></RouteBlock>
      <v-list-item>
        <v-spacer />
        <v-btn @click="openCreateDialog" v-if="identity.hasRole('admin')"
          >Add new Route</v-btn
        >
      </v-list-item>
    </v-list>
  </CenterCol>
</template>

<script>
const LOG = window.console.log;

import model from "@/model";
import CenterCol from "@/components/CenterCol";
import PopupDialog from "@/components/PopupDialog";
import RouteBlock from "@/components/RouteBlock";
import RouteForm from "@/components/RouteForm";

export default {
  name: "RouteList",
  props: {
    identity: {
      type: Object,
    },
  },
  methods: {
    onOpenEditDialog: function (route) {
      this.selectedRoute = route;
      this.isAddBlockVisible = true;
      this.sendMode = model.SEND_MODE.UPDATE;
    },
    onDialogConfirmed: function () {
      const route = this.selectedRoute;

      if (this.sendMode === model.SEND_MODE.CREATE) {
        this.$store.dispatch("addRouteRemote", route);
      } else if (this.sendMode === model.SEND_MODE.UPDATE) {
        route.contact = route.contact || "";
        route.phone = route.phone || "";
        this.$remoteProxy.updateRoute(route.name, route).catch((error) => {
          this.errorDialog = true;
          this.errorText = error.response.data;
        });
      } else {
        LOG.error("Invalid send mode: " + this.sendMode);
      }

      this.$emit("routeSaved", route);
      this.selectedRoute = model.route.makeEmpty();

      this.isAddBlockVisible = false;
    },
    closeAddBlock() {
      this.isAddBlockVisible = false;
    },
    openCreateDialog: function () {
      const newRoute = model.route.makeEmpty();

      this.selectedRoute = newRoute;
      this.isAddBlockVisible = true;
      this.sendMode = model.SEND_MODE.CREATE;
    },
  },
  created() {
    this.$store.commit("changeTitle", "Route List");
  },
  data() {
    return {
      isAddBlockVisible: false,
      selectedRoute: model.route.makeEmpty(),
      sendMode: model.SEND_MODE.CREATE,
      errorDialog: false,
      errorText: "",
      SEND_MODE: model.SEND_MODE,
    };
  },
  computed: {
    routes() {
      let copy = this.$store.state.routes.concat();
      copy.sort((a, b) => {
        return parseInt(a.order, 10) - parseInt(b.order, 10);
      });
      return copy;
    },
  },
  components: {
    CenterCol,
    PopupDialog,
    RouteBlock,
    RouteForm,
  },
};
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
