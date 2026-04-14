import Vue from 'vue'
import VueRouter from 'vue-router'
import RouteList from '@/components/RouteList.vue'
import StationDashboard from '@/components/StationDashboard.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import GlobalDashboard from '@/components/GlobalDashboard.vue'
import StationList from '@/components/StationList.vue'
import QuestionnaireList from '@/components/QuestionnaireList.vue'
import TeamList from '@/components/TeamList.vue'
import UserList from '@/components/UserList.vue'
import TeamPanel from '@/components/TeamPanel.vue'
import Changelog from '@/components/Changelog.vue'
import Uploads from '@/components/Uploads.vue'
import Gallery from '@/components/Gallery.vue'
import LiveImage from '@/components/LiveImage.vue'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import AuditLog from '@/components/AuditLog.vue'
import Manual from '@/components/Manual.vue'
import Slideshow from '@/components/Slideshow.vue'
import HomePage from '@/components/HomePage.vue'
import EventManagement from '@/components/EventManagement.vue'
import AuthCallback from '@/components/AuthCallback.vue'

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
