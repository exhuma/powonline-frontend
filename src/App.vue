<template>
  <div id="app">
    <v-app dark>
      <v-snackbar :top="true" :color="globalSnackColor" :timeout="2000" v-model="globalSnack"> {{globalSnackText}} <v-btn flat @click="globalSnack = false">Close</v-btn></v-snackbar>
      <v-toolbar app>
        <v-btn class="hidden-sm-and-up" icon @click="toggleSideMenu"><v-icon>menu</v-icon></v-btn>
        <v-toolbar-title>{{ pageTitle }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <span v-if="tokenIsAvailable">Logged in as <span class="accent--text">{{ appUserName }}</span></span>
        <v-tooltip bottom v-if="tokenIsAvailable">
          <v-btn slot="activator" @click.native.stop="logoutUser" icon><v-icon>exit_to_app</v-icon></v-btn>
          <span>Logout</span>
        </v-tooltip>
        <v-tooltip bottom v-else>
          <v-btn slot="activator" @click.native.stop="showLoginDialog" icon><v-icon>perm_identity</v-icon></v-btn>
          <span>Login</span>
        </v-tooltip>
      </v-toolbar>
      <v-navigation-drawer temporary absolute app v-model="sideMenuVisible" class="hidden-sm-and-up">
        <v-list>
          <v-list-tile v-for="route in routes" :to="route.to" :key="route.to">
            <v-list-tile-action><v-icon>{{ route.icon }}</v-icon></v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ route.label }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-navigation-drawer>
      <v-content>
        <v-container fluid>
          <v-dialog max-width="500px" v-model="loginDialogVisible">
            <v-card>
              <v-card-title>
                <span>Login</span>
              </v-card-title>
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
                <v-divider></v-divider>
                <v-btn @click="login('google')">Google</v-btn>
                <v-btn @click="login('facebook')">Facebook</v-btn>
                <v-divider></v-divider>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer />
                <v-btn flat @click.native="cancelLogin">Cancel</v-btn>
                <v-btn @click.native="loginUser">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <router-view></router-view>
        </v-container>
        <v-bottom-nav transition="slide-y-transition" class="hidden-xs-only" :value="isBottomNavVisible">
          <v-btn v-for="route in routes" :to="route.to" :key="route.to" flat :value="here === route.to">
            <span>{{ route.label }}</span>
            <v-icon>{{route.icon}}</v-icon>
          </v-btn>
        </v-bottom-nav>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import hello from 'hellojs'

export default {
  name: 'App',
  data () {
    return {
      loginDialogVisible: false,
      sideMenuVisible: false,
      username: '',
      password: '',
      globalSnack: false,
      globalSnackText: '',
      globalSnackColor: ''
    }
  },
  methods: {
    toggleSideMenu () {
      this.sideMenuVisible = !this.sideMenuVisible
    },
    showLoginDialog () {
      this.loginDialogVisible = true
      this.$nextTick(() => this.$refs.LoginDialogUsername.focus())
    },
    login (provider) {
      hello(provider).login({
        'scope': 'basic, email'
      })
      this.loginDialogVisible = false
    },
    loginUser () {
      this.$remoteProxy.loginUser(this.username, this.password).then(data => {
        this.username = ''
        this.password = ''
        if (data.status === 200) {
          this.$store.commit('loginUser', data)
        } else {
          this.globalSnackText = 'Unexpected remote response (' + data.status + ')'
          this.globalSnack = true
          this.globalSnackColor = 'orange'
        }
      }).catch(e => {
        let message = 'Unknown Error'
        if (e.response) {
          message = e.response.data
        } else {
          message = e.message
        }

        this.$store.commit('logoutUser')
        this.globalSnackText = message
        this.globalSnack = true
        this.globalSnackColor = 'error'
      })
      this.loginDialogVisible = false
    },
    logoutUser () {
      this.$store.commit('logoutUser')
      this.$router.push('/')
      this.username = ''
      this.password = ''
    },
    cancelLogin () {
      this.loginDialogVisible = false
      this.username = ''
      this.password = ''
    },
    hasRole (roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },
  computed: {
    appUserName () {
      return this.$store.state.userName
    },
    routes () {
      const output = [
        { label: 'Dashboard', to: '/matrix', icon: 'border_all' },
        { label: 'Scoreboard', to: '/scoreboard', icon: 'format_list_numbered' },
        { label: 'Stations', to: '/station', icon: 'place' },
        { label: 'Teams', to: '/team', icon: 'group' }
      ]
      const roles = this.$store.state.roles
      if (roles && roles.indexOf('admin') > -1) {
        output.push({ label: 'Routes', to: '/route', icon: 'gesture' })
        output.push({ label: 'Users', to: '/user', icon: 'face' })
      }
      return output
    },
    pageTitle () {
      return this.$store.state.pageTitle
    },
    isBottomNavVisible () {
      return true
    },
    tokenIsAvailable () {
      const token = this.$store.state.jwt
      const result = token !== ''
      return result
    },
    here () {
      return this.$route.path
    }
  }
}
</script>
