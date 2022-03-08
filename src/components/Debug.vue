<template>
  <div>
    <h1>Debug</h1>
    <table width="100%" border="1">
      <tr>
        <th>Key</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Store Identity</td>
        <td>{{ storeIdentity || "N/A" }}</td>
      </tr>
      <tr>
        <td>Identity</td>
        <td>
          <pre>{{ identity || "N/A" }}</pre>
        </td>
      </tr>
      <tr>
        <td>Config</td>
        <td>
          <pre>{{ $config || "N/A" }}</pre>
        </td>
      </tr>
      <tr>
        <td>Token timestamps</td>
        <td>
          <table>
            <tr>
              <th>exp</th>
              <td>{{ this.tokenTimes.exp }}</td>
            </tr>
            <tr>
              <th>iat</th>
              <td>{{ this.tokenTimes.iat }}</td>
            </tr>
            <tr>
              <th>expires in</th>
              <td :class="this.tokenTimes.expiresIn <= 0 ? 'expired' : 'fresh'">
                {{ this.tokenTimes.expiresIn }}s
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
td.fresh {
  background: #afa;
}
td.expired {
  background: #f00;
}
</style>

<script>
import jwt_decode from "jwt-decode"; // eslint-disable-line camelcase

export default {
  name: "Debug",
  props: ["identity"],
  computed: {
    storeIdentity: function() {
      return this.$store.state.identity;
    },
    tokenTimes: function() {
      let data = jwt_decode(this.identity.token);
      let output = {
        exp: new Date(data.exp * 1000),
        iat: new Date(data.iat * 1000),
        expiresIn: Math.floor(data.exp - Date.now() / 1000)
      };
      return output;
    }
  }
};
</script>
