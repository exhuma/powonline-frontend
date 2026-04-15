<template>
  <v-container class="text-center mt-12">
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      size="64"
    />
    <div v-if="error" class="red--text mt-4">{{ error }}</div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

/**
 * Handles the redirect back from the backend after a successful OAuth2 social
 * login.  The backend already set the auth cookies before redirecting here.
 *
 * All this component needs to do is:
 *  1. Call checkSession to populate the Vuex store from /auth/me
 *  2. Redirect to the home page
 */
export default Vue.extend({
  name: 'AuthCallback',
  data() {
    return {
      loading: true,
      error: ''
    }
  },
  async created() {
    try {
      await this.$store.dispatch('checkSession')
    } catch (e) {
      this.error = 'Login failed — could not verify session.'
    } finally {
      this.loading = false
    }
    this.$router.push('/')
  }
})
</script>
