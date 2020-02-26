<template>
  <v-app dark>
    <v-slide-y-transition>
      <TitleBar
        :title="pageTitle"
        :version="version"
        :userName="appUserName"
        :isTitleBarVisible="isTitleBarVisible"
        @logoutRequested="onLogoutRequested"
        ></TitleBar>
    </v-slide-y-transition>

    <MainNavigation :isVisible="sideMenuVisible"></MainNavigation>
    <ProgressIndicator :model="activity"></ProgressIndicator>

    <v-content>
      <LoginDialog
        :isVisible="loginDialogVisible"
        :hello="hello"
        :localAuth="localAuth"
        @dialogDismissed="closeLoginDialog"
        ></LoginDialog>
      <router-view
        @changeActivity="onActivityChange"
        @fullScreenRequested="setFullscreen"
        @snackRequested="onSnackRequested"></router-view>
      <BottomNavigation :isVisible="isBottomNavVisible"></BottomNavigation>
    </v-content>

    <v-snackbar
      :top="true"
      :color="snackbar.color"
      :timeout="2000"
      v-model="snackbar.visible">
        {{snackbar.text}}
        <v-spacer></v-spacer>
        <v-btn dark icon @click="snackbar.visible = false"><v-icon dark>mdi-close-box</v-icon></v-btn>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
  SMALL {
    font-size: 60%;
  }
</style>

<script>
import hello from 'hellojs'
import TitleBar from './components/TitleBar'
import MainNavigation from './components/MainNavigation'
import BottomNavigation from './components/BottomNavigation'
import ProgressIndicator from './components/ProgressIndicator'
import LoginDialog from './components/LoginDialog'
import auth from '@/auth.js'
import EventBus from '@/eventBus'
import localAuth from '@/auth'

export default {
  name: 'App',
  created () {
    const roles = this.$store.state.roles
    // TODO return this.$store.state.userName
    // TODO this.$store.state.jwt
    if (process.env.NODE_ENV === "development" &&
        !roles.includes('admin')) {
      roles.push('admin')
    }
  },
  mounted () {
    EventBus.$on('activityEvent', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.$on('fileUploadProgress', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.$on('snackRequested', (payload) => {
      this.onSnackRequested(payload)
    })
  },

  data () {
    return {
      localAuth: localAuth,
      hello: hello,
      snackbar: {
        visible: false,
        color: 'success',
        text: ''
      },
      loginDialogVisible: false,
      sideMenuVisible: false,
      version: '2019.05.9',
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
    onLogoutRequested () {
      this.localAuth.logoutUser(this.hello)
    },
    setFullscreen (state) {
      this.isBottomNavVisible = !state
      this.isTitleBarVisible = !state
    },
    closeLoginDialog: function () {
      this.loginDialogVisible = false
    },
    onActivityChange (state) {
      this.activity = state
    },
    onSnackRequested: function (payload) {
      this.snackbar.visible = true
      this.snackbar.text = payload.text
      this.snackbar.color = payload.color || 'success'
    }
  },

  computed: {
    pageTitle: function () {
      return this.$config.title
    },
    appUserName: () => {
      return auth.getAuthInfo().userName
    }
  },

  components: {
    BottomNavigation,
    LoginDialog,
    MainNavigation,
    ProgressIndicator,
    TitleBar,
  }

}
</script>
