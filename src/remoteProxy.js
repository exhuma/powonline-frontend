/**
 * Proxy for the remote API
 */
import axios from 'axios'
import Vue from 'vue'

const LOG = window.console

// token was created in Python using:
//     import jwt
//     jwt.encode({}, key='supersecret')
//     jwt.encode({
//         'username': 'john.doe',
//         'roles': ['admin'],
//         'iat': 662684400,  # 1991-01-01
//         'exp': 32472140400  # 2999-01-01
//     }, 'supersecret')
const FAKE_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImpvaG4uZG9lIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0Ijo2NjI2ODQ0MDAsImV4cCI6MzI0NzIxNDA0MDB9.4MGvoPOO_394gskFiSa3_hAOQcj5pE3vXKm1byO_jo4'

Vue.mixin({
  beforeCreate () {
    const options = this.$options
    if (options.remoteProxy) {
      this.$remoteProxy = options.remoteProxy
    } else if (options.parent && options.parent.$remoteProxy) {
      this.$remoteProxy = options.parent.$remoteProxy
    }
  }
})

class FakeProxy {
  constructor (baseUrl, eventBus) {
    this.baseUrl = baseUrl
    this.eventBus = eventBus || null
    this.stations = [{
      'name': 'station-starts',
      'contact': 'Example Contact',
      'phone': '12345',
      'is_start': true,
      'is_end': false,
      'order': 0
    }, {
      'name': 'station-1-1',
      'contact': 'Example Contact',
      'phone': '12345',
      'is_start': false,
      'is_end': false,
      'order': 100
    }, {
      'name': 'station-2-1',
      'contact': 'Example Contact',
      'phone': '12345',
      'is_start': false,
      'is_end': false,
      'order': 100
    }]
  }

  deleteStation (stationName) {
    let output = new Promise((resolve) => {
      let idx = this.stations.findIndex(({name}) => name == stationName)
      if (idx == -1) {
        resolve()
      } else {
        this.stations.splice(idx, 1)
        resolve()
      }
    })
    return output
  }

  updateStation (stationName, newData) {
    let output = new Promise((resolve) => {
      let idx = this.stations.findIndex(({name}) => name == stationName)
      if (idx == -1) {
        resolve()
      } else {
        this.stations.splice(idx, 1, newData)
        resolve()
      }
    })
    return output
  }

  addStation (station) {
    let output = new Promise((resolve) => {
      this.stations.push(station)
      resolve(station)
    })
    return output
  }

  /**
   * Connect to the back-end to retrieve the questionnaire scores
   */
  fetchQuestionnaireScores () {
    LOG.debug({msg: 'Fetching Questionnaire scores'})
    let output = new Promise((resolve) => {
      resolve({
        team1: {
          station1: {
            name: 'questionnaire-1',
            score: 10
          }
        }
      })
    })
    return output
  }

  fetchTeams () {
    let output = new Promise((resolve) => {
      resolve([{
        name: 'team-1',
        email: 'team1@example.com',
        order: 100,
        cancelled: false,
        contact: 'John Doe',
        phone: '+352 1234567890',
        comments: 'No comments',
        is_confirmed: true,
        confirmation_key: '',
        accepted: true,
        completed: false,
        inserted: '2010-01-01',
        updated: null,
        num_vegetarians: 1,
        num_participants: 7,
        planned_start_time: '2999-10-10 19:20',
        effective_start_time: '2999-10-10 19:20',
        finish_time: '2999-10-10 22:20',
        route_name: ''
      }, {
        name: 'team-2',
        email: 'team1@example.com',
        order: 100,
        cancelled: false,
        contact: 'John Doe',
        phone: '+352 1234567890',
        comments: 'No comments',
        is_confirmed: true,
        confirmation_key: '',
        accepted: true,
        completed: false,
        inserted: '2010-01-01',
        updated: null,
        num_vegetarians: 1,
        num_participants: 7,
        planned_start_time: '2999-10-10 19:20',
        effective_start_time: '2999-10-10 19:20',
        finish_time: '2999-10-10 22:20',
        route_name: ''
      }])
    })
    return output
  }

  fetchConfig () {
    let output = new Promise((resolve) => {
      resolve({
        hello: null
      })
    })
    return output
  }

  fetchAssignments () {
    let output = new Promise((resolve) => {
      let data = {
        'stations': {
          'Route 1': [
            {name: 'station-start'},
            {name: 'station-1-1'}
          ],
          'Route 2': [
            {name: 'station-2-2'}
          ]
        },
        'teams': {
          'Route 1': [
            {name: 'team-1'}
          ],
          'Route 2': [
            {name: 'team-2'}
          ]
        }
      }
      resolve(data)
    })
    return output
  }

  fetchStations () {
    let output = new Promise((resolve) => {
      resolve(this.stations)
    })
    return output
  }

  /**
   * fetch one station by name
   */
  fetchStation (stationName) {
    let output = new Promise((resolve) => {
      let item = this.stations.find(({name}) => name == stationName)
      resolve(item)
    })
    return output
  }

  fetchRoutes () {
    LOG.debug('Fetching routes')
    let output = new Promise((resolve) => {
      resolve([{
        'name': 'Route 1',
        'color': '#ff0000'
      }, {
        'name': 'Route 2',
        'color': '#ffaa00'
      }])
    })
    return output
  }

  renewToken (token) {
    LOG.debug({msg: 'Refreshing token', token: token})
    let promise = new Promise((resolve) => {
      let data = {
        status: 200,
        token: FAKE_TOKEN
      }
      resolve(data)
    })
    return promise
  }

  socialLogin (network, userId, token) {
    LOG.debug({
      msg: 'Performing social login',
      network: network,
      userId: userId,
      token: token
    })
    let output = new Promise((resolve) => {
      let responseData = {
        'token': FAKE_TOKEN,
        'roles': ['role1'],
        'user': 'fake-user'
      }
      resolve(responseData)
    })
    return output
  }

  loginUser (username, password) {
    LOG.debug({
      msg: 'Performing local login',
      username: username,
      password: password
    })
    let data = {
      status: 200,
      roles: ['role1'],
      token: FAKE_TOKEN,
      user: username
    }
    let promise = new Promise(function (resolve) {
      resolve(data)
    })
    return promise
  }

  setStationScore (stationName, teamName, score) {
    // no-op
    LOG.debug({
      msg: 'Setting station score',
      stationName: stationName,
      teamName: teamName,
      score: score
    })
  }

  setQuestionnaireScore (stationName, teamName, score) {
    let output = new Promise((resolve) => {
      // no-op
      LOG.debug({
        msg: 'Setting questionnaire score',
        stationName: stationName,
        teamName: teamName,
        score: score
      })
      resolve({})
    })
    return output
  }

  advanceState (stationName, teamName) {
    let output = new Promise((resolve) => {
      resolve({
        team: teamName,
        station: stationName,
        new_state: 'arrived'
      })
    })
    return output
  }

  fetchDashboard () {
    let output = new Promise((resolve) => {
      let data = [
        {
          'team': 'team-1',
          'stations': [{'name': 'station-1', 'score': 10, 'state': 'arrived'}]
        }, {
          'team': 'team-2',
          'stations': [{'name': 'station-1', 'score': 20, 'state': 'unknown'}]
        }
      ]
      resolve(data)
    })
    return output
  }

  setRouteColor (routeName, newColor) {
    let output = new Promise((resolve) => {
      resolve(newColor)
    })
    return output
  }

  getPublicImages () {
    let output = new Promise((resolve) => {
      let output = []
      resolve(output)
    })
    return output
  }

  fetchUsers () {
    let output = new Promise((resolve) => {
      let users = [{
        name: "John Doe"
      }]
      resolve(users)
    })
    return output
  }

}

class Proxy extends FakeProxy {
  /**
   * Connect to the back-end to retrieve the questionnaire scores
   */
  fetchQuestionnaireScores () {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/questionnaire-scores')
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  /**
   * Request a new JTW token using an existing token
   */
  renewToken (token) {
    let promise = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/login/renew', {
        'token': token
      }).then(response => {
        let data = {
          status: response.status,
          token: response.data.token
        }
        resolve(data)
      }).catch(e => {
        reject(e)
      })
    })
    return promise
  }

  /**
   * Perform a social login on the back-end
   *
   * This assumes that we've already done a social login on the client-side and
   * hold a token. The back-end will use that token to authenticate the user
   * with the social provider.
   *
   * network: The name of the social network
   * userId: The user-id used by the social network
   * token: The token received from the social network.
   */
  socialLogin (network, userId, token) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/login', {
        'social_provider': network,
        'user_id': userId,
        'token': token
      }).then(response => {
        if (response.status === 200) {
          resolve(response.data)
        } else {
          reject(new Error('Unexpected remote response (' + response.status + ')'))
        }
      }).catch(e => {
        reject(e)
      })
    })
    return output
  }

  /**
   * Send a normal login package to the back-end to allow non-social logins.
   */
  loginUser (username, password) {
    let promise = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/login', {
        'username': username,
        'password': password
      }).then(response => {
        resolve({
          status: response.status,
          roles: response.data['roles'],
          token: response.data['token'],
          user: response.data['user']
        })
      }).catch(e => {
        reject(e)
      })
    })
    return promise
  }

  setStationScore (stationName, teamName, score) {
    return axios.post(this.baseUrl + '/job', {
      'action': 'set_score',
      'args': {
        'station_name': stationName,
        'team_name': teamName,
        'score': score
      }
    })
  }

  setQuestionnaireScore (stationName, teamName, score) {
    let payload = {
      'action': 'set_questionnaire_score',
      'args': {
        'station_name': stationName,
        'team_name': teamName,
        'score': score
      }
    }
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/job', payload)
        .then(() => {
          resolve({
            'stationName': stationName,
            'teamName': teamName,
            'score': parseInt(score, 10)
          })
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  advanceState (stationName, teamName) {
    let payload = {
      'action': 'advance',
      'args': {
        'station_name': stationName,
        'team_name': teamName
      }
    }
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/job', payload)
        .then(response => {
          // The server assigned a new state, so we must update our local
          // values
          const newState = response.data.result.state
          let data = {
            team: teamName,
            station: stationName,
            new_state: newState
          }
          resolve(data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchDashboard () {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/dashboard')
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addUser (user) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/user', user)
        .then(() => {
          resolve(user)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addTeam (team) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/team', team)
        .then(() => {
          resolve(team)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addRoute (route) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/route', route)
        .then(() => {
          resolve(route)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addStation (station) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/station', station)
        .then(() => {
          resolve(station)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchUsers () {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/user')
        .then(response => {
          resolve(response.data.items)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchUserStations (userName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/user/' + userName + '/stations')
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchUserRoles (userName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/user/' + userName + '/roles')
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addUserRole (userName, roleName) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/user/' + userName + '/roles', {
        name: roleName
      }).then(response => {
        resolve(response.data)
      }).catch(e => {
        reject(e)
      })
    })
    return output
  }

  removeUserRole (userName, roleName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/user/' + userName + '/roles/' + roleName)
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  getUserRole (userName, roleName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/user/' + userName + '/roles/' + roleName)
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchTeams () {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/team')
        .then(response => {
          resolve(response.data.items)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchTeam (teamName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/team/' + teamName)
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addStationToUser (userName, stationName) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/user/' + userName + '/stations', {
        name: stationName
      }).then(response => {
        resolve(response)
      }).catch(e => {
        reject(e)
      })
    })
    return output
  }

  removeStationFromUser (userName, stationName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/user/' + userName + '/stations/' + stationName)
        .then(response => {
          resolve(response)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchAssignedStationState (userName, stationName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/user/' + userName + '/stations/' + stationName)
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchConfig () {
    let output = new Promise((resolve, reject) => {
      axios.get('/static/config/config.json')
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchRoutes () {
    LOG.debug('Fetching routes')
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/route')
        .then(response => {
          resolve(response.data.items)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchStations () {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/station')
        .then(response => {
          resolve(response.data.items)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchAssignments () {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/assignments')
        .then(response => {
          resolve(response.data)
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  addTeamToRoute (route, team) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/route/' + route + '/teams', team)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  unassignTeamFromRoute (route, team) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/route/' + route + '/teams/' + team)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  assignStationToRoute (routeName, station) {
    let output = new Promise((resolve, reject) => {
      axios.post(this.baseUrl + '/route/' + routeName + '/stations', station)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  unassignStationFromRoute (routeName, stationName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/route/' + routeName + '/stations/' + stationName)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  deleteRoute (routeName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/route/' + routeName)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  deleteStation (stationName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/station/' + stationName)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  deleteUser (userName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/user/' + userName)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  deleteTeam (teamName) {
    let output = new Promise((resolve, reject) => {
      axios.delete(this.baseUrl + '/team/' + teamName)
        .then(() => {
          resolve()
        }).catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchTeamState (stationName, teamName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/station/' + stationName + '/teams/' + teamName)
        .then(response => {
          resolve(response.data.state)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchTeamStations (teamName) {
    let output = new Promise((resolve, reject) => {
      axios.get(this.baseUrl + '/team/' + teamName + '/stations')
        .then(response => {
          resolve(response.data.items)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  updateStation (stationName, newData) {
    let output = new Promise((resolve, reject) => {
      axios.put(this.baseUrl + '/station/' + stationName, newData)
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  updateTeam (teamName, newData) {
    let output = new Promise((resolve, reject) => {
      axios.put(this.baseUrl + '/team/' + teamName, newData)
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  setRouteColor (routeName, newColor) {
    let output = new Promise((resolve, reject) => {
      axios.put(`${this.baseUrl}/route/${routeName}/color`, {color: newColor})
        .then(response => {
          resolve(response.data.color)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  sendUpload (file) {
    let output = new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      axios.post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (!this.eventBus) {
            return
          }
          let progress = -1
          if (progressEvent.lengthComputable) {
            progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total)
          }
          this.eventBus.$emit('fileUploadProgress', {
            visible: true,
            progress: progress,
            text: 'Uploading...'
          })
        }
      })
        .then(response => {
          LOG.debug(response)
          resolve({})
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  deleteFile (uuid) {
    let output = new Promise((resolve, reject) => {
      axios.delete(`${this.baseUrl}/upload/${uuid}`)
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchUploads () {
    let output = new Promise((resolve, reject) => {
      axios.get(`${this.baseUrl}/upload`)
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  getPublicImages () {
    let output = new Promise((resolve, reject) => {
      axios.get(`${this.baseUrl}/upload?public=1`)
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }

  fetchAuditLog () {
    let output = new Promise((resolve, reject) => {
      axios.get(`${this.baseUrl}/auditlog`)
        .then(response => {
          resolve(response.data)
        })
        .catch(e => {
          reject(e)
        })
    })
    return output
  }
}

export default function makeRemoteProxy (fake, backendUrl) {
  let Cls = (fake ? FakeProxy : Proxy)
  return new Cls(backendUrl)
}
