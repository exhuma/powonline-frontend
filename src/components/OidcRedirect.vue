<template>
  <div>Handling OIDC response...</div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as oidc from '@/auth/oidc'

async function handleRedirect() {
  // TODO remove duplication
  const as = await oidc.getAs()
  return oidc.handleRedirect(as)
}

const OidcRedirect = Vue.extend({
  name: 'oidc-redirect',
  created() {
    handleRedirect()
      .then((result) => {
        this.$emit('authenticated', result)
        this.$router.replace('/')
      })
      .catch((error: Error) => {
        if (error.name === 'OAuthError') {
          this.$emit('authentication-failure', error)
          this.$router.replace('/')
        } else {
          throw error
        }
      })
  }
})
export default OidcRedirect
</script>
