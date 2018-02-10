import Vue from 'vue'
import Router from 'vue-router'
import RouteList from '@/components/RouteList'
import StationDashboard from '@/components/StationDashboard'
import ScoreBoard from '@/components/ScoreBoard'
import GlobalDashboard from '@/components/GlobalDashboard'
import StationList from '@/components/StationList'
import TeamList from '@/components/TeamList'
import UserList from '@/components/UserList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
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
