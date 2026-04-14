import Vue from 'vue'

import App from './App.vue'
import router from './router'
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

import events from './events'
import vuetify from './plugins/vuetify'

const remoteProxy = makeRemoteProxy(false, import.meta.env.VITE_BACKEND_URL)
const store = storeFactory.makeStore(remoteProxy)

// @ts-expect-error - currently no clue why this is not working
Vue.use(remoteProxy)

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
  // @ts-expect-error - passing this as an option is causing a type error
  vuetify,
  remoteProxy,
  render: (h) => h(App),
  created: function () {
    document.title = import.meta.env.VITE_PAGE_TITLE || 'powonline'
    // Check for an existing server-side session (reads the access_token cookie)
    this.$store.dispatch('checkSession')
    this.$store.dispatch('refreshRemote')
    events.init(store, remoteProxy, {
      key: import.meta.env.VITE_PUSHER_KEY,
      debug: Boolean(import.meta.env.VITE_PUSHER_DEBUG),
      teamChannel: import.meta.env.VITE_PUSHER_TEAM_CHANNEL,
      fileChannel: import.meta.env.VITE_PUSHER_FILE_CHANNEL
    })
  }
}).$mount('#app')
