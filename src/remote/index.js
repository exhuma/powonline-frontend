/**
 * Proxy for the remote API
 */
import axios from 'axios'
import Vue from 'vue'
import EventBus from '@/plugins/eventBus'
import moment from 'moment'

Vue.mixin({
  beforeCreate() {
    const options = this.$options
    if (options.remoteProxy) {
      this.$remoteProxy = options.remoteProxy
    } else if (options.parent && options.parent.$remoteProxy) {
      this.$remoteProxy = options.parent.$remoteProxy
    }
  }
})

class FakeProxy {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async renewToken(token) {
    return {
      status: 200,
      token: 'fake-jwt-token'
    }
  }

  async socialLogin(network, userId, token) {
    return {
      token: 'fake-jwt-token',
      roles: ['role1'],
      user: 'fake-user'
    }
  }

  async loginUser(username, password) {
    const data = {
      status: 200,
      roles: ['role1'],
      token: 'fake-token',
      user: username
    }
    console.log('Fake user login, returning ' + data)
    return data
  }

  async setStationScore(stationName, teamName, score) {
    // no-op
    return {}
  }

  async setQuestionnaireScore(stationName, teamName, score) {
    // no-op
    return {}
  }

  async advanceState(stationName, teamName) {
    return {
      team: teamName,
      station: stationName,
      new_state: 'arrived'
    }
  }

  async fetchDashboard() {
    return [
      {
        team: 'team-1',
        stations: [{ name: 'station-1', score: 10, state: 'arrived' }]
      },
      {
        team: 'team-2',
        stations: [{ name: 'station-1', score: 20, state: 'unknown' }]
      }
    ]
  }

  async setRouteColor(routeName, newColor) {
    return newColor
  }

  async asyncgetPublicImages() {
    return []
  }
}

class Proxy extends FakeProxy {
  /**
   * Connect to the back-end to retrieve the questionnaire scores
   */
  async fetchQuestionnaireScores() {
    return axios
      .get(this.baseUrl + '/questionnaire-scores')
      .then((response) => {
        return response.data
      })
  }

  /**
   * Request a new JTW token using an existing token
   */
  async renewToken(token) {
    return axios
      .post(this.baseUrl + '/login/renew', {
        token: token
      })
      .then((response) => {
        return {
          status: response.status,
          token: response.data.token
        }
      })
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
  async socialLogin(network, userId, token) {
    return axios
      .post(this.baseUrl + '/login', {
        social_provider: network,
        user_id: userId,
        token: token
      })
      .then((response) => {
        if (response.status === 200) {
          return response.data
        } else {
          throw new Error(
            'Unexpected remote response (' + response.status + ')'
          )
        }
      })
  }

  /**
   * Send a normal login package to the back-end to allow non-social logins.
   */
  async loginUser(username, password) {
    return axios
      .post(this.baseUrl + '/login', {
        username: username,
        password: password
      })
      .then((response) => {
        return {
          status: response.status,
          roles: response.data['roles'],
          token: response.data['token'],
          user: response.data['user']
        }
      })
  }

  async setStationScore(stationName, teamName, score) {
    return axios.post(this.baseUrl + '/job', {
      action: 'set_score',
      args: {
        station_name: stationName,
        team_name: teamName,
        score: score
      }
    })
  }

  async setQuestionnaireScore(stationName, teamName, score) {
    const payload = {
      action: 'set_questionnaire_score',
      args: {
        station_name: stationName,
        team_name: teamName,
        score: score
      }
    }
    return axios.post(this.baseUrl + '/job', payload).then((response) => {
      return {
        stationName: stationName,
        teamName: teamName,
        score: parseInt(score, 10)
      }
    })
  }

  async advanceState(stationName, teamName) {
    const payload = {
      action: 'advance',
      args: {
        station_name: stationName,
        team_name: teamName
      }
    }
    return axios.post(this.baseUrl + '/job', payload).then((response) => {
      // The server assigned a new state, so we must update our local
      // values
      const newState = response.data.result.state
      const data = {
        team: teamName,
        station: stationName,
        new_state: newState
      }
      return data
    })
  }

  async fetchDashboard() {
    return axios.get(this.baseUrl + '/dashboard').then((response) => {
      return response.data
    })
  }

  async addUser(user) {
    return axios.post(this.baseUrl + '/user', user).then((response) => {
      return user
    })
  }

  async addTeam(team) {
    return axios.post(this.baseUrl + '/team', team).then((response) => {
      return team
    })
  }

  async addRoute(route) {
    return axios.post(this.baseUrl + '/route', route).then((response) => {
      return route
    })
  }

  async addStation(station) {
    return axios.post(this.baseUrl + '/station', station).then((response) => {
      return station
    })
  }

  async fetchUsers() {
    return axios.get(this.baseUrl + '/user').then((response) => {
      return response.data.items
    })
  }

  async fetchUserStations(userName) {
    return axios
      .get(this.baseUrl + '/user/' + userName + '/stations')
      .then((response) => {
        return response.data
      })
  }

  async fetchUserRoles(userName) {
    return axios
      .get(this.baseUrl + '/user/' + userName + '/roles')
      .then((response) => {
        return response.data
      })
  }

  async addUserRole(userName, roleName) {
    return axios
      .post(this.baseUrl + '/user/' + userName + '/roles', {
        name: roleName
      })
      .then((response) => {
        return response.data
      })
  }

  async removeUserRole(userName, roleName) {
    return axios
      .delete(this.baseUrl + '/user/' + userName + '/roles/' + roleName)
      .then((response) => {
        return response.data
      })
  }

  async getUserRole(userName, roleName) {
    return axios
      .get(this.baseUrl + '/user/' + userName + '/roles/' + roleName)
      .then((response) => {
        return response.data
      })
  }

  async fetchTeams() {
    return axios.get(this.baseUrl + '/team').then((response) => {
      return response.data.items
    })
  }

  async fetchTeam(teamName) {
    return axios.get(this.baseUrl + '/team/' + teamName).then((response) => {
      return response.data
    })
  }

  async addStationToUser(userName, stationName) {
    return axios
      .post(this.baseUrl + '/user/' + userName + '/stations', {
        name: stationName
      })
      .then((response) => {
        return response
      })
  }

  async removeStationFromUser(userName, stationName) {
    return axios
      .delete(this.baseUrl + '/user/' + userName + '/stations/' + stationName)
      .then((response) => {
        return response
      })
  }

  async fetchAssignedStationState(userName, stationName) {
    return axios
      .get(this.baseUrl + '/user/' + userName + '/stations/' + stationName)
      .then((response) => {
        return response.data
      })
  }

  async fetchRoutes() {
    return axios.get(this.baseUrl + '/route').then((response) => {
      return response.data.items
    })
  }

  async fetchStations() {
    return axios.get(this.baseUrl + '/station').then((response) => {
      return response.data.items
    })
  }

  async fetchAssignments() {
    return axios.get(this.baseUrl + '/assignments').then((response) => {
      return response.data
    })
  }

  async addTeamToRoute(route, team) {
    return axios.post(this.baseUrl + '/route/' + route + '/teams', team)
  }

  async unassignTeamFromRoute(route, team) {
    return axios.delete(this.baseUrl + '/route/' + route + '/teams/' + team)
  }

  async assignStationToRoute(routeName, station) {
    return axios.post(
      this.baseUrl + '/route/' + routeName + '/stations',
      station
    )
  }

  async unassignStationFromRoute(routeName, stationName) {
    return axios.delete(
      this.baseUrl + '/route/' + routeName + '/stations/' + stationName
    )
  }

  async deleteRoute(routeName) {
    return axios.delete(this.baseUrl + '/route/' + routeName)
  }

  async deleteStation(stationName) {
    return axios.delete(this.baseUrl + '/station/' + stationName)
  }

  async deleteUser(userName) {
    return axios.delete(this.baseUrl + '/user/' + userName)
  }

  async deleteTeam(teamName) {
    return axios.delete(this.baseUrl + '/team/' + teamName)
  }

  async fetchTeamState(stationName, teamName) {
    return axios
      .get(this.baseUrl + '/station/' + stationName + '/teams/' + teamName)
      .then((response) => {
        return response.data.state
      })
  }

  async fetchTeamStations(teamName) {
    return axios
      .get(this.baseUrl + '/team/' + teamName + '/stations')
      .then((response) => {
        return response.data.items
      })
  }

  async updateStation(stationName, newData) {
    return axios
      .put(this.baseUrl + '/station/' + stationName, newData)
      .then((response) => {
        return response.data
      })
  }

  async updateTeam(teamName, newData) {
    return axios
      .put(this.baseUrl + '/team/' + teamName, newData)
      .then((response) => {
        return response.data
      })
  }

  async setRouteColor(routeName, newColor) {
    return axios
      .put(`${this.baseUrl}/route/${routeName}/color`, { color: newColor })
      .then((response) => {
        return response.data.color
      })
  }

  async sendUpload(file) {
    const formData = new FormData()
    formData.append('file', file)
    return axios
      .post(`${this.baseUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          let progress = -1
          if (progressEvent.lengthComputable) {
            progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }
          EventBus.$emit('fileUploadProgress', {
            visible: true,
            progress: progress,
            text: 'Uploading...'
          })
        }
      })
      .then((response) => {
        return {}
      })
  }

  async deleteFile(uuid) {
    return axios.delete(`${this.baseUrl}/upload/${uuid}`).then((response) => {
      return response.data
    })
  }

  async fetchUploads() {
    return axios.get(`${this.baseUrl}/upload`).then((response) => {
      return response.data
    })
  }

  async getPublicImages() {
    return axios.get(`${this.baseUrl}/upload?public=1`).then((response) => {
      return response.data
    })
  }

  async fetchAuditLog() {
    return axios.get(`${this.baseUrl}/auditlog`).then((response) => {
      return response.data
    })
  }

  async fetchRelatedTeams(localStationName, relation) {
    const response = await axios.get(
      `${this.baseUrl}/station/${localStationName}/${relation}/dashboard`
    )
    const statePrecedence = {
      unknown: 10,
      arrived: 20,
      finished: 30
    }
    response.data.sort(
      (a, b) =>
        (statePrecedence[a.state] || 0) > (statePrecedence[b.state] || 0)
    )
    response.data.map((item) => {
      item.updatedParsed = item.updated ? moment(item.updated) : null
      if (item.updatedParsed) {
        item.updateAge = moment().diff(item.updatedParsed, 'seconds')
      }
    })
    return response.data
  }

  async fetchRelatedStation(localStationName, relation) {
    const response = await axios.get(
      `${this.baseUrl}/station/${localStationName}/related/${relation}`
    )
    return response.data
  }
}

export default function makeRemoteProxy(fake, backendUrl) {
  const Cls = fake ? FakeProxy : Proxy
  return new Cls(backendUrl)
}
