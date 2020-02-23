import Dashboard from '@/components/Dashboard';
import NotFound from '@/components/NotFound';
import Gallery from '@/components/Gallery';
import Scoreboard from '@/components/Scoreboard';
import StationList from '@/components/StationList';


function getRoutes(userRoles) {
  const output = [
    {
      path: '/matrix',
      label: 'Dashboard',
      icon: 'mdi-border-all',
      component: Dashboard,
      inMenu: true
    },
    {
      path: '/scoreboard',
      label: 'Scoreboard',
      icon: 'mdi-format-list-numbered',
      component: Scoreboard,
      inMenu: true
    },
    {
      path: '/gallery',
      label: 'Photos',
      icon: 'mdi-image',
      component: Gallery,
      inMenu: true
    }
  ]
  if (userRoles.length > 0) {
    output.push({
      path: '/station',
      label: 'Stations',
      icon: 'mdi-map-marker',
      component: StationList,
      inMenu: true
    })
    output.push({
      path: '/team',
      label: 'Teams',
      icon: 'mdi-group',
      component: NotFound,
      inMenu: true
    })
    output.push({
      path: '/uploads',
      label: 'Uploads',
      icon: 'mdi-file-upload',
      component: NotFound,
      inMenu: true
    })
  }
  if (userRoles && userRoles.indexOf('admin') > -1) {
    output.push({
      path: '/route',
      label: 'Routes',
      icon: 'mdi-gesture',
      component: NotFound,
      inMenu: true
    })
    output.push({
      path: '/user',
      label: 'Users',
      icon: 'mdi-face',
      component: NotFound,
      inMenu: true
    })
    output.push({
      path: '/auditlog',
      label: 'Audit',
      icon: 'mdi-receipt',
      component: NotFound,
      inMenu: true
    })
  }
  output.push({
    path: '/changelog',
    label: 'Changelog',
    icon: 'mdi-playlist-check',
    component: NotFound,
    inMenu: true
  })
  return output
}

export {getRoutes}
