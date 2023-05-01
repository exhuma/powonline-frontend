import Vue from 'vue'
import VueRouter from 'vue-router'
import RouteList from '@/components/RouteList.vue'
import StationDashboard from '@/components/StationDashboard.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import GlobalDashboard from '@/components/GlobalDashboard.vue'
import StationList from '@/components/StationList.vue'
import TeamList from '@/components/TeamList.vue'
import UserList from '@/components/UserList.vue'
import TeamPanel from '@/components/TeamPanel.vue'
import Changelog from '@/components/Changelog.vue'
import Uploads from '@/components/Uploads.vue'
import Gallery from '@/components/Gallery.vue'
import LiveImage from '@/components/LiveImage.vue'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import AuditLog from '@/components/AuditLog.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.VITE_BASE_URL,
  routes: [
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
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
      path: '/team/:teamName',
      component: TeamPanel
    },
    {
      path: '/dashboard',
      component: GlobalDashboard
    },
    {
      path: '/',
      component: GlobalDashboard
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
      path: '/scoreboard',
      component: ScoreBoard
    },
    {
      path: '/station/:stationName',
      component: StationDashboard
    },
    {
      path: '/team',
      component: TeamList
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
