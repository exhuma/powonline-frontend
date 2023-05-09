<template>
  <div id="app">
    <v-app>
      <v-snackbar
        :top="true"
        :color="globalSnackColor"
        :timeout="2000"
        v-model="globalSnack"
      >
        {{ globalSnackText }}
        <v-btn text @click="globalSnack = false">Close</v-btn></v-snackbar
      >
      <v-app-bar app v-if="isTitleBarVisible" extension-height="0">
        <v-btn class="hidden-sm-and-up" icon @click="toggleSideMenu"
          ><v-icon>mdi-menu</v-icon></v-btn
        >
        <v-toolbar-title
          >{{ pageTitle }} <small>v{{ version }}</small></v-toolbar-title
        >
        <v-spacer></v-spacer>
        <span v-if="tokenIsAvailable"
          >Logged in as
          <span class="accent--text">{{ appUserName }}</span></span
        >
        <v-tooltip bottom v-if="tokenIsAvailable">
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click.native.stop="logoutUser" icon
              ><v-icon>mdi-logout</v-icon></v-btn
            >
          </template>
          <span>Logout</span>
        </v-tooltip>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" @click.native.stop="showLoginDialog" icon
              ><v-icon>mdi-account-outline</v-icon></v-btn
            >
          </template>
          <span>Login</span>
        </v-tooltip>
      </v-app-bar>

      <v-navigation-drawer
        temporary
        app
        v-model="sideMenuVisible"
        class="hidden-sm-and-up"
      >
        <v-list>
          <v-list-item v-for="route in routes" :to="route.to" :key="route.to">
            <v-list-item-action
              ><v-icon>{{ route.icon }}</v-icon></v-list-item-action
            >
            <v-list-item-content>
              <v-list-item-title>{{ route.label }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <div v-if="activity.text" class="text-center activity-text">
          {{ activity.text }}
        </div>
        <v-progress-linear
          v-show="!refreshProgress.visible"
          height="1"
        ></v-progress-linear>
        <v-progress-linear
          v-show="refreshProgress.visible"
          height="1"
          v-model="refreshProgress.progress"
        ></v-progress-linear>
        <v-progress-linear
          v-if="!activity.visible"
          height="1"
        ></v-progress-linear>
        <v-progress-linear
          v-if="activity.visible"
          height="1"
          v-model="activity.progress"
          :indeterminate="activity.progress === -1"
        ></v-progress-linear>
        <v-container fluid>
          <v-dialog max-width="500px" v-model="loginDialogVisible">
            <v-card>
              <v-card-title class="primary">
                <span>Login</span>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  type="text"
                  @keyup.enter.native="loginUser"
                  v-model="username"
                  ref="LoginDialogUsername"
                  label="Enter a new username"
                />
                <v-text-field
                  @keyup.enter.native="loginUser"
                  type="password"
                  v-model="password"
                  label="Password"
                />
                <v-divider class="mt-4 mb-4"></v-divider>
                <v-layout row wrap align-center>
                  <v-flex> Or login with: </v-flex>
                  <v-flex>
                    <v-btn
                      :disabled="!googleKeyAvailable"
                      @click="login('google')"
                      >Google</v-btn
                    >
                  </v-flex>
                  <v-flex>
                    <v-btn
                      :disabled="!facebookKeyAvailable"
                      @click="login('facebook')"
                      >Facebook</v-btn
                    >
                  </v-flex>
                </v-layout>
                <v-divider class="mt-4 mb-4"></v-divider>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click.native="cancelLogin">Cancel</v-btn>
                <v-btn @click.native="loginUser">Login</v-btn>
              </v-card-actions>
              <v-footer class="pa-3 ma-0">
                <v-spacer></v-spacer>
                <router-link to="/privacy-policy">Privacy Policy</router-link>
              </v-footer>
            </v-card>
          </v-dialog>
          <router-view
            class="mt-0"
            @changeActivity="onActivityChange"
            @fullScreenRequested="setFullscreen"
            @snackRequested="onSnackRequested"
            @refresh-progress-updated="onRefreshProgressUpdated"
          ></router-view>
        </v-container>
        <v-bottom-navigation
          app
          transition="slide-y-transition"
          class="hidden-xs-only"
          :value="isBottomNavVisible"
        >
          <v-btn
            v-for="route in routes"
            :to="route.to"
            :key="route.to"
            text
            :value="here === route.to"
          >
            <span>{{ route.label }}</span>
            <v-icon>{{ route.icon }}</v-icon>
          </v-btn>
        </v-bottom-navigation>
      </v-main>
    </v-app>
  </div>
</template>

<style scoped>
.activity-text {
  font-size: 60%;
  background-color: var(--v-primary-darken4);
}
SMALL {
  font-size: 60%;
}
</style>

<script>
import hello from 'hellojs'
import EventBus from '@/plugins/eventBus'

export default {
  name: 'App',
  mounted() {
    EventBus.$on('activityEvent', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.$on('fileUploadProgress', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.$on('snackRequested', (payload) => {
      this.onSnackRequested(payload)
    })
    EventBus.$on('refresh-progress-updated', (payload) => {
      this.onRefreshProgressUpdated(payload)
    })
  },
  data() {
    return {
      activeLoginTab: 'socialLogin',
      loginDialogVisible: false,
      sideMenuVisible: false,
      username: '',
      password: '',
      globalSnack: false,
      globalSnackText: '',
      globalSnackColor: '',
      version: '2023.05.09.1',
      isTitleBarVisible: true,
      isBottomNavVisible: true,
      activity: {
        visible: false,
        progress: -1,
        text: ''
      },
      refreshProgress: {
        visible: false,
        progress: -1
      }
    }
  },
  methods: {
    setFullscreen(state) {
      this.isBottomNavVisible = !state
      this.isTitleBarVisible = !state
    },
    onActivityChange(state) {
      this.activity = state
    },
    onRefreshProgressUpdated(data) {
      if (data.progress > 0) {
        this.refreshProgress.progress = data.progress
        this.refreshProgress.visible = true
      } else {
        this.refreshProgress.progress = 0
        this.refreshProgress.visible = false
      }
    },
    onSnackRequested(data) {
      this.globalSnack = true
      this.globalSnackText = data.message
      this.globalSnackColor = data.color || 'green'
    },
    toggleSideMenu() {
      this.sideMenuVisible = !this.sideMenuVisible
    },
    showLoginDialog() {
      this.loginDialogVisible = true
      this.$nextTick(() => this.$refs.LoginDialogUsername.focus())
    },
    login(provider) {
      hello(provider).login({
        scope: 'basic, email'
      })
      this.loginDialogVisible = false
    },
    loginUser() {
      this.$remoteProxy
        .loginUser(this.username, this.password)
        .then((data) => {
          this.username = ''
          this.password = ''
          if (data.status === 200) {
            this.$store.commit('updateUserData', data)
          } else {
            this.globalSnackText =
              'Unexpected remote response (' + data.status + ')'
            this.globalSnack = true
            this.globalSnackColor = 'orange'
          }
        })
        .catch((e) => {
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
    logoutUser() {
      hello.logout('facebook')
      hello.logout('google')
      this.$store.commit('clearUserData')
      this.$router.push('/')
      this.username = ''
      this.password = ''
    },
    cancelLogin() {
      this.loginDialogVisible = false
      this.username = ''
      this.password = ''
    },
    hasRole(roleName) {
      return this.$store.state.roles.indexOf(roleName) > -1
    }
  },
  computed: {
    googleKeyAvailable() {
      return Boolean(import.meta.env.VITE_GOOGLE_PUBLIC_KEY)
    },
    facebookKeyAvailable() {
      return Boolean(import.meta.env.VITE_FACEBOOK_PUBLIC_KEY)
    },
    pageTitle() {
      return import.meta.env.VITE_PAGE_TITLE
    },
    appUserName() {
      return this.$store.state.userName
    },
    routes() {
      const roles = this.$store.state.roles
      const output = [
        { label: 'Dashboard', to: '/dashboard', icon: 'mdi-border-all' },
        {
          label: 'Scoreboard',
          to: '/scoreboard',
          icon: 'mdi-format-list-numbered'
        },
        { label: 'Photos', to: '/gallery', icon: 'mdi-image' }
      ]
      if (roles && roles.indexOf('station_manager') > -1) {
        output.push({
          label: 'Stations',
          to: '/station',
          icon: 'mdi-map-marker'
        })
      }
      if (roles && roles.indexOf('admin') > -1) {
        output.push({ label: 'Teams', to: '/team', icon: 'mdi-account-group' })
      }
      if (this.tokenIsAvailable) {
        output.push({
          label: 'Uploads',
          to: '/uploads',
          icon: 'mdi-cloud-upload'
        })
      }
      if (roles && roles.indexOf('admin') > -1) {
        output.push({ label: 'Routes', to: '/route', icon: 'mdi-gesture' })
        output.push({ label: 'Users', to: '/user', icon: 'mdi-face-man' })
        output.push({
          label: 'Audit',
          to: '/auditlog',
          icon: 'mdi-receipt-text'
        })
      }
      output.push({
        label: 'Changelog',
        to: '/changelog',
        icon: 'mdi-information'
      })
      output.push({
        label: 'Manual',
        to: '/manual',
        icon: 'mdi-book'
      })
      return output
    },
    tokenIsAvailable() {
      const token = this.$store.state.jwt
      const result = token !== ''
      return result
    },
    here() {
      return this.$route.path
    }
  }
}
</script>
