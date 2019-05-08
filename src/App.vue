<template>
  <div id="app">
    <v-app dark>
      <v-snackbar :top="true" :color="globalSnackColor" :timeout="2000" v-model="globalSnack"> {{globalSnackText}} <v-btn flat @click="globalSnack = false">Close</v-btn></v-snackbar>
      <v-toolbar v-if="isTitleBarVisible" app>
        <v-btn class="hidden-sm-and-up" icon @click="toggleSideMenu"><v-icon>menu</v-icon></v-btn>
        <v-toolbar-title>{{ pageTitle }} <small>v{{version}}</small></v-toolbar-title>
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

      <div
        v-if="activity.visible && activity.text"
        class="grey darken-4 white--text">{{ activity.text }}</div>
      <v-progress-linear
        v-if="activity.visible"
        class="mt-0"
        height="2"
        v-model="activity.progress"
        :indeterminate="activity.progress === -1"></v-progress-linear>

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

                <v-tabs v-model="activeLoginTab" grow>
                  <v-tabs-bar>
                    <v-tabs-item href="#socialLogin" key="socialLogin" ripple>Social Login</v-tabs-item>
                    <v-tabs-item href="#localLogin" key="localLogin" ripple>Local Login</v-tabs-item>
                    <v-tabs-slider color="accent" />
                  </v-tabs-bar>
                  <v-tabs-items>
                    <v-tabs-content key="socialLogin" id="socialLogin">
                      <v-btn class="mt-5 mb-5" @click="login('google')">Google</v-btn>
                      <v-btn class="mt-5 mb-5" @click="login('facebook')">Facebook</v-btn>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn flat @click.native="cancelLogin">Cancel</v-btn>
                      </v-card-actions>
                    </v-tabs-content>
                    <v-tabs-content key="localLogin" id="localLogin">
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
                        <v-btn flat @click.native="cancelLogin">Cancel</v-btn>
                        <v-btn @click.native="loginUser">Login</v-btn>
                      </v-card-actions>
                    </v-tabs-content>
                  </v-tabs-items>
                </v-tabs>

              </v-card-text>
            </v-card>
          </v-dialog>
          <router-view
            @changeActivity="onActivityChange"
            @fullScreenRequested="setFullscreen"
            @snackRequested="onSnackRequested"></router-view>
        </v-container>
        <v-bottom-nav
          app
          transition="slide-y-transition"
          class="hidden-xs-only"
          :value="isBottomNavVisible">
          <v-btn v-for="route in routes" :to="route.to" :key="route.to" flat :value="here === route.to">
            <span>{{ route.label }}</span>
            <v-icon>{{route.icon}}</v-icon>
          </v-btn>
        </v-bottom-nav>
      </v-content>
    </v-app>
  </div>
</template>

<style scoped>
  SMALL {
    font-size: 60%;
  }
</style>

<script>
import hello from 'hellojs'
import EventBus from '@/eventBus'

export default {
  name: 'App',
  mounted () {
    EventBus.$on('activityEvent', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.$on('fileUploadProgress', (payload) => {
      this.onActivityChange(payload)
    })
  },
  data () {
    return {
      activeLoginTab: 'socialLogin',
      loginDialogVisible: false,
      sideMenuVisible: false,
      username: '',
      password: '',
      globalSnack: false,
      globalSnackText: '',
      globalSnackColor: '',
      version: '2019.05.4',
      isTitleBarVisible: true,
      isBottomNavVisible: true,
      activity: {
        visible: false,
        progress: -1,
        text: ''
      }
    }
  },
  methods: {
    setFullscreen (state) {
      this.isBottomNavVisible = !state
      this.isTitleBarVisible = !state
    },
    onActivityChange (state) {
      this.activity = state
    },
    onSnackRequested (data) {
      this.globalSnack = true
      this.globalSnackText = data.message
      this.globalSnackColor = data.color || 'green'
    },
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
          this.$store.commit('updateUserData', data)
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

        hello.logout('facebook')
        hello.logout('google')
        this.$store.commit('clearUserData')
        this.globalSnackText = message
        this.globalSnack = true
        this.globalSnackColor = 'error'
      })
      this.loginDialogVisible = false
    },
    logoutUser () {
      hello.logout('facebook')
      hello.logout('google')
      this.$store.commit('clearUserData')
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
        { label: 'Teams', to: '/team', icon: 'group' },
        { label: 'Photos', to: '/gallery', icon: 'image' }
      ]
      if (this.tokenIsAvailable) {
        output.push({ label: 'Uploads', to: '/uploads', icon: 'cloud_upload' })
      }
      const roles = this.$store.state.roles
      if (roles && roles.indexOf('admin') > -1) {
        output.push({ label: 'Routes', to: '/route', icon: 'gesture' })
        output.push({ label: 'Users', to: '/user', icon: 'face' })
      }
      output.push({ label: 'Changelog', to: '/changelog', icon: 'info' })
      return output
    },
    pageTitle () {
      return this.$store.state.siteConfig.title
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
