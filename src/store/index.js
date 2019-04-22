import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function makeStore (auth, remoteProxy) {
  const store = new Vuex.Store({
    state: {
      users: [],
      stations: [],
      teams: [],
      routes: [],
      questionnaireScores: {}, // map: team -> station -> questionnaireScore
      route_station_map: {}, // map stations to routes (key=stationName, value=routeName)
      route_team_map: {}, // map teams to routes (key=teamName, value=routeName)
      global_dashboard: [],
      teamStates: [],
      jwt: auth.get_token(),
      roles: auth.get_roles(),
      userName: auth.get_username(),
      baseUrl: process.env.BACKEND_URL,
      pageTitle: 'Powonline'
    },
    mutations: {
      /**
      * Sets a new JWT token
      *
      * :param data: An object with two keys:
      *    * token - The JWT token (without "Bearer" prefix)
      *    * roles - A list of role-names which the user has assigned to himself
      */
      setToken (state, data) {
        state.jwt = data['token']
        state.roles = data['roles']
        state.userName = data['userName']
      },

      /**
      * Flag the user as "logged in".
      *
      * :param data: An object with two keys:
      *    * token - The JWT token (without "Bearer" prefix)
      *    * roles - A list of role-names which the user has assigned to himself
      */
      updateUserData (state, data) {
        localStorage.setItem('roles', data['roles'])
        localStorage.setItem('jwt', data['token'])
        localStorage.setItem('userName', data['user'])
        state.jwt = data['token']
        state.roles = data['roles']
        state.userName = data['user']
        console.debug('Set auth token in LS to ' + data['token'])
      },

      /**
      * Flag the user as "logged out"
      */
      clearUserData (state) {
        localStorage.removeItem('jwt')
        localStorage.removeItem('roles')
        localStorage.removeItem('userName')
        state.jwt = ''
        state.roles = []
        console.debug('Successfully logged out user & cleared state')
      },

      /**
      * Change the page title
      *
      * :param title (str): The new page title
      */
      changeTitle (state, title) {
        state.pageTitle = title
      },

      /**
      * Add a new user to the local state
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param user (object): The new user. Thas the same fields as the object
      *     returned from the backend.
      */
      addUser (state, user) {
        state.users.push(user)
      },

      /**
      * Add a new team to the local state
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param team (object): The new team. Thas the same fields as the object
      *     returned from the backend.
      */
      addTeam (state, team) {
        // find the position where we can insert this team (according to the
        // "effectiveStartTime" property)
        let insertPosition = 0
        let foundPosition = false
        for (let [idx, entry] of state.teams.entries()) {
          console.debug(`New team has effectiveStartTime ${team.effective_start_time} entry-time: ${entry.effective_start_time}`)
          if (entry.effective_start_time >= team.effective_start_time) {
            foundPosition = true
            insertPosition = idx
            break
          }
        }
        if (foundPosition) {
          console.debug(`Inserting ${team} at position ${insertPosition}`)
          state.teams.splice(insertPosition, 0, team)
        } else {
          console.debug(`Appending ${team} at end`)
          state.teams.push(team)
        }
        console.debug('teams is now:')
        console.debug(state.teams)
      },

      /**
      * Add a new route to the local state
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param route (object): The new route. Thas the same fields as the object
      *     returned from the backend.
      */
      addRoute (state, route) {
        state.routes.push(route)
      },

      /**
      * Add a new station to the local state
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param station (object): The new station. Thas the same fields as the
      *     object returned from the backend.
      */
      addStation (state, station) {
        // find the position where we can insert this station (according to the
        // "order" property)
        let insertPosition = 0
        let foundPosition = false
        for (let [idx, entry] of state.stations.entries()) {
          if (entry.order >= station.order) {
            console.debug(`New station has order ${station.order} which goes before ${entry.name} with order ${entry.order}`)
            foundPosition = true
            insertPosition = idx
            break
          }
        }
        if (foundPosition) {
          console.debug(`Inserting ${station} at position ${insertPosition}`)
          state.stations.splice(insertPosition, 0, station)
        } else {
          console.debug(`Appending ${station} at end`)
          state.stations.push(station)
        }
        console.debug('Stations is now:')
        console.debug(state.stations)
      },

      /**
      * Replace the teams with a new list of teams
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param leams (array of object): A list containing the replacement teams.
      *     Each list element has the same fields as the team objects returned
      *     from the backend.
      */
      replaceTeams (state, teams) {
        state.teams = teams
      },

      /**
      * Replace the users with a new list of users
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param leams (array of object): A list containing the replacement users.
      *     Each list element has the same fields as the user objects returned
      *     from the backend.
      */
      replaceUsers (state, users) {
        state.users = users
      },

      /**
      * Replace the routes with a new list of routes
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param leams (array of object): A list containing the replacement routes.
      *     Each list element has the same fields as the route objects returned
      *     from the backend.
      */
      replaceRoutes (state, routes) {
        state.routes = routes
      },

      /**
      * Replace the stations with a new list of stations
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param leams (array of object): A list containing the replacement
      *     stations.  Each list element has the same fields as the station
      *     objects returned from the backend.
      */
      replaceStations (state, stations) {
        state.stations = stations
      },

      /**
      * Replace the global dashboard data with new data
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param data: The new dashboard data
      */
      updateGlobalDashboard (state, data) {
        state.global_dashboard = data
      },

      /**
      * Replace the global questionnaire data with new data
      *
      * This is triggered by the completion of a corresponding remote call.
      *
      * :param data: The new dashboard data
      */
      updateQuestionnaireScores (state, data) {
        state.questionnaireScores = data
      },

      /**
      * Replace team-to-route mapping
      *
      * :param assignments: An object as returned by the backend
      */
      replaceAssignments (state, assignments) {
        state.route_team_map = {}
        for (const routeName in assignments.teams) {
          if (assignments.teams.hasOwnProperty(routeName)) {
            const teams = assignments.teams[routeName]
            teams.forEach(team => {
              state.route_team_map[team.name] = routeName
            })
          }
        }

        // Replace stations-to-routes mapping
        state.route_station_map = {}
        for (const routeName in assignments.stations) {
          if (assignments.stations.hasOwnProperty(routeName)) {
            const stations = assignments.stations[routeName]
            stations.forEach(station => {
              const container = state.route_station_map[routeName] || []
              container.push(station)
              state.route_station_map[routeName] = container
            })
          }
        }
      },

      /**
      * Assigns a team to a route
      *
      * :param payload (object): An object with the following keys:
      *    * routeName: The name of the route
      *    * team: Object with the key "name" representing the team name.
      */
      assignTeamToRoute (state, payload) {
        const current = state.route_team_map[payload.routeName]
        if (current === undefined) {
          state.route_team_map[payload.routeName] = [payload.team.name]
        } else {
          state.route_team_map[payload.routeName].push(payload.team.name)
        }
      },

      /**
      * Unassigns a team from a route
      *
      * :param payload (object): An object with the following keys:
      *    * routeName: The name of the route
      *    * teamName: The name of the team to remove
      */
      unassignTeamFromRoute (state, payload) {
        const current = state.route_team_map[payload.routeName]
        if (current === undefined) {
          state.route_team_map[payload.routeName] = []
        } else {
          // XXX TODO implement
        }
      },

      /**
      * Assigns a station to a route
      *
      * :param payload (object): An object with the following keys:
      *    * routeName: The name of the route
      *    * station: An object with the key "name" representing the station
      *      name
      */
      assignStationToRoute (state, payload) {
        const current = state.route_station_map[payload.routeName]
        if (current === undefined) {
          state.route_station_map[payload.routeName] = [payload.station.name]
        } else {
          state.route_station_map[payload.routeName].push(payload.station.name)
        }
      },

      /**
      * Unassigns a station from a route
      *
      * :param payload (object): An object with the following keys:
      *    * routeName: The name of the route
      *    * stationName: The name of the station to remove
      */
      unassignStationFromRoute (state, payload) {
        const current = state.route_station_map[payload.routeName]
        if (current === undefined) {
          state.route_station_map[payload.routeName] = []
        } else {
          // XXX TODO implement
        }
      },

      /**
      * Removes a route
      *
      * :param routeName (str): The name of the route to remove.
      */
      deleteRoute (state, routeName) {
        let idx = -1 // TODO REDDIT there must be a better way than the following loop
        state.routes.forEach(item => {
          if (item.name === routeName) {
            idx = state.routes.indexOf(item)
          }
        })

        if (idx > -1) {
          state.routes.splice(idx, 1)
        }
      },

      /**
      * Removes a station
      *
      * :param stationName (str): The name of the station to remove.
      */
      deleteStation (state, stationName) {
        let idx = -1 // TODO there must be a better way than the following loop
        state.stations.forEach(item => {
          if (item.name === stationName) {
            idx = state.stations.indexOf(item)
          }
        })

        if (idx > -1) {
          state.stations.splice(idx, 1)
        }
      },

      /**
      * Removes a team
      *
      * :param teamName (str): The name of the team to remove.
      */
      deleteTeam (state, teamName) {
        let idx = -1 // TODO there must be a better way than the following loop
        state.teams.forEach(item => {
          if (item.name === teamName) {
            idx = state.teams.indexOf(item)
          }
        })

        if (idx > -1) {
          state.teams.splice(idx, 1)
        }
      },

      /**
      * Removes a user
      *
      * :param userName (str): The name of the user to remove.
      */
      deleteUser (state, userName) {
        let idx = -1 // TODO there must be a better way than the following loop
        state.users.forEach(item => {
          if (item.name === userName) {
            idx = state.users.indexOf(item)
          }
        })

        if (idx > -1) {
          state.users.splice(idx, 1)
        }
      },

      /**
      * Updates station score and/or state for one team at one station locally.
      *
      * :param payload (object): An object with the following keys:
      *    * team: The name of the team
      *    * station: The name of the station
      *    * new_state: The new state (optional)
      *    * new_score: The new score (optional)
      */
      updateTeamState (state, payload) {
        state.global_dashboard.forEach(item => {
          if (item.team === payload.team) {
            item.stations.forEach(stationState => {
              if (stationState.name === payload.station) {
                if (payload.new_state !== undefined) {
                  stationState.state = payload.new_state
                }
                if (payload.new_score !== undefined) {
                  stationState.score = payload.new_score
                }
              }
            })
          }
        })
      },

      /**
      * Updats a teams questionnaire score on a station
      *
      * :param payload (object): An object with the following keys:
      *    * TODO
      */
      setQuestionnaireScore (state, payload) {
        const teamScores = state.questionnaireScores[payload.teamName] || {}
        const stationScores = teamScores[payload.stationName] || {}
        stationScores.score = payload.score
      }

    },
    actions: {
      setStationScore (context, payload) {
        remoteProxy.setStationScore(
          payload.stationName, payload.teamName, payload.score)
      },

      setQuestionnaireScore (context, payload) {
        remoteProxy.setQuestionnaireScore(
          payload.stationName, payload.teamName, payload.score)
          .then(data => {
            context.commit('setQuestionnaireScore', data)
          })
      },

      /**
      * Advance the state of a team on a station
      *
      * :param payload (object): An object with the following keys:
      *     * stationName: The name of the station
      *     * teamName: The name of the team
      */
      advanceState (context, payload) {
        remoteProxy.advanceState(
          payload.stationName, payload.teamName)
          .then(data => {
            store.commit('updateTeamState', data)
          })
      },

      /**
      * Fetch the global questionnaire data
      */
      fetchQuestionnaireScores (context) {
        remoteProxy.fetchQuestionnaireScores().then((data) => {
          context.commit('updateQuestionnaireScores', data)
        })
      },

      /**
      * Add a user to the backend store
      *
      * :param user: The user object to add
      */
      addUserRemote (context, user) {
        remoteProxy.addUser(user).then(data => {
          context.commit('addUser', user)
        })
      },

      /**
      * Add a team to the backend store
      *
      * :param route: The route object to add
      */
      addRouteRemote (context, route) {
        remoteProxy.addRoute(route).then(route => {
          context.commit('addRoute', route)
        })
      },

      /**
      * Add a station to the remote store
      *
      * :param route: The station object to add
      */
      addStationRemote (context, station) {
        remoteProxy.addStation(station).then(station => {
          context.commit('addStation', station)
        })
      },

      /**
      * Refresh everything from the server
      */
      refreshRemote (context) {
        context.dispatch('refreshTeams')
        context.dispatch('refreshRoutes')
        context.dispatch('refreshAssignments')
        context.dispatch('refreshStations')
        context.dispatch('refreshUsers')
        context.dispatch('refreshGlobalDashboard')
      },

      /**
      * Refreshes the local users from the backend
      */
      refreshUsers (context) {
        if (context.state.roles.indexOf('admin') === -1) {
          return
        }
        remoteProxy.fetchUsers().then(users => {
          context.commit('replaceUsers', users)
        })
      },

      /**
      * Refreshes the local teams from the backend
      */
      refreshTeams (context) {
        remoteProxy.fetchTeams().then(teams => {
          context.commit('replaceTeams', teams)
        })
      },

      /**
      * Refreshes the local routes from the backend
      */
      refreshRoutes (context) {
        remoteProxy.fetchRoutes().then(routes => {
          context.commit('replaceRoutes', routes)
        })
      },

      /**
      * Refreshes the local stations from the backend
      */
      refreshStations (context) {
        remoteProxy.fetchStations().then(stations => {
          context.commit('replaceStations', stations)
        })
      },

      /**
      * Refreshes the local assignments from the backend
      */
      refreshAssignments (context) {
        remoteProxy.fetchAssignments().then(assignments => {
          context.commit('replaceAssignments', assignments)
        })
      },

      /**
      * Refreshes the local global dashboard from the backend
      */
      refreshGlobalDashboard (context) {
        remoteProxy.fetchDashboard().then(data => {
          context.commit('updateGlobalDashboard', data)
        })
      },

      /**
      * Assign a team to a route
      *
      * :param data (object): An object with the following keys:
      *     *  team: The team object to add to the route
      *     *  routeName: The name of the route the team should be assigned to
      */
      assignTeamToRouteRemote (context, data) {
        // first, let's find the team object corresponding to this name (yes, I
        // know, a map would be better...)
        let team = null
        context.state.teams.forEach(item => {
          if (item.name === data.teamName) {
            team = item
          }
        })
        remoteProxy.addTeamToRoute(data.routeName, team).then(() => {
          context.commit('assignTeamToRoute', {routeName: data.routeName, team: team})
          context.dispatch('refreshRemote') // TODO Why is this not happening automatically?
        })
      },

      /**
      * Unassign a team from a route
      *
      * :param data (object): An object with the following keys:
      *     * teamName: The name of the team
      *     * routeName: The name of the route the team should be unassigned from
      */
      unassignTeamFromRouteRemote (context, data) {
        remoteProxy.unassignTeamFromRoute(data.routeName, data.teamName).then(() => {
          context.commit('unassignTeamFromRoute', data)
          context.dispatch('refreshRemote') // TODO Why is this not happening automatically?
        })
      },

      /**
      * Assign a station to a route
      *
      * :param data (object): An object with the following keys:
      *     *  station: The station object to add to the route
      *     *  routeName: The name of the route the station should be assigned to
      */
      assignStationToRouteRemote (context, data) {
        // first, let's find the station object corresponding to this name (yes, I
        // know, a map would be better...)
        let station = null
        context.state.stations.forEach(item => {
          if (item.name === data.stationName) {
            station = item
          }
        })
        remoteProxy.assignStationToRoute(data.routeName, station).then(() => {
          context.commit('assignStationToRoute', {routeName: data.routeName, station: station})
          context.dispatch('refreshRemote') // TODO Something causes a non-rective change which is why this is needed. Investigate!
        })
      },

      /**
      * Unassign a station from a route
      *
      * :param data (object): An object with the following keys:
      *     * stationName: The name of the station
      *     * routeName: The name of the route the station should be unassigned from
      */
      unassignStationFromRouteRemote (context, data) {
        remoteProxy.unassignStationFromRoute(data.routeName, data.stationName).then(() => {
          context.commit('unassignStationFromRoute', data)
          context.dispatch('refreshRemote') // TODO Something causes a non-rective change which is why this is needed. Investigate!
        })
      },

      /**
      * Delete a route
      *
      * :param routeName: The name of the route to delete
      */
      deleteRouteRemote (context, routeName) {
        remoteProxy.deleteRoute(routeName).then(() => {
          context.commit('deleteRoute', routeName)
        }).then(() => {
          context.dispatch('refreshAssignments')
        })
      },

      /**
      * Delete a station
      *
      * :param stationName: The name of the station to delete
      */
      deleteStationRemote (context, stationName) {
        remoteProxy.deleteStation(stationName).then(() => {
          context.commit('deleteStation', stationName)
        }).then(() => {
          context.dispatch('refreshAssignments')
        })
      },

      /**
      * Delete a user
      *
      * :param userName: The name of the user to delete
      */
      deleteUserRemote (context, userName) {
        remoteProxy.deleteUser(userName).then(() => {
          context.commit('deleteUser', userName)
        }).then(function () {
          context.dispatch('refreshAssignments')
        })
      },

      /**
      * Delete a team
      *
      * :param teamName: The name of the team to delete
      */
      deleteTeamRemote (context, teamName) {
        remoteProxy.deleteTeam(teamName).then(() => {
          context.commit('deleteTeam', teamName)
        }).then(function () {
          context.dispatch('refreshAssignments')
        })
      }
    },
    getters: {

      /**
      * Get a list of team names which are not assigned to any route
      *
      * :returns: a list of strings
      */
      unassignedTeams (state, getters) {
        // fetch *all* assignments of teams
        const assignedTeams = []
        const map = state.route_team_map
        for (const teamName in map) {
          assignedTeams.push(teamName)
        }

        // now create a list of teams which are *not* in the assigned list
        const output = []
        state.teams.forEach(team => {
          if (assignedTeams.indexOf(team.name) === -1) {
            output.push(team.name)
          }
        })
        return output
      },

      /**
      * Given the name of a route, this returns all team names assigned to that
      * route.
      *
      * :param routeName: The name of the route of which we want to find the
      *     assigned users.
      * :returns: A list of strings
      */
      assignedTeams: (state, getters) => (routeName) => {
        const assignedTeams = []
        const map = state.route_team_map
        for (const teamName in map) {
          if (map[teamName] === routeName) {
            assignedTeams.push(teamName)
          }
        }
        return assignedTeams
      },

      /**
      * Given the name of a route, this returns a list of station names which
      * are not assigned to that route.
      *
      * :param routeName: The name of the route of which we want to list the
      *     unassigned stations.
      * :returns: a list of strings
      */
      unassignedStations: (state, getters) => (routeName) => {
        const unassignedStations = []
        const tmp = state.route_station_map[routeName] || []
        tmp.sort((a, b) => {
          return a.order - b.order
        })
        const assignedStations = []
        tmp.forEach(item => { assignedStations.push(item.name) })

        state.stations.forEach(item => {
          if (assignedStations.indexOf(item.name) === -1) {
            unassignedStations.push(item.name)
          }
        })
        return unassignedStations
      },

      /**
      * Given the name of a route, this returns all stations which are assigned
      * to that route.
      *
      * :param routeName: The name of the route of which we want to list the
      *     assigned stations.
      * :returns: a list of strings
      */
      assignedStations: (state, getters) => (routeName) => {
        const tmp = state.route_station_map[routeName] || []
        tmp.sort((a, b) => {
          return a.order - b.order
        })

        const assignedStations = []
        tmp.forEach(item => { assignedStations.push(item.name) })
        return assignedStations
      }
    }
  })
  return store
}

export default {
  makeStore: makeStore
}
