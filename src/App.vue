<template>
  <v-app dark>
    <v-system-bar app color="orange" v-if="$config.debug === true">
      <v-icon>mdi-key</v-icon> {{ tokenExpires }}
    </v-system-bar>

    <v-slide-y-transition>
      <TitleBar
        :title="pageTitle"
        :version="version"
        :isTitleBarVisible="isTitleBarVisible"
        :identity="identity"
        >
        <template v-slot:loginButton>
          <v-btn
            color="success"
            @click.native.stop="startLogin"
          >Login</v-btn>
        </template>
        <template v-slot:logoutButton>
          <v-btn
            @click.native.stop="logoutUser"
            icon><v-icon>mdi-exit-to-app</v-icon></v-btn>
        </template>
      </TitleBar>
    </v-slide-y-transition>

    <MainNavigation
      :isVisible="sideMenuVisible"
      :identity="identity"
      ></MainNavigation>
    <ProgressIndicator :model="activity"></ProgressIndicator>

    <v-content>
      <LoginDialog
        :isVisible="loginDialogVisible"
        :hello="hello"
        :localAuth="$remoteProxy"
        @snackRequested="onSnackRequested"
        @dialogDismissed="closeLoginDialog"
        @loginSuccessful="onLoginSuccessful"
        ></LoginDialog>
      <router-view
        :identity="identity"
        @changeActivity="onActivityChange"
        @fullScreenRequested="setFullscreen"
        @snackRequested="onSnackRequested"></router-view>
      <BottomNavigation
        :isVisible="isBottomNavVisible"
        :identity="identity"
        ></BottomNavigation>
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
const LOG = window.console

import hello from 'hellojs'
import TitleBar from './components/TitleBar'
import MainNavigation from './components/MainNavigation'
import BottomNavigation from './components/BottomNavigation'
import ProgressIndicator from './components/ProgressIndicator'
import LoginDialog from './components/LoginDialog'
import EventBus from '@/eventBus'
import {Identity, LocalStorage} from '@/identity'

export default {
  name: 'App',
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

  created () {
    this.identity = this.identityStore.load()
  },

  data () {
    const identityStore = new LocalStorage('jwt')
    return {
      hello: hello,
      identityStore: identityStore,
      identity: Identity.makeNull(identityStore),
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
    logoutUser () {
      const identityStore = new LocalStorage('jwt')
      this.identity = Identity.makeNull(identityStore)
      identityStore.clear()
      this.$store.commit('setIdentity', this.identity)
    },
    startLogin () {
      this.loginDialogVisible = true
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
    onLoginSuccessful: function (identity) {
      this.identity = identity
      this.identity.persist()
      this.$store.commit('setIdentity', this.identity)
    },
    onSnackRequested: function (payload) {
      if (payload.error !== undefined) {
        LOG.error(payload.error)
      }
      this.snackbar.visible = true
      this.snackbar.text = payload.text
      this.snackbar.color = payload.color || 'success'
    }
  },

  computed: {
    pageTitle: function () {
      return this.$config.title
    },
    tokenExpires: function () {
      let expiration = Math.floor(this.identity.exp - (Date.now() / 1000))
      if (expiration <= 0) {
        return 'expired!'
      }
      return `${expiration}s`
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
