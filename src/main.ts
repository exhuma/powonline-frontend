import Vue from 'vue'

import App from './App.vue'
import router from './router'
import { ApiClient } from './api'

import ConfirmationDialog from './components/ConfirmationDialog.vue'
import CenterCol from './components/CenterCol.vue'
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

export const api = new ApiClient(import.meta.env.VITE_BACKEND_URL)

Vue.component('confirmation-dialog', ConfirmationDialog)
Vue.component('center-col', CenterCol)
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
  // @ts-expect-error - passing this as an option is causing a type error
  vuetify,
  render: (h) => h(App)
}).$mount('#app')
