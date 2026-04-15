import Vue from 'vue'
import VueRouter from 'vue-router'
import RouteList from '@/views/RouteList.vue'
import StationDashboard from '@/views/StationDashboard.vue'
import ScoreBoard from '@/views/ScoreBoard.vue'
import GlobalDashboard from '@/views/GlobalDashboard.vue'
import StationList from '@/views/StationList.vue'
import QuestionnaireList from '@/views/QuestionnaireList.vue'
import TeamList from '@/views/TeamList.vue'
import UserList from '@/views/UserList.vue'
import TeamPanel from '@/views/TeamPanel.vue'
import Changelog from '@/views/Changelog.vue'
import Uploads from '@/views/Uploads.vue'
import Gallery from '@/views/Gallery.vue'
import LiveImage from '@/views/LiveImage.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import AuditLog from '@/views/AuditLog.vue'
import Manual from '@/views/Manual.vue'
import Slideshow from '@/views/Slideshow.vue'
import HomePage from '@/views/HomePage.vue'
import EventManagement from '@/views/EventManagement.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import EventLayout from '@/views/EventLayout.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.VITE_BASE_URL,
  routes: [
    // ── Non-event-scoped routes ──────────────────────────────────────────
    {
      path: '/',
      component: HomePage
    },
    {
      path: '/auth/callback',
      component: AuthCallback
    },
    {
      path: '/events',
      component: EventManagement
    },
    {
      path: '/user',
      component: UserList
    },
    {
      path: '/live-image',
      component: LiveImage
    },
    {
      path: '/changelog',
      component: Changelog
    },
    {
      path: '/manual',
      component: Manual
    },
    {
      path: '/privacy-policy',
      component: PrivacyPolicy
    },

    // ── Event-scoped routes (/event/:eventId/...) ────────────────────────
    {
      path: '/event/:eventId',
      component: EventLayout,
      children: [
        {
          path: 'dashboard',
          component: GlobalDashboard
        },
        {
          path: 'matrix',
          component: GlobalDashboard
        },
        {
          path: 'scoreboard',
          component: ScoreBoard
        },
        {
          path: 'station',
          component: StationList
        },
        {
          path: 'station/:stationName',
          component: StationDashboard
        },
        {
          path: 'team',
          component: TeamList,
          name: 'team_list'
        },
        {
          path: 'team/:teamName',
          component: TeamPanel
        },
        {
          path: 'route',
          component: RouteList
        },
        {
          path: 'questionnaire',
          component: QuestionnaireList
        },
        {
          path: 'auditlog',
          component: AuditLog
        },
        {
          path: 'uploads',
          component: Uploads
        },
        {
          path: 'gallery',
          component: Gallery
        },
        {
          path: 'slideshow',
          component: Slideshow
        }
      ]
    }
  ]
})

// Guard: redirect to / when an event-scoped route is accessed without a valid eventId
router.beforeEach((to, _from, next) => {
  const eventId = to.params.eventId
  if (to.matched.some((record) => record.path.startsWith('/event/:eventId'))) {
    const id = Number(eventId)
    if (!eventId || isNaN(id) || id <= 0) {
      return next('/')
    }
  }
  next()
})

export default router
