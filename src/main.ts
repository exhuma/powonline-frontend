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

// ---------------------------------------------------------------------------
// Runtime config
// ---------------------------------------------------------------------------
//
// In production the nginx entrypoint writes /config.json from env vars via
// envsubst before starting nginx.  In development the Vite dev server falls
// back to the VITE_BACKEND_URL value so the file isn't required locally.
// ---------------------------------------------------------------------------

async function loadConfig(): Promise<{ backendUrl: string }> {
  if (import.meta.env.PROD) {
    // In production, we expect the config file to be present.  If it's not
    // found or fails to parse, it's a fatal error and we should let it throw.
    const res = await fetch('/config.json')
    if (!res.ok) {
      throw new Error(
        `Failed to load config.json: ${res.status} ${res.statusText}`
      )
    }
    return res.json()
  } else {
    return {
      backendUrl: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000'
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level export — populated after config is loaded.
// Components that do `import { api } from '@/main'` receive this instance.
// The value is set synchronously before Vue mounts so all component setup()
// calls will see a fully initialised ApiClient.
// ---------------------------------------------------------------------------
export let api: ApiClient

// Re-export so existing consumers of `@/main` continue to work unchanged.
export { pinnedEvent }

// ---------------------------------------------------------------------------
// Boot sequence: load runtime config → resolve domain pin → mount Vue
// ---------------------------------------------------------------------------
console.info(`[powonline] version ${__APP_VERSION__}  commit ${__COMMIT_SHA__}`)
loadConfig().then(({ backendUrl }) => {
  api = new ApiClient(backendUrl)

  // Resolve domain-pinned event before mounting so every component and the
  // router guard can read pinnedEvent.value synchronously on first render.
  api
    .fetchEventByDomain(window.location.hostname)
    .then((event) => {
      if (event) {
        pinnedEvent.value = event

        // Apply site title
        if (event.title) {
          document.title = event.title
        }

        // Apply favicon
        if (event.has_favicon) {
          let link =
            document.querySelector<HTMLLinkElement>("link[rel~='icon']")
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = api.eventFaviconUrl(event.id)
        }
      }
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
})
