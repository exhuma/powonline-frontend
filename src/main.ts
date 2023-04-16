import Vue from 'vue'

import App from './App.vue'
import router from './router'
import axios from 'axios'
import auth from './auth'
import hello from 'hellojs'
import makeRemoteProxy from './remote'
import storeFactory from './store'

import ConfirmationDialog from './components/ConfirmationDialog.vue'
import CenterCol from './components/CenterCol.vue'
import GlobalDashboard from './components/GlobalDashboard.vue'
import MiniStatus from './components/MiniStatus.vue'
import RouteBlock from './components/RouteBlock.vue'
import StateIcon from './components/StateIcon.vue'
import StationBlock from './components/StationBlock.vue'
import TeamBlock from './components/TeamBlock.vue'
import UserBlock from './components/UserBlock.vue'
import SmallStationDashboardItem from './components/SmallStationDashboardItem.vue'
import PopupDialog from './components/PopupDialog.vue'
import RouteDashboard from './components/RouteDashboard.vue'
import RouteDashboardIcons from './components/RouteDashboardIcons.vue'
import TeamForm from './components/forms/TeamForm.vue'
import RouteAssignments from './components/forms/RouteAssignments.vue'
import OptionalTeamRow from './components/OptionalTeamRow.vue'
import ImageUpload from './components/ImageUpload.vue'
import CombinedDashboard from './components/CombinedDashboard.vue'
import DashboardProgressLine from './components/DashboardProgressLine.vue'

import vuetify from './plugins/vuetify'

import './assets/main.css'

const remoteProxy = makeRemoteProxy(false, import.meta.env.VITE_BACKEND_URL)
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
    console.debug('Intercepted and set auth token to ' + jwt)
  } else {
    console.debug('JWT was null!')
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
  console.error({msg: 'Remote error', error: error})
  return Promise.reject(error)
})

Vue.component('confirmation-dialog', ConfirmationDialog)
Vue.component('center-col', CenterCol)
Vue.component('global-dashboard', GlobalDashboard)
Vue.component('route-dashboard', RouteDashboard)
Vue.component('route-dashboard-icons', RouteDashboardIcons)
Vue.component('mini-status', MiniStatus)
Vue.component('route-block', RouteBlock)
Vue.component('state-icon', StateIcon)
Vue.component('station-block', StationBlock)
Vue.component('team-block', TeamBlock)
Vue.component('user-block', UserBlock)
Vue.component('small-station-dashboard-item', SmallStationDashboardItem)
Vue.component('popup-dialog', PopupDialog)
Vue.component('team-form', TeamForm)
Vue.component('route-assignments', RouteAssignments)
Vue.component('optional-team-row', OptionalTeamRow)
Vue.component('image-upload', ImageUpload)
Vue.component('combined-dashboard', CombinedDashboard)
Vue.component('dashboard-progress-line', DashboardProgressLine)

/* eslint-disable no-new */
new Vue({
  router,
  store,
  remoteProxy,
  vuetify,
  render: (h) => h(App),
  created: function () {
    // If the token has expired, remove it completely.
    // ... otherwise, the UI still looks as if we were logged in

    // Configure social login providers
    axios.get('/static/config/config.json')
      .then(response => {
        if (!response.data.hello) {
          console.warn(
            'No config for hellojs found. Social logins will not work!')
        } else {
          hello.init(response.data.hello, {redirect_uri: 'redirect.html'})
          console.log('Social logins initialised.')
        }
      })
      .catch(e => {
        console.error(e)
      })

    // Logout user if JWT token has expired.
    const tokenCleared = auth.clearExpiredToken()
    if (tokenCleared) {
      this.$store.commit('clearUserData')
    }

    this.$store.dispatch('fetchSiteConfig')
    this.$store.dispatch('refreshRemote')

    // eslint-disable-next-line
    if (import.meta.env.VITE_PUSHER_KEY && Pusher) {
      // eslint-disable-next-line
      Pusher.logToConsole = import.meta.env.VITE_PUSHER_DEBUG
      // eslint-disable-next-line
      var pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
        cluster: 'eu',
        encrypted: true
      })
      var teamChannel = pusher.subscribe(import.meta.env.VITE_PUSHER_TEAM_CHANNEL)
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

      var fileChannel = pusher.subscribe(import.meta.env.VITE_PUSHER_FILE_CHANNEL)
      fileChannel.bind('file-added', function (data) {
        that.$store.dispatch('refreshUploads')
        that.$store.dispatch('refreshGallery')
        that.$store.commit('addImageToLiveQueue', data)
      })
      fileChannel.bind('file-deleted', function (data) {
        that.$store.dispatch('refreshUploads')
        that.$store.dispatch('refreshGallery')
      })
    // eslint-disable-next-line
    } else if (!Pusher) {
      console.error('No pusher-client found. Auto-updates will be disabled')
    } else {
      console.warn('Pusher key not specified. Pusher disabled!')
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
    })
  })
})
