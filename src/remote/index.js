/**
 * Proxy for the remote API
 */
import axios from 'axios'
import auth from '@/auth'
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

  renewToken(token) {
    let promise = new Promise((resolve, reject) => {
      let data = {
        status: 200,
        token: 'fake-jwt-token'
      }
      resolve(data)
    })
    return promise
  }

  socialLogin(network, userId, token) {
    let output = new Promise((resolve, reject) => {
      let responseData = {
        token: 'fake-jwt-token',
        roles: ['role1'],
        user: 'fake-user'
      }
      resolve(responseData)
    })
    return output
  }

  loginUser(username, password) {
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

  setStationScore(stationName, teamName, score) {
    // no-op
  }

  setQuestionnaireScore(stationName, teamName, score) {
    let output = new Promise((resolve, reject) => {
      // no-op
      resolve({})
    })
    return output
  }

  advanceState(stationName, teamName) {
    let output = new Promise((resolve, reject) => {
      resolve({
        team: teamName,
        station: stationName,
        new_state: 'arrived'
      })
    })
    return output
  }

  fetchDashboard() {
    let output = new Promise((resolve, reject) => {
      let data = [
        {
          team: 'team-1',
          stations: [{ name: 'station-1', score: 10, state: 'arrived' }]
        },
        {
          team: 'team-2',
          stations: [{ name: 'station-1', score: 20, state: 'unknown' }]
        }
      ]
      resolve(data)
    })
    return output
  }

  setRouteColor(routeName, newColor) {
    let output = new Promise((resolve, reject) => {
      resolve(newColor)
    })
    return output
  }

  getPublicImages() {
    let output = new Promise((resolve, reject) => {
      let output = []
      resolve(output)
    })
    return output
  }
}

class Proxy extends FakeProxy {
  updateOptions(options) {
    const mergedOptions = { ...options }
    const jwt = auth.get_token()
    if (jwt !== '') {
      if (auth.token_expired(jwt)) {
        auth.renewToken(this, jwt)
      }
    }
    if (jwt) {
      mergedOptions.headers = {
        ...mergedOptions.headers,
        Authorization: `Bearer ${jwt}`
      }
    }
    return mergedOptions
  }

  async fetch(url, options) {
    const response = await fetch(url, this.updateOptions(options))
    if (!response.ok) {
      console.error(`Error fetching response: ${response.statusText}`)
    }
    return response
    // TODO? axios.defaults.withCredentials = true
  }

  /**
   * Connect to the back-end to retrieve the questionnaire scores
   */
  async fetchQuestionnaireScores() {
    const response = await this.fetch(this.baseUrl + '/questionnaire-scores')
    const data = await response.json()
    return data
  }

  /**
   * Request a new JTW token using an existing token
   */
  async renewToken(token) {
    const response = await this.fetch(this.baseUrl + '/login/renew', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: token })
    })
    return {
      status: response.status,
      token: response.data.token
    }
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
    const response = await this.fetch(this.baseUrl + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        social_provider: network,
        user_id: userId,
        token: token
      })
    })
    if (!response.ok) {
      throw new Error('Unexpected remote response (' + response.status + ')')
    }
    return response.data
  }

  /**
   * Send a normal login package to the back-end to allow non-social logins.
   */
  async loginUser(username, password) {
    const response = await this.fetch(this.baseUrl + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    if (!response.ok) {
      throw new Error('Unexpected remote response (' + response.status + ')')
    }
    const data = await response.json()
    return {
      status: response.status,
      roles: data['roles'],
      token: data['token'],
      user: data['user']
    }
  }

  async setStationScore(stationName, teamName, score) {
    const response = await this.fetch(this.baseUrl + '/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'set_score',
        args: {
          station_name: stationName,
          team_name: teamName,
          score: score
        }
      })
    })
    return response
  }

  async setQuestionnaireScore(stationName, teamName, score) {
    const response = await this.fetch(this.baseUrl + '/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'set_questionnaire_score',
        args: {
          station_name: stationName,
          team_name: teamName,
          score: score
        }
      })
    })
    // TODO
    console.log({ msg: 'TODO: take values from the response', response })
    return {
      stationName: stationName,
      teamName: teamName,
      score: parseInt(score, 10)
    }
  }

  async advanceState(stationName, teamName) {
    const response = await this.fetch(this.baseUrl + '/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'advance',
        args: {
          station_name: stationName,
          team_name: teamName
        }
      })
    })
    // The server assigned a new state, so we must update our local
    // values
    const newState = response.data.result.state
    const data = {
      team: teamName,
      station: stationName,
      new_state: newState
    }
    return data
  }

  async fetchDashboard() {
    const response = await this.fetch(this.baseUrl + '/dashboard')
    const data = await response.json()
    return data
  }

  async addUser(user) {
    await this.fetch(this.baseUrl + '/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
    return user
  }

  async addTeam(team) {
    await this.fetch(this.baseUrl + '/team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(team)
    })
    return team
  }

  async addRoute(route) {
    await this.fetch(this.baseUrl + '/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(route)
    })
    return route
  }

  async addStation(station) {
    await this.fetch(this.baseUrl + '/station', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(station)
    })
    return station
  }

  async fetchUsers() {
    const response = await this.fetch(this.baseUrl + '/user')
    const data = await response.json()
    return data.items
  }

  async fetchUserStations(userName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/stations'
    )
    const data = response.json()
    return data
  }

  async fetchUserRoles(userName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/roles'
    )
    const data = await response.json()
    return data
  }

  async addUserRole(userName, roleName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/roles',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roleName
        })
      }
    )
    const data = await response.json()
    return data
  }

  async removeUserRole(userName, roleName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/roles/' + roleName,
      {
        method: 'DELETE'
      }
    )
    const data = await response.json()
    return data
  }

  async getUserRole(userName, roleName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/roles/' + roleName
    )
    const data = await response.json()
    return data
  }

  async fetchTeams() {
    const response = await this.fetch(this.baseUrl + '/team')
    const data = await response.json()
    return data.items
  }

  async fetchTeam(teamName) {
    const response = await this.fetch(this.baseUrl + '/team/' + teamName)
    const data = await response.json()
    return data
  }

  async addStationToUser(userName, stationName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/stations',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: stationName
        })
      }
    )
    return response
  }

  async removeStationFromUser(userName, stationName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/stations/' + stationName
    )
    return response
  }

  async fetchAssignedStationState(userName, stationName) {
    const response = await this.fetch(
      this.baseUrl + '/user/' + userName + '/stations/' + stationName
    )
    const data = await response.json()
    return data
  }

  async fetchRoutes() {
    const response = await this.fetch(this.baseUrl + '/route')
    const data = await response.json()
    return data.items
  }

  async fetchStations() {
    const response = await this.fetch(this.baseUrl + '/station')
    const data = await response.json()
    return data.items
  }

  async fetchAssignments() {
    const response = await this.fetch(this.baseUrl + '/assignments')
    const data = await response.json()
    // TODO: Why is this not using ".items"?
    return data
  }

  async addTeamToRoute(route, team) {
    const response = await this.fetch(
      this.baseUrl + '/route/' + route + '/teams',
      {
        method: 'POST',
        body: JSON.stringify(team)
      }
    )
    return response
  }

  async unassignTeamFromRoute(route, team) {
    const response = await this.fetch(
      this.baseUrl + '/route/' + route + '/teams/' + team,
      {
        method: 'DELETE',
        body: JSON.stringify(team)
      }
    )
    return response
  }

  async assignStationToRoute(routeName, station) {
    const response = await this.fetch(
      this.baseUrl + '/route/' + routeName + '/stations',
      {
        method: 'POST',
        body: JSON.stringify(station)
      }
    )
    return response
  }

  async unassignStationFromRoute(routeName, stationName) {
    const response = await this.fetch(
      this.baseUrl + '/route/' + routeName + '/stations/' + stationName,
      { method: 'DELETE' }
    )
    return response
  }

  async deleteRoute(routeName) {
    const response = await this.fetch(this.baseUrl + '/route/' + routeName, {
      method: 'DELETE'
    })
    return response
  }

  async deleteStation(stationName) {
    const response = await this.fetch(
      this.baseUrl + '/station/' + stationName,
      {
        method: 'DELETE'
      }
    )
    return response
  }

  async deleteUser(userName) {
    const response = await this.fetch(this.baseUrl + '/user/' + userName, {
      method: 'DELETE'
    })
    return response
  }

  async deleteTeam(teamName) {
    const response = await this.fetch(this.baseUrl + '/team/' + teamName, {
      method: 'DELETE'
    })
    return response
  }

  async fetchTeamState(stationName, teamName) {
    const response = await this.fetch(
      this.baseUrl + '/station/' + stationName + '/teams/' + teamName
    )
    const data = await response.json()
    return data.state
  }

  async fetchTeamStations(teamName) {
    const response = await this.fetch(
      this.baseUrl + '/team/' + teamName + '/stations'
    )
    const data = await response.json()
    return data.items
  }

  async updateStation(stationName, newData) {
    const response = await this.fetch(
      this.baseUrl + '/station/' + stationName,
      {
        method: 'PUT',
        body: JSON.stringify(newData)
      }
    )
    const data = await response.json()
    return data
  }

  async updateTeam(teamName, newData) {
    const response = await this.fetch(this.baseUrl + '/team/' + teamName, {
      method: 'PUT',
      body: JSON.stringify(newData)
    })
    const data = await response.json()
    return data
  }

  async setRouteColor(routeName, newColor) {
    const response = await this.fetch(
      `${this.baseUrl}/route/${routeName}/color`,
      {
        method: 'PUT',
        body: JSON.stringify({ color: newColor })
      }
    )
    const data = await response.json()
    return data.color
  }

  sendUpload(file) {
    // TODO fetch-progress:
    //   request = ....
    //   request.upload.addEventListener('progress', ...)
    let output = new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      axios
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
          resolve({})
        })
        .catch((e) => {
          reject(e)
        })
    })
    return output
  }

  async deleteFile(uuid) {
    const response = await this.fetch(`${this.baseUrl}/upload/${uuid}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    return data
  }

  async fetchUploads() {
    const response = await this.fetch(`${this.baseUrl}/upload`)
    const data = await response.json()
    return data
  }

  async getPublicImages() {
    const response = await this.fetch(`${this.baseUrl}/upload?public=1`)
    const data = await response.json()
    return data
  }

  async fetchAuditLog() {
    const response = await this.fetch(`${this.baseUrl}/auditlog`)
    const data = await response.json()
    return data
  }

  async fetchRelatedTeams(localStationName, relation) {
    const response = await this.fetch(
      `${this.baseUrl}/station/${localStationName}/${relation}/dashboard`
    )
    const data = await response.json()
    const statePrecedence = {
      unknown: 10,
      arrived: 20,
      finished: 30
    }
    data.sort(
      (a, b) =>
        (statePrecedence[a.state] || 0) > (statePrecedence[b.state] || 0)
    )
    data.map((item) => {
      item.updatedParsed = item.updated ? moment(item.updated) : null
      if (item.updatedParsed) {
        item.updateAge = moment().diff(item.updatedParsed, 'seconds')
      }
    })
    return data
  }

  async fetchRelatedStation(localStationName, relation) {
    const response = await this.fetch(
      `${this.baseUrl}/station/${localStationName}/related/${relation}`
    )
    const data = await response.json()
    return data
  }
}

export default function makeRemoteProxy(fake, backendUrl) {
  let Cls = fake ? FakeProxy : Proxy
  return new Cls(backendUrl)
}
