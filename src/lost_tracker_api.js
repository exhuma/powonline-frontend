class LostTrackerAPI {
  static fetchRoutes() {
    return [{
      name: 'Fake Route 1',
    }, {
      name: 'Fake Route 2',
    }]
  }

  static fetchRouteStationMap(routeName) {
    window.console.debug('Fetching station map for ' + routeName)
      // TODO const output = this.$store.state.route_station_map[this.route.name] || []
    return [{
      name: 'station-2',
      order: 100
    }, {
      name: 'station-start',
      order: 50
    }]
  }

  static fetchGlobalDashboard() {
    const output = [{
      'team': 'team-red',
      'stations': [
        {
          'name': 'station-start',
          'score': 10,
          'state': 'finished'
        },
        {
          'name': 'station-2',
          'score': null,
          'state': 'unknown'
        }
      ]
    }, {
      'team': 'team-2',
      'stations': [
        {
          'name': 'station-start',
          'score': null,
          'state': 'unknown'
        },
        {
          'name': 'station-2',
          'score': null,
          'state': 'unknown'
        }
      ]
    }]
    return output
  }
}

export {
  LostTrackerAPI
}
