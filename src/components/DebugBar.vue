<template>
  <v-system-bar color="orange">
    <v-icon>mdi-key</v-icon> Auth token expires in: {{ tokenExpires }}
  </v-system-bar>
</template>

<script>
import moment from "moment";

export default {
  name: "DebugBar",
  props: {
    identity: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      intervalId: null,
      tokenExpires: "unknown",
    };
  },
  created() {
    this.intervalId = setInterval(() => {
      this.refresh();
    }, 1000);
    this.refresh();
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  methods: {
    refresh() {
      let expiration = Math.floor(this.identity.exp - Date.now() / 1000);
      if (expiration <= 0) {
        this.tokenExpires = "expired!";
      } else {
        let duration = moment.duration(expiration, "seconds");
        this.tokenExpires = duration.humanize();
      }
    },
  },
};
</script>
