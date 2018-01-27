import Vue from 'vue'
import Router from 'vue-router'
// TODO import RouteList from '@/components/RouteList'
// TODO import StationDashboard from '@/components/StationDashboard'
// TODO import StationList from '@/components/StationList'
// TODO import TeamList from '@/components/TeamList'
// TODO import UserList from '@/components/UserList'
import HomePage from '@/components/HomePage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: HomePage
    // TODO },
    // TODO {
    // TODO   path: '/station',
    // TODO   component: StationList
    // TODO },
    // TODO {
    // TODO   path: '/station/:stationName',
    // TODO   component: StationDashboard
    // TODO },
    // TODO {
    // TODO   path: '/team',
    // TODO   component: TeamList
    // TODO },
    // TODO {
    // TODO   path: '/route',
    // TODO   component: RouteList
    // TODO },
    // TODO {
    // TODO   path: '/user',
    // TODO   component: UserList
    }
  ]
})
