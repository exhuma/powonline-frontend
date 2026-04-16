import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { ApiClient } from './api'
import { pinnedEvent } from './pinnedEvent'

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

// Re-export so existing consumers of `@/main` continue to work unchanged.
export { pinnedEvent }

// Resolve domain-pinned event before mounting so every component and the
// router guard can read pinnedEvent.value synchronously on first render.
api
  .fetchEventByDomain(window.location.hostname)
  .then((event) => {
    if (event) pinnedEvent.value = event
  })
  .catch(() => {
    // Non-fatal: if the lookup fails we just run in normal multi-event mode.
  })
  .finally(() => {
    const app = createApp(App)

    app.component('confirmation-dialog', ConfirmationDialog)
    app.component('center-col', CenterCol)
    app.component('route-dashboard', RouteDashboard)
    app.component('route-dashboard-icons', RouteDashboardIcons)
    app.component('mini-status', MiniStatus)
    app.component('route-block', RouteBlock)
    app.component('state-icon', StateIcon)
    app.component('station-block', StationBlock)
    app.component('team-block', TeamBlock)
    app.component('user-block', UserBlock)
    app.component('small-station-dashboard-item', SmallStationDashboardItem)
    app.component('popup-dialog', PopupDialog)
    app.component('team-form', TeamForm)
    app.component('route-assignments', RouteAssignments)
    app.component('optional-team-row', OptionalTeamRow)
    app.component('image-upload', ImageUpload)
    app.component('combined-dashboard', CombinedDashboard)
    app.component('dashboard-progress-line', DashboardProgressLine)

    app.use(router)
    app.use(vuetify)
    app.mount('#app')
  })
