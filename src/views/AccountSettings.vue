<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-4">
          <v-card-title>Account Settings</v-card-title>
          <v-card-text>
            <p>
              Logged in as
              <strong class="text-accent">{{ session.userName }}</strong>
            </p>
          </v-card-text>
        </v-card>

        <!-- Danger zone -->
        <v-card class="mt-6 border border-error" color="error-lighten-5">
          <v-card-title class="text-error">Danger Zone</v-card-title>
          <v-card-text>
            <p>
              Permanently delete your account and all associated personal data.
              This action <strong>cannot be undone</strong>. Teams you own will
              be transferred to a system placeholder so that event history is
              preserved.
            </p>

            <v-text-field
              v-model="confirmText"
              :label="'Type your username to confirm: ' + session.userName"
              :placeholder="session.userName"
              variant="outlined"
              class="mt-4"
              :error-messages="confirmError"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="error"
              variant="elevated"
              :disabled="confirmText !== session.userName || deleting"
              :loading="deleting"
              @click="deleteAccount"
            >
              Delete My Account
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Result snackbar -->
    <v-snackbar v-model="snackVisible" :color="snackColor" timeout="5000">
      {{ snackMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiClient } from '@/api/index'

export default defineComponent({
  name: 'AccountSettings',
  inject: ['api', 'session'],
  setup() {
    const api = inject<ApiClient>('api')!
    const session = inject<{ userName: string; roles: string[] }>('session')!
    const router = useRouter()

    const confirmText = ref('')
    const confirmError = ref<string[]>([])
    const deleting = ref(false)
    const snackVisible = ref(false)
    const snackMessage = ref('')
    const snackColor = ref<'success' | 'error'>('error')

    async function deleteAccount() {
      if (confirmText.value !== session.userName) {
        confirmError.value = ['Username does not match.']
        return
      }
      confirmError.value = []
      deleting.value = true
      try {
        await api.deleteMyAccount()
        // Clear session state — the logout endpoint clears server-side cookies
        try {
          await api.logout()
        } catch {
          // ignore — cookies may already be cleared
        }
        session.userName = ''
        session.roles = []
        snackColor.value = 'success'
        snackMessage.value = 'Your account has been deleted.'
        snackVisible.value = true
        setTimeout(() => router.push('/'), 2000)
      } catch (err: any) {
        snackColor.value = 'error'
        snackMessage.value =
          err?.message ?? 'Failed to delete account. Please try again.'
        snackVisible.value = true
      } finally {
        deleting.value = false
      }
    }

    return {
      session,
      confirmText,
      confirmError,
      deleting,
      snackVisible,
      snackMessage,
      snackColor,
      deleteAccount
    }
  }
})
</script>
