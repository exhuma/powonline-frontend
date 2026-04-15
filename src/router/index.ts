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

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.VITE_BASE_URL,
  routes: [
    {
      path: '/auth/callback',
      component: AuthCallback
    },
    {
      path: '/auditlog',
      component: AuditLog
    },
    {
      path: '/privacy-policy',
      component: PrivacyPolicy
    },
    {
      path: '/live-image',
      component: LiveImage
    },
    {
      path: '/gallery',
      component: Gallery
    },
    {
      path: '/uploads',
      component: Uploads
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
      path: '/slideshow',
      component: Slideshow
    },
    {
      path: '/team/:teamName',
      component: TeamPanel
    },
    {
      path: '/dashboard',
      component: GlobalDashboard
    },
    {
      path: '/',
      component: HomePage
    },
    {
      path: '/events',
      component: EventManagement
    },
    {
      path: '/matrix',
      component: GlobalDashboard
    },
    {
      path: '/station',
      component: StationList
    },
    {
      path: '/questionnaire',
      component: QuestionnaireList
    },
    {
      path: '/scoreboard',
      component: ScoreBoard
    },
    {
      path: '/station/:stationName',
      component: StationDashboard
    },
    {
      path: '/team',
      component: TeamList,
      name: 'team_list'
    },
    {
      path: '/route',
      component: RouteList
    },
    {
      path: '/user',
      component: UserList
    }
  ]
})

export default router
