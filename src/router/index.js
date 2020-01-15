import Dashboard from '@/components/Dashboard';
import NotFound from '@/components/NotFound';
import WelcomePage from '@/components/WelcomePage';


function getRoutes(userRoles) {
  const output = [
    {
      path: '/matrix',
      label: 'Dashboard',
      icon: 'mdi-border-all',
      component: Dashboard
    },
    {
      path: '/scoreboard',
      label: 'Scoreboard',
      icon: 'mdi-format-list-numbered',
      component: WelcomePage
    },
    {
      path: '/gallery',
      label: 'Photos',
      icon: 'mdi-image',
      component: NotFound
    }
  ]
  if (userRoles.length > 0) {
    output.push({
      path: '/station',
      label: 'Stations',
      icon: 'mdi-place',
      component: NotFound
    })
    output.push({
      path: '/team',
      label: 'Teams',
      icon: 'mdi-group',
      component: NotFound
    })
    output.push({
      path: '/uploads',
      label: 'Uploads',
      icon: 'mdi-cloud_upload',
      component: NotFound
    })
  }
  if (userRoles && userRoles.indexOf('admin') > -1) {
    output.push({
      path: '/route',
      label: 'Routes',
      icon: 'mdi-gesture',
      component: NotFound
    })
    output.push({
      path: '/user',
      label: 'Users',
      icon: 'mdi-face',
      component: NotFound
    })
    output.push({
      path: '/auditlog',
      label: 'Audit',
      icon: 'mdi-receipt',
      component: NotFound
    })
  }
  output.push({ path:
    '/changelog', label:
    'Changelog', icon:
    'mdi-info', component:
    NotFound
  })
  return output
}

export {getRoutes}
