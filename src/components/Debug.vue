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
        <td>{{ storeIdentity || 'N/A' }}</td>
      </tr>
      <tr>
        <td>Identity</td>
        <td>{{ identity || 'N/A'}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Debug',
  props: [
    "identity"
  ],
  computed: {
    storeIdentity: function () {
      return this.$store.state.identity
    }
  }
};
</script>
