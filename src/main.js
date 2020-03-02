import App from './App.vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import {Identity} from '@/identity.js'
import axios from 'axios'
import development from "@/config/development"
import hello from 'hellojs'
import makeRemoteProxy from '@/remoteProxy.js'
import production from "@/config/production"
import storeFactory from '@/store.js'
import vuetify from './plugins/vuetify';
import {getRoutes} from '@/router'
import EventBus from '@/eventBus'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Vuex)

const LOG = window.console
LOG.debug(Identity)
const remoteIsFake = false
const remoteProxy = makeRemoteProxy(
  remoteIsFake,
  'https://localhost:5000',
  EventBus
)
const store = storeFactory.makeStore(remoteProxy)

/**
 * Inject the JWT token into each outgoing request if it's available
 */
axios.interceptors.request.use(config => {
  const identity = Identity.fromLocalStorage()
  if (identity.isUsable()) {
    if (identity.isExpired()) {
      identity.renew(remoteProxy)
    }
    config.headers['Authorization'] = 'Bearer ' + identity.token
    LOG.debug('Intercepted and set auth token to ' + identity.token)
  } else {
    LOG.debug('JWT is empty. Authorization header was not injected.')
  }
  return config
}, error => {
  // nothing to do
  return Promise.reject(error)
})

axios.defaults.withCredentials = true

axios.interceptors.response.use(response => {
  // nothing to do on successful response
  return response
}, error => {
  LOG.error({msg: error.message, error: error})
  return Promise.reject(error)
})

if (process.env.NODE_ENV === "production") {
  Vue.prototype.$config = Object.freeze(production)
} else {
  Vue.prototype.$config = Object.freeze(development)
}

const router = new VueRouter({
  mode: 'history',
  routes: getRoutes()
})

new Vue({
  vuetify,
  router,
  store,
  remoteProxy,
  render: h => h(App),
  created: function () {
    // Configure social login providers
    remoteProxy.fetchConfig()
      .then(result => {
        if (!result.hello) {
          LOG.warn(
            'No config for hellojs found. Social logins will not work!')
        } else {
          hello.init(result.hello, {redirect_uri: 'redirect.html'})
          LOG.debug('Social logins initialised.')
        }
      })
      .catch(error => {
        LOG.error('Unable to fetch config!')
        LOG.error(error)
      })

    // If the token has expired, remove it completely.
    // ... otherwise, the UI still looks as if we were logged in
    const identity = Identity.fromLocalStorage()
    this.$store.commit('setIdentity', identity)
    const tokenCleared = identity.clear()
    if (tokenCleared) {
      this.$store.commit('clearUserData')
    }

    this.$store.dispatch('fetchSiteConfig')
    this.$store.dispatch('refreshRemote')

    if (process.env.PUSHER_KEY) {
      // eslint-disable-next-line
      let PusherClient = Pusher || undefined
      PusherClient.logToConsole = process.env.PUSHER_DEBUG
      var pusher = new PusherClient(process.env.PUSHER_KEY, {
        cluster: 'eu',
        encrypted: true
      })
      var teamChannel = pusher.subscribe(process.env.PUSHER_TEAM_CHANNEL)
      let that = this
      teamChannel.bind('state-change', function (data) {
        that.$store.commit('updateTeamState', data)
      })
      teamChannel.bind('score-change', function (data) {
        that.$store.commit('updateTeamState', data)
      })
      teamChannel.bind('questionnaire-score-change', function (data) {
        that.$store.commit('setQuestionnaireScore', data)
      })
      teamChannel.bind('team-details-change', function (data) {
        that.$remoteProxy.fetchTeam(data.name)
          .then(newData => {
            that.$store.commit('updateTeam', {team: data.name, newData: newData})
          })
      })
      teamChannel.bind('team-deleted', function (data) {
        that.$store.commit('deleteTeam', data.name)
      })

      var fileChannel = pusher.subscribe(process.env.PUSHER_FILE_CHANNEL)
      fileChannel.bind('file-added', function (data) {
        that.$store.dispatch('refreshUploads')
        that.$store.dispatch('refreshGallery')
        that.$store.commit('addImageToLiveQueue', data)
      })
      fileChannel.bind('file-deleted', function (data) {
        LOG.debug({msg: 'File was deleted remotely', data: data})
        that.$store.dispatch('refreshUploads')
        that.$store.dispatch('refreshGallery')
      })
    } else {
      LOG.warn('Pusher key not specified. Pusher disabled!')
    }
  }
}).$mount('#app')

/**
 * Register callback for social logins
 *
 * After a user successfully logs in using a social identity provider, post
 * that message to the backend to retrieve a corresponding JWT token.
 */
hello.on('auth.login', function (ath) {
  // Fetch user details from the selected network
  hello(ath.network).api('me').then(function (userInfo) {
    // Now we can autheticate with the powonline backend
    remoteProxy.socialLogin(
      ath.authResponse.network,
      userInfo.id,
      ath.authResponse.access_token
    ).then(data => {
      let identity = Identity.fromToken(data.token)
      store.commit('setIdentity', identity)
    }).catch(e => {
      // TODO show message as snack-text
      store.commit('clearUserData')
      LOG.error(e)
    })
  })
})
