<template>
  <v-dialog max-width="500px" v-model="isVisible">
    <v-card>
      <v-card-title>
        <span>Login</span>
      </v-card-title>
      <v-card-text>

        <v-tabs v-model="activeLoginTab" grow>
          <v-tab key="0" ripple>
            Social Login
          </v-tab>
          <v-tab key="1" ripple>
            Local Login
          </v-tab>
          <v-tabs-slider color="accent" />
        </v-tabs>
        <v-tabs-items v-model="activeLoginTab">

          <v-tab-item key="0">
            <v-card flat>
              <v-card-text>
                <v-btn class="mt-5 mb-5" @click="hello.login('google')">Google</v-btn>
                <v-btn class="mt-5 mb-5" @click="hello.login('facebook')">Facebook</v-btn>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click.native="cancelLogin">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>

          <v-tab-item key="1">
            <v-card flat>
              <v-card-text>
                <v-text-field
                  type='text'
                  @keyup.enter.native="localLogin"
                  v-model='username'
                  ref="LoginDialogUsername"
                  label='Enter a new username' />
                <v-text-field
                  @keyup.enter.native="localLogin"
                  type='password'
                  v-model='password'
                  label='Password' />
                <v-card-actions>
                  <v-spacer />
                  <v-btn text @click.native="cancelLogin">Cancel</v-btn>
                  <v-btn @click.native="localLogin">Login</v-btn>
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
    'hello', // injection point for "hellojs"
    'localAuth' // injectio point for the local auth lib
  ],
  data: () => ({
    activeLoginTab: 0,
    username: '',
    password: ''
  }),
  watch: {
    activeLoginTab: function (newTab) {
      if (newTab === 1) {
        const that = this
        // See https://forum.vuejs.org/t/solved-this-refs-key-returns-undefined-when-it-really-is/1226/30?u=exhuma
        window.setTimeout(function () {
          that.$refs.LoginDialogUsername.focus()
        }, 300)
      }
    }
  },
  methods: {
    localLogin: function () {
      let prm = this.localAuth.localLogin(this.username, this.password)
        .then((data) => {
          this.username = ''
          this.password = ''
          this.$store.commit('updateUserData', data)
          this.$emit('snackRequested', {
            text: 'Unexpected remote response (' + data.status + ')',
            color: 'orange'
          })
          this.closeDialog()
        })
        .catch((error) => {
          this.hello.logout('facebook')
          this.hello.logout('google')
          this.$emit('snackRequested', {
            text: error,
            color: 'error',
            error: error
          })
          this.$store.commit('clearUserData')
          this.closeDialog()
        })
      return prm
    },
    closeDialog: function () {
      this.username = ''
      this.password = ''
      this.$emit('dialogDismissed')
    },
    cancelLogin: function () {
      this.closeDialog()
    },
    login (provider) {
      this.hello(provider).login({
        'scope': 'basic, email'
      })
      this.isVisible = false
    }
  }
}
</script>
