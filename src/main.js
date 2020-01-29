import App from './App.vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import auth from '@/auth.js'
import axios from 'axios'
import development from "@/config/development"
import hello from 'hellojs'
import makeRemoteProxy from '@/remoteProxy.js'
import production from "@/config/production"
import storeFactory from '@/store.js'
import vuetify from './plugins/vuetify';
import {getRoutes} from '@/router'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(Vuex)

const LOG = window.console
const remotIsFake = true
const remoteProxy = makeRemoteProxy(remotIsFake, process.env.BACKEND_URL)
const store = storeFactory.makeStore(auth, remoteProxy)

/**
 * Inject the JWT token into each outgoing request if it's available
 */
axios.interceptors.request.use(config => {
  const jwt = auth.get_token()
  if (jwt !== '') {
    if (auth.token_expired(jwt)) {
      auth.renewToken(remoteProxy, jwt)
    }
    config.headers['Authorization'] = 'Bearer ' + jwt
    LOG.debug('Intercepted and set auth token to ' + jwt)
  } else {
    LOG.debug('JWT was null!')
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
  LOG.error({msg: 'Remote error', error: error})
  return Promise.reject(error)
})

if (process.env.NODE_ENV === "production") {
  Vue.prototype.$config = Object.freeze(production)
} else {
  Vue.prototype.$config = Object.freeze(development)
}

const router = new VueRouter({
  mode: 'history',
  routes: getRoutes(auth.getAuthInfo().roles)
})

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
  created: function () {
    // If the token has expired, remove it completely.
    // ... otherwise, the UI still looks as if we were logged in

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
        LOG.error(error)
      })

    // Logout user if JWT token has expired.
    const tokenCleared = auth.clearExpiredToken()
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
      store.commit('updateUserData', data)
    }).catch(e => {
      // TODO show message as snack-text
      store.commit('clearUserData')
      LOG.error(e)
    })
  })
})
