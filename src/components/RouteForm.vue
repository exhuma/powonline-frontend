<template>
  <v-container>
    <v-text-field
      name="name"
      type="text"
      v-model="route.name"
      label="Enter a new route name"
    />
    <v-color-picker
      name="color"
      type="text"
      v-model="route.color"
      hint="Color to use for this route"
      label="Route color"
    />
  </v-container>
</template>

<script>
export default {
  name: "RouteForm",
  props: {
    route: {
      type: Object,
    },
  },
};
</script>
