<template>
  <v-app>
    <v-app-bar
      app dense dark
      >
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>{{ pageTitle }} <small>v{{version}}</small></v-toolbar-title>
      <v-spacer></v-spacer>
      <span v-if="tokenIsAvailable">Logged in as <span class="accent--text">{{ appUserName }}</span></span>
      <v-tooltip bottom v-if="tokenIsAvailable">
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            @click.native.stop="logoutUser"
            icon><v-icon>mdi-exit-to-app</v-icon></v-btn>
        </template>
        <span>Logout</span>
      </v-tooltip>
      <v-btn
        v-else
        color="success"
        @click.native.stop="showLoginDialog"
      >Login</v-btn>
    </v-app-bar>
    <MainNavigation></MainNavigation>
    <ProgressIndicator :model="activity"></ProgressIndicator>

    <v-content>
      <LoginDialog
        :isVisible="loginDialogVisible"
        :socialCallback="doSocialLogin"
        :localCallback="doLocalLogin"
        @dialogDismissed="closeLoginDialog"
        ></LoginDialog>
      <router-view
        @fullScreenRequested="setFullscreen"
        @changeActivity="onActivityChange"
        @snackRequested="onSnackRequested"></router-view>
    </v-content>

    <v-snackbar
      app
      :color="snackbar.color"
      :timeout="2000"
      v-model="snackbar.visible">
        {{snackbar.text}}
        <v-spacer></v-spacer>
        <v-btn dark icon @click="snackbar.visible = false"><v-icon dark>mdi-close-box</v-icon></v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import MainNavigation from './components/MainNavigation';
import ProgressIndicator from './components/ProgressIndicator';
import LoginDialog from './components/LoginDialog';
import {getAuthInfo} from '@/auth.js';

export default {
  name: 'App',

  data: () => ({
    snackbar: {
      visible: false,
      color: 'success',
      text: '',
    },
    loginDialogVisible: false,
    version: '2020-01-01',
    activity: {
      visible: false,
      progress: -1,
      text: 'Yoinks'
    },
  }),

  computed: {
    pageTitle () {
      return this.$config.title
    },
    appUserName () {
      return getAuthInfo().userName
    },
    tokenIsAvailable () {
      const token = getAuthInfo().jwtToken
      const result = token !== ''
      return result
    },
  },

  methods: {
    setFullscreen: function () {
      // TODO
    },
    closeLoginDialog: function () {
      this.loginDialogVisible = false
    },
    onActivityChange: function (payload) {
      this.activity.visible = payload.visible
      this.activity.progress = payload.progress
      this.activity.text = payload.text
    },
    doSocialLogin: function (providerName) {
      window.console.log(`Logging in with ${providerName}`)
      // TODO login(providerName)
    },
    doLocalLogin: function (userName, password) {
      window.console.log(`Logging in using local credentials ${userName}`)
      window.console.log(password)  // XXX
      // TODO
    },
    onSnackRequested: function (payload) {
      this.snackbar.visible = true
      this.snackbar.text = payload.text
      this.snackbar.color = payload.color || 'success'
    }
  },

  components: {
    LoginDialog,
    MainNavigation,
    ProgressIndicator,
  },

};
</script>
