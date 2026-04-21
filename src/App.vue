<template>
  <div id="app">
    <v-app>
      <v-snackbar
        location="top"
        :color="globalSnackColor"
        :timeout="2000"
        v-model="globalSnack"
      >
        {{ globalSnackText }}
        <template #actions>
          <v-btn variant="text" @click="globalSnack = false">Close</v-btn>
        </template>
      </v-snackbar>
      <v-app-bar app v-if="isTitleBarVisible" extension-height="0">
        <v-btn class="hidden-sm-and-up" icon @click="toggleSideMenu"
          ><v-icon>mdi-menu</v-icon></v-btn
        >
        <v-toolbar-title
          >{{ pageTitle }} <small>v{{ appVersion }}</small></v-toolbar-title
        >
        <v-chip
          v-if="selectedEventName"
          class="ml-3"
          color="secondary"
          label
          size="small"
          :to="pinnedEvent ? undefined : '/'"
        >
          <v-icon start size="small">mdi-calendar</v-icon>
          {{ selectedEventName }}
        </v-chip>
        <v-spacer></v-spacer>
        <!-- Offline / pending-sync indicators -->
        <v-tooltip location="bottom" v-if="isOffline">
          <template v-slot:activator="{ props }">
            <v-chip v-bind="props" color="error" size="small" class="mr-2">
              <v-icon start size="small">mdi-wifi-off</v-icon>
              Offline
            </v-chip>
          </template>
          <span>No network connection — last-known data shown</span>
        </v-tooltip>
        <v-tooltip location="bottom" v-if="pendingSyncCount > 0">
          <template v-slot:activator="{ props }">
            <v-chip v-bind="props" color="warning" size="small" class="mr-2">
              <v-icon start size="small">mdi-cloud-sync-outline</v-icon>
              {{ pendingSyncCount }} pending
            </v-chip>
          </template>
          <span
            >{{ pendingSyncCount }} write(s) queued and will sync when
            online</span
          >
        </v-tooltip>
        <span v-if="tokenIsAvailable"
          >Logged in as
          <span class="text-accent">{{ session.userName }}</span></span
        >
        <v-tooltip location="bottom" v-if="tokenIsAvailable">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" @click.stop="logoutUser" icon
              ><v-icon>mdi-logout</v-icon></v-btn
            >
          </template>
          <span>Logout</span>
        </v-tooltip>
        <v-tooltip location="bottom" v-else>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" @click.stop="showLoginDialog" icon
              ><v-icon>mdi-account-outline</v-icon></v-btn
            >
          </template>
          <span>Login</span>
        </v-tooltip>
      </v-app-bar>

      <v-navigation-drawer
        temporary
        app
        v-model="sideMenuVisible"
        class="hidden-sm-and-up"
      >
        <v-list>
          <v-list-item
            v-for="route in navRoutes"
            :to="route.to"
            :key="route.to"
          >
            <template #prepend>
              <v-icon>{{ route.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ route.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <div v-if="activity.text" class="text-center activity-text">
          {{ activity.text }}
        </div>
        <v-progress-linear
          v-show="!refreshProgress.visible"
          height="1"
        ></v-progress-linear>
        <v-progress-linear
          v-show="refreshProgress.visible"
          height="1"
          :model-value="refreshProgress.progress"
        ></v-progress-linear>
        <v-progress-linear
          v-if="!activity.visible"
          height="1"
        ></v-progress-linear>
        <v-progress-linear
          v-if="activity.visible"
          height="1"
          :model-value="activity.progress"
          :indeterminate="activity.progress === -1"
        ></v-progress-linear>
        <v-container fluid>
          <v-dialog max-width="500px" v-model="loginDialogVisible">
            <v-card>
              <v-card-title class="bg-primary">
                <span>Login</span>
              </v-card-title>
              <v-card-text>
                <v-text-field
                  type="text"
                  @keyup.enter="loginUser"
                  v-model="username"
                  ref="LoginDialogUsername"
                  label="Enter a new username"
                  autofocus
                />
                <v-text-field
                  @keyup.enter="loginUser"
                  type="password"
                  v-model="password"
                  label="Password"
                />
                <v-divider class="mt-4 mb-4"></v-divider>
                <v-row align="center">
                  <v-col> Or login with: </v-col>
                  <v-col v-for="provider in authProviders" :key="provider.name">
                    <v-btn @click="loginSocial(provider.name)">{{
                      provider.label
                    }}</v-btn>
                  </v-col>
                </v-row>
                <v-divider class="mt-4 mb-4"></v-divider>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="cancelLogin">Cancel</v-btn>
                <v-btn @click="loginUser">Login</v-btn>
              </v-card-actions>
              <v-footer class="pa-3 ma-0">
                <v-spacer></v-spacer>
                <router-link to="/privacy-policy">Privacy Policy</router-link>
              </v-footer>
            </v-card>
          </v-dialog>
          <router-view
            class="mt-0"
            @changeActivity="onActivityChange"
            @fullScreenRequested="setFullscreen"
            @snackRequested="onSnackRequested"
            @refresh-progress-updated="onRefreshProgressUpdated"
          ></router-view>
        </v-container>
        <v-bottom-navigation
          app
          transition="slide-y-transition"
          class="hidden-xs-only"
          v-if="isBottomNavVisible"
        >
          <v-btn
            v-for="route in navRoutes"
            :to="route.to"
            :key="route.to"
            variant="text"
            :value="here === route.to"
          >
            <span>{{ route.label }}</span>
            <v-icon>{{ route.icon }}</v-icon>
          </v-btn>
        </v-bottom-navigation>
      </v-main>
    </v-app>
  </div>
</template>

<style scoped>
.activity-text {
  font-size: 60%;
  background-color: rgb(var(--v-theme-primary));
}
SMALL {
  font-size: 60%;
}
</style>

<script lang="ts">
import { startSocialLogin } from '@/auth/social'
import EventBus from '@/plugins/eventBus'
import { defineComponent } from 'vue'
import { api, pinnedEvent } from '@/main'
import { init as initRealtime } from '@/events'
import type { AuthProvider, EventInfo } from '@/api'
import { useOfflineStatus } from '@/composables/useOfflineStatus'

declare const __APP_VERSION__: string

export type Session = {
  userName: string
  roles: string[]
}

const App = defineComponent({
  name: 'App',
  setup() {
    const { isOffline, pendingSyncCount } = useOfflineStatus()
    return { isOffline, pendingSyncCount }
  },
  provide() {
    return {
      api,
      session: this.session,
      getSelectedEventId: () =>
        pinnedEvent.value?.id ?? (this as any).selectedEventId,
      setSelectedEventId: (id: number | null) => {
        ;(this as any).selectedEventId = id
      },
      getEvents: () => (this as any).events,
      setEvents: (evts: EventInfo[]) => {
        ;(this as any).events = evts
      },
      checkSession: () => (this as any).refreshSession()
    }
  },
  watch: {
    $route(to) {
      // When a domain pin is active, selectedEventId comes from pinnedEvent — never from the URL
      if (pinnedEvent.value) return

      // Sync selectedEventId from the URL on every navigation (handles hard reloads too)
      const rawId = to.params.eventId
      if (rawId) {
        const id = Number(rawId)
        if (!isNaN(id) && id > 0) {
          this.selectedEventId = id
        }
      }
    }
  },
  mounted() {
    // If a domain pin is already resolved, use it immediately.
    // Do NOT redirect — the domain itself is the event context; the URL stays clean.
    if (pinnedEvent.value) {
      this.selectedEventId = pinnedEvent.value.id
    } else {
      // Sync selectedEventId on initial load in case the page is hard-reloaded on an event-scoped URL
      const rawId = this.$route.params.eventId
      if (rawId) {
        const id = Number(rawId)
        if (!isNaN(id) && id > 0) {
          this.selectedEventId = id
        }
      }
    }

    EventBus.on('activityEvent', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.on('fileUploadProgress', (payload) => {
      this.onActivityChange(payload)
    })
    EventBus.on('snackRequested', (payload) => {
      this.onSnackRequested(payload)
    })
    EventBus.on('refresh-progress-updated', (payload) => {
      this.onRefreshProgressUpdated(payload)
    })

    // Load available social auth providers
    api
      .getAuthProviders()
      .then((providers: AuthProvider[]) => {
        this.authProviders = providers
      })
      .catch(() => {
        this.authProviders = []
      })

    // Check for an existing server-side session
    this.refreshSession()

    // Load events list
    api
      .fetchEvents()
      .then((evts) => {
        this.events = evts
      })
      .catch(() => {
        this.events = []
      })

    // Init realtime (Pusher)
    document.title = import.meta.env.VITE_PAGE_TITLE || 'powonline'
    initRealtime(
      api,
      {
        key: import.meta.env.VITE_PUSHER_KEY,
        debug: Boolean(import.meta.env.VITE_PUSHER_DEBUG),
        teamChannel: import.meta.env.VITE_PUSHER_TEAM_CHANNEL,
        fileChannel: import.meta.env.VITE_PUSHER_FILE_CHANNEL
      },
      {
        onTeamStateChange: () => {
          /* handled locally in views */
        },
        onQuestionnaireScoreChange: () => {
          /* handled locally in views */
        },
        onTeamDetailsChange: () => {
          /* handled locally in views */
        },
        onTeamDeleted: () => {
          /* handled locally in views */
        },
        onFileAdded: () => {
          /* handled locally in views */
        },
        onFileDeleted: () => {
          /* handled locally in views */
        }
      }
    )
  },
  data() {
    return {
      session: {
        userName: '',
        roles: [] as string[]
      } as Session,
      selectedEventId: null as number | null,
      events: [] as EventInfo[],
      activeLoginTab: 'socialLogin',
      loginDialogVisible: false,
      sideMenuVisible: false,
      username: '',
      password: '',
      globalSnack: false,
      globalSnackText: '',
      globalSnackColor: '',
      isTitleBarVisible: true,
      isBottomNavVisible: true,
      authProviders: [] as AuthProvider[],
      activity: {
        visible: false,
        progress: -1,
        text: ''
      },
      refreshProgress: {
        visible: false,
        progress: -1
      }
    }
  },
  methods: {
    async refreshSession() {
      try {
        const info = await api.checkSession()
        if (info) {
          this.session.userName = info.user
          this.session.roles = info.roles
        } else {
          this.session.userName = ''
          this.session.roles = []
        }
      } catch {
        this.session.userName = ''
        this.session.roles = []
      }
    },
    setFullscreen(state) {
      this.isBottomNavVisible = !state
      this.isTitleBarVisible = !state
    },
    onActivityChange(state) {
      this.activity = state
    },
    onRefreshProgressUpdated(data) {
      if (data.progress > 0) {
        this.refreshProgress.progress = data.progress
        this.refreshProgress.visible = true
      } else {
        this.refreshProgress.progress = 0
        this.refreshProgress.visible = false
      }
    },
    onSnackRequested(data) {
      this.globalSnack = true
      this.globalSnackText = data.message
      this.globalSnackColor = data.color || 'green'
    },
    toggleSideMenu() {
      this.sideMenuVisible = !this.sideMenuVisible
    },
    showLoginDialog() {
      this.loginDialogVisible = true
    },
    loginSocial(provider: string) {
      this.loginDialogVisible = false
      startSocialLogin(provider)
    },
    async loginUser() {
      this.loginDialogVisible = false
      try {
        const data = await api.loginUser(this.username, this.password)
        this.username = ''
        this.password = ''
        this.session.userName = data.user
        this.session.roles = data.roles
      } catch (e: any) {
        let message = 'Unknown Error'
        if (e.response) {
          message = e.response.data
        } else {
          message = e.message
        }
        this.session.userName = ''
        this.session.roles = []
        this.globalSnackText = message
        this.globalSnack = true
        this.globalSnackColor = 'error'
      }
    },
    async logoutUser() {
      await api.logout()
      this.session.userName = ''
      this.session.roles = []
      this.username = ''
      this.password = ''
      this.$router.push('/')
    },
    cancelLogin() {
      this.loginDialogVisible = false
      this.username = ''
      this.password = ''
    }
  },
  computed: {
    appVersion() {
      return __APP_VERSION__
    },
    pinnedEvent() {
      return pinnedEvent.value
    },
    pageTitle() {
      return import.meta.env.VITE_PAGE_TITLE
    },
    navRoutes() {
      const roles: string[] = this.session.roles
      const hasRole = (r: string) =>
        roles.includes('admin') || roles.includes(r)
      const eventId = this.selectedEventId
      // When a domain is pinned, emit clean paths (e.g. /dashboard).
      // Otherwise prefix with /event/<id>/ as usual.
      const ep = (path: string): string | null => {
        if (pinnedEvent.value) return `/${path}`
        return eventId ? `/event/${eventId}/${path}` : null
      }

      const output: { label: string; to: string; icon: string }[] = []

      // Event-scoped routes — only shown when an event is selected
      const dashboard = ep('dashboard')
      if (dashboard) {
        output.push({
          label: 'Dashboard',
          to: dashboard,
          icon: 'mdi-border-all'
        })
      }
      const scoreboard = ep('scoreboard')
      if (scoreboard) {
        output.push({
          label: 'Scoreboard',
          to: scoreboard,
          icon: 'mdi-format-list-numbered'
        })
      }
      const gallery = ep('gallery')
      if (gallery) {
        output.push({ label: 'Photos', to: gallery, icon: 'mdi-image' })
      }
      if (hasRole('station_manager')) {
        const station = ep('station')
        if (station) {
          output.push({
            label: 'Stations',
            to: station,
            icon: 'mdi-map-marker'
          })
        }
      }
      if (hasRole('admin')) {
        const questionnaire = ep('questionnaire')
        if (questionnaire) {
          output.push({
            label: 'Questionnaires',
            to: questionnaire,
            icon: 'mdi-script-text'
          })
        }
      }
      if (hasRole('admin')) {
        const team = ep('team')
        if (team) {
          output.push({ label: 'Teams', to: team, icon: 'mdi-account-group' })
        }
      }
      if (this.tokenIsAvailable) {
        const uploads = ep('uploads')
        if (uploads) {
          output.push({
            label: 'Uploads',
            to: uploads,
            icon: 'mdi-cloud-upload'
          })
        }
      }
      if (hasRole('admin')) {
        const route = ep('route')
        if (route) {
          output.push({ label: 'Routes', to: route, icon: 'mdi-gesture' })
        }
        const audit = ep('auditlog')
        if (audit) {
          output.push({
            label: 'Audit',
            to: audit,
            icon: 'mdi-receipt-text'
          })
        }
        // Non-event-scoped admin routes — always shown to admins
        output.push({ label: 'Users', to: '/user', icon: 'mdi-face-man' })
        output.push({
          label: 'Events',
          to: '/events',
          icon: 'mdi-calendar-multiple'
        })
      }

      // Non-event-scoped routes — always shown
      output.push({
        label: 'Changelog',
        to: '/changelog',
        icon: 'mdi-information'
      })
      output.push({
        label: 'Manual',
        to: '/manual',
        icon: 'mdi-book'
      })
      return output
    },
    tokenIsAvailable() {
      return Boolean((this as any).session.userName)
    },
    selectedEventName(): string {
      const eventId = this.selectedEventId
      if (!eventId) return ''
      const event = this.events.find((e: EventInfo) => e.id === eventId)
      return event ? event.name : ''
    },
    here() {
      return this.$route.path
    }
  }
})
export default App
</script>
