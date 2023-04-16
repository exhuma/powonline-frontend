/**
 * Proxy for the remote API
 */
import axios from 'axios'
import Vue from 'vue'
import EventBus from '@/plugins/eventBus'

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
  constructor (baseUrl) {
    this.baseUrl = baseUrl
  }

  renewToken (token) {
    let promise = new Promise((resolve, reject) => {
      let data = {
        status: 200,
        token: 'fake-jwt-token'
      }
      resolve(data)
    })
    return promise
  }

  socialLogin (network, userId, token) {
    let output = new Promise((resolve, reject) => {
      let responseData = {
        'token': 'fake-jwt-token',
        'roles': ['role1'],
        'user': 'fake-user'
      }
      resolve(responseData)
    })
    return output
  }

  loginUser (username, password) {
    let data = {
      status: 200,
      roles: ['role1'],
      token: 'fake-token',
      user: username
    }
    console.log('Fake user login, returning ' + data)
    let promise = new Promise(function (resolve, reject) {
      resolve(data)
    })
    return promise
  }

  setStationScore (stationName, teamName, score) {
    // no-op
  }

  setQuestionnaireScore (stationName, teamName, score) {
    let output = new Promise((resolve, reject) => {
      // no-op
      resolve({})
    })
    return output
  }

  advanceState (stationName, teamName) {
    let output = new Promise((resolve, reject) => {
      resolve({
        team: teamName,
        station: stationName,
        new_state: 'arrived'
      })
    })
    return output
  }

  fetchDashboard () {
    let output = new Promise((resolve, reject) => {
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
    let output = new Promise((resolve, reject) => {
      resolve(newColor)
    })
    return output
  }

  getPublicImages () {
    let output = new Promise((resolve, reject) => {
      let output = []
      resolve(output)
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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

  fetchRoutes () {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
        .then(response => {
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
          let progress = -1
          if (progressEvent.lengthComputable) {
            progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total)
          }
          EventBus.$emit('fileUploadProgress', {
            visible: true,
            progress: progress,
            text: 'Uploading...'
          })
        }
      })
        .then(response => {
          console.debug(response)
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
