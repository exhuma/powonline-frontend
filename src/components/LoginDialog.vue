<template>
  <v-dialog max-width="500px" v-model="isVisible">
    <v-card>
      <v-card-title>
        <span>Login</span>
      </v-card-title>
      <v-card-text>

        <v-tabs v-model="activeLoginTab" grow>
          <v-tab key="socialLogin" ripple>Social Login</v-tab>
          <v-tab key="localLogin" ripple>Local Login</v-tab>
          <v-tabs-slider color="accent" />
        </v-tabs>
        <v-tabs-items v-model="activeLoginTab">

          <v-tab-item key="socialLogin">
            <v-card flat>
              <v-card-text>
                <v-btn class="mt-5 mb-5" @click="socialCallback('google')">Google</v-btn>
                <v-btn class="mt-5 mb-5" @click="socialCallback('facebook')">Facebook</v-btn>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click.native="cancelLogin">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>

          <v-tab-item key="localLogin">
            <v-card flat>
              <v-card-text>
                <v-text-field
                  type='text'
                  @keyup.enter.native="loginUser"
                  v-model='username'
                  ref="LoginDialogUsername"
                  label='Enter a new username' />
                <v-text-field
                  @keyup.enter.native="loginUser"
                  type='password'
                  v-model='password'
                  label='Password' />
                <v-card-actions>
                  <v-spacer />
                  <v-btn text @click.native="cancelLogin">Cancel</v-btn>
                  <v-btn @click.native="localCallback(username, password)">Login</v-btn>
                </v-card-actions>
              </v-card-text>
            </v-card>
          </v-tab-item>

        </v-tabs-items>

      </v-card-text>
      <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <router-link to="/privacy-policy">Privacy Policy</router-link>
      </v-footer>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'LoginDialog',
  props: [
    'isVisible',
    'socialCallback',
    'localCallback',
  ],
  data: () => ({
    activeLoginTab: 'socialLogin',
    username: '',
    password: ''
  }),
  methods: {
    cancelLogin: function() {
      this.$emit('dialogDismissed')
    }
  },
};
</script>
