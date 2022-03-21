<template>
  <v-container>
    <v-text-field
      type="text"
      v-model="station.name"
      label="Enter a new stationname"
    />
    <v-text-field
      name="order"
      type="number"
      v-model="station.order"
      hint="This field is used to sort stations"
      label="Station Ordering"
    />
    <v-checkbox
      name="is_start"
      label="Departure Station"
      v-model="station.is_start"
    />
    <v-checkbox
      name="is_end"
      label="Arrival Station"
      v-model="station.is_end"
    />
    <v-text-field name="phone" v-model="station.phone" label="Phone Number" />
    <v-text-field name="contact" v-model="station.contact" label="Contact" />
    <h3>Assigned Routes</h3>
    <v-checkbox
      v-for="route in routes"
      :key="route.name"
      :label="route.name"
      :value="route.name"
      v-model="assignedRoutes"
    />
  </v-container>
</template>

<script>
export default {
  name: "StationForm",
  props: {
    station: {
      type: Object,
    },
  },
  computed: {
    routes() {
      return this.$store.state.routes;
    },
    assignedRoutes: {
      get() {
        let output = [];
        for (const [routeName, stations] of Object.entries(
          this.$store.state.route_station_map
        )) {
          let match = stations.find((item) => item.name === this.station.name);
          if (match) {
            output.push(routeName);
          }
        }
        return output;
      },
      set(newValue) {
        this.$store.dispatch("setStationRoutesRemote", {
          stationName: this.station.name,
          routeNames: newValue,
        });
      },
    },
  },
};
</script>
