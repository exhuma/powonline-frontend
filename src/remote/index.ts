/**
 * Proxy for the remote API
 */
import axios from 'axios'
import type { AxiosResponse } from 'axios'
import Vue from 'vue'
import EventBus from '@/plugins/eventBus'
import moment from 'moment'
import type { Moment } from 'moment'
import { type Upload } from './model/upload'
import { type Station } from './model/station'
import { Team } from './model/team'
import { Route } from './model/route'
import { AssignmentMap } from './model/assignmentMap'
import { QuestionnaireScores } from './model/questionnaireScores'
import { User } from './model/user'
import { DashboardRow } from './model/dashboardRow'
import type { AuditLogRow } from './model/auditLogRow'

Vue.mixin({
  beforeCreate() {
    const options = this.$options as { remoteProxy: Proxy; parent: Vue }
    if (options.remoteProxy) {
      this.$remoteProxy = options.remoteProxy
    } else if (options.parent && options.parent.$remoteProxy) {
      this.$remoteProxy = options.parent.$remoteProxy
    }
  }
})

export interface Proxy {
  renewToken(token: string): Promise<{ status: number; token: string }>
  addRoute(route: Route): Promise<Route>
  addStation(station: Station): Promise<Station>
  addTeam(team: Team): Promise<Team>
  addTeamToRoute(routeName: string, team: Team): Promise<unknown>
  addUser(user: User): Promise<User>
  advanceState(
    stationName: string,
    teamName: string
  ): Promise<{ team: string; station: string; new_state: string }>
  assignStationToRoute(routeName: string, station: Station): Promise<unknown>
  deleteRoute(routeName: string): Promise<unknown>
  deleteStation(stationName: string): Promise<unknown>
  deleteTeam(teamName: string): Promise<unknown>
  deleteUser(userName: string): Promise<unknown>
  fetchAssignments(): Promise<AssignmentMap>
  fetchDashboard(): Promise<DashboardRow[]>
  fetchQuestionnaireScores(): Promise<QuestionnaireScores>
  fetchRelatedStation(stationName: string, relation: string): Promise<string>
  fetchRelatedTeams(
    localStationName: string,
    relation: string
  ): Promise<
    {
      team: string
      state: number
      score: number
      updated: string
      updatedParsed?: Moment | null
      updateAge?: number
    }[]
  >
  fetchRoutes(): Promise<Route[]>
  fetchStations(): Promise<Station[]>
  fetchTeam(teamName: string): Promise<{ name: string }>
  fetchTeams(): Promise<Team[]>
  fetchUploads(): Promise<Upload[]>
  fetchUsers(): Promise<User[]>
  fetchUserRoles(userName: string): Promise<string[]>
  fetchUserStations(userName: string): Promise<[string, boolean][]>
  getPublicImages(): Promise<unknown[]>
  loginUser(
    username: string,
    password: string
  ): Promise<{ status: number; roles: string[]; token: string; user: string }>
  setQuestionnaireScore(
    stationName: string,
    teamName: string,
    score: number
  ): Promise<unknown>
  setRouteColor(routeName: string, newColor: string): Promise<string>
  setStationScore(
    stationName: string,
    teamName: string,
    score: number
  ): Promise<unknown>
  socialLogin(
    network: string,
    userId: string,
    token: string
  ): Promise<{ token: string; roles: string[]; user: string }>
  unassignStationFromRoute(
    routeName: string,
    stationName: string
  ): Promise<unknown>
  unassignTeamFromRoute(routeName: string, teamName: string): Promise<unknown>
  updateTeam(teamName: string, newData: Team): Promise<unknown>
  deleteFile(uuid: string): Promise<unknown>
  updateStation(stationName: string, station: Station): Promise<Station>
  addStationToUser(userName: string, stationName: string): Promise<AxiosResponse>
  removeStationFromUser(userName: string, stationName: string): Promise<AxiosResponse>
  removeUserRole(userName: string, roleName: string): Promise<string>
  addUserRole(userName: string, roleName: string): Promise<string>
  fetchAuditLog(): Promise<AuditLogRow[]>
  fetchTeamStations(teamName: string): Promise<Station[]>
}

class FakeProxy implements Proxy {
  baseUrl: string
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }
  async deleteFile(uuid: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async addTeam(team: Team): Promise<Team> {
    throw new Error('Method not implemented.')
  }
  async updateTeam(teamName: string, newData: Team): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async fetchRoutes(): Promise<Route[]> {
    throw new Error('Method not implemented.')
  }
  async fetchStations(): Promise<Station[]> {
    throw new Error('Method not implemented.')
  }
  async fetchUsers(): Promise<User[]> {
    throw new Error('Method not implemented.')
  }
  async fetchUserRoles(userName: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  fetchUserStations(userName: string): Promise<[string, boolean][]> {
    throw new Error('Method not implemented.')
  }
  async fetchAssignments(): Promise<AssignmentMap> {
    throw new Error('Method not implemented.')
  }
  async fetchTeams(): Promise<Team[]> {
    throw new Error('Method not implemented.')
  }
  async fetchQuestionnaireScores(): Promise<QuestionnaireScores> {
    throw new Error('Method not implemented.')
  }
  async deleteTeam(teamName: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async deleteUser(userName: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async deleteStation(stationName: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async deleteRoute(routeName: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async addTeamToRoute(routeName: string, team: Team): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async unassignTeamFromRoute(
    routeName: string,
    teamName: string
  ): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async assignStationToRoute(
    routeName: string,
    station: Station
  ): Promise<unknown> {
    throw new Error('Method not implemented.')
  }
  async addUser(user: User): Promise<User> {
    throw new Error('Method not implemented.')
  }
  async addRoute(route: Route): Promise<Route> {
    throw new Error('Method not implemented.')
  }
  async addStation(station: Station): Promise<Station> {
    throw new Error('Method not implemented.')
  }
  async unassignStationFromRoute(
    routeName: string,
    stationName: string
  ): Promise<unknown> {
    throw new Error('Method not implemented.')
  }

  async fetchRelatedStation(
    stationName: string,
    relation: string
  ): Promise<string> {
    return 'fake-station'
  }

  async fetchRelatedTeams(
    localStationName: string,
    relation: string
  ): Promise<
    {
      team: string
      state: number
      score: number
      updated: string
      updatedParsed?: Moment | null
      updateAge?: number
    }[]
  > {
    return [
      {
        team: 'fake-team',
        state: 0,
        score: 0,
        updated: ''
      }
    ]
  }

  install(vue: typeof Vue, options?: any) {
    vue.prototype.$remoteProxy = this
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

  async fetchDashboard(): Promise<DashboardRow[]> {
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

  async getPublicImages() {
    return []
  }

  async fetchTeam(teamName) {
    return { name: teamName }
  }

  async fetchUploads(): Promise<Upload[]> {
    return []
  }
  async updateStation(stationName: string, station: Station): Promise<Station> {
    throw new Error('Method not implemented.')
  }
  async addStationToUser(userName: string, stationName: string): Promise<AxiosResponse> {
    throw new Error('Method not implemented.')
  }
  async removeStationFromUser(userName: string, stationName: string): Promise<AxiosResponse> {
    throw new Error('Method not implemented.')
  }
  async removeUserRole(userName: string, roleName: string): Promise<string> {
    throw new Error('Method not implemented')
  }
  async addUserRole(userName: string, roleName: string): Promise<string> {
    throw new Error('Method not implemented')
  }
  async fetchAuditLog(): Promise<AuditLogRow[]> {
    throw new Error('Method not implemented')
  }
  async fetchTeamStations(teamName: string): Promise<Station[]> {
    throw new Error('Method not implemented')
  }

}

class ConcreteProxy implements Proxy {
  baseUrl: string

  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  /**
   * Connect to the back-end to retrieve the questionnaire scores
   */
  async fetchQuestionnaireScores(): Promise<QuestionnaireScores> {
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

  async fetchDashboard(): Promise<DashboardRow[]> {
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

  async fetchUserStations(userName: string): Promise<[string, boolean][]> {
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

  async addUserRole(userName: string, roleName: string): Promise<string> {
    return axios
      .post(this.baseUrl + '/user/' + userName + '/roles', {
        name: roleName
      })
      .then((response) => {
        return response.data
      })
  }

  async removeUserRole(userName: string, roleName: string): Promise<string> {
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

  async fetchAssignments(): Promise<AssignmentMap> {
    return axios.get(this.baseUrl + '/assignments').then((response) => {
      return response.data
    })
  }

  async addTeamToRoute(route, team): Promise<unknown> {
    return axios.post(this.baseUrl + '/route/' + route + '/teams', team)
  }

  async unassignTeamFromRoute(route, team): Promise<unknown> {
    return axios.delete(this.baseUrl + '/route/' + route + '/teams/' + team)
  }

  async assignStationToRoute(routeName, station): Promise<unknown> {
    return axios.post(
      this.baseUrl + '/route/' + routeName + '/stations',
      station
    )
  }

  async unassignStationFromRoute(routeName, stationName): Promise<unknown> {
    return axios.delete(
      this.baseUrl + '/route/' + routeName + '/stations/' + stationName
    )
  }

  async deleteRoute(routeName): Promise<unknown> {
    return axios.delete(this.baseUrl + '/route/' + routeName)
  }

  async deleteStation(stationName): Promise<unknown> {
    return axios.delete(this.baseUrl + '/station/' + stationName)
  }

  async deleteUser(userName): Promise<unknown> {
    return axios.delete(this.baseUrl + '/user/' + userName)
  }

  async deleteTeam(teamName): Promise<unknown> {
    return axios.delete(this.baseUrl + '/team/' + teamName)
  }

  async fetchTeamState(stationName, teamName) {
    return axios
      .get(this.baseUrl + '/station/' + stationName + '/teams/' + teamName)
      .then((response) => {
        return response.data.state
      })
  }

  async fetchTeamStations(teamName: string): Promise<Station[]> {
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

  async updateTeam(teamName, newData): Promise<unknown> {
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

  async deleteFile(uuid): Promise<unknown> {
    return axios.delete(`${this.baseUrl}/upload/${uuid}`).then((response) => {
      return response.data
    })
  }

  async fetchUploads(): Promise<Upload[]> {
    return axios.get(`${this.baseUrl}/upload`).then((response) => {
      return response.data
    })
  }

  async getPublicImages() {
    return axios.get(`${this.baseUrl}/upload?public=1`).then((response) => {
      return response.data
    })
  }

  async fetchAuditLog(): Promise<AuditLogRow[]> {
    return axios.get(`${this.baseUrl}/auditlog`).then((response) => {
      return response.data
    })
  }

  async fetchRelatedTeams(
    localStationName,
    relation
  ): Promise<
    {
      team: string
      state: number
      score: number
      updated: string
      updatedParsed?: Moment | null
      updateAge?: number
    }[]
  > {
    const response = await axios.get(
      `${this.baseUrl}/station/${localStationName}/${relation}/dashboard`
    )
    const statePrecedence = {
      unknown: 10,
      arrived: 20,
      finished: 30
    }
    const data = response.data as {
      team: string
      state: number
      score: number
      updated: string
      updatedParsed?: Moment | null
      updateAge?: number
    }[]
    data.sort(
      (a, b) =>
        (statePrecedence[b.state] || 0) - (statePrecedence[a.state] || 0)
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
    const response = await axios.get(
      `${this.baseUrl}/station/${localStationName}/related/${relation}`
    )
    return response.data
  }
}

export default function makeRemoteProxy(
  fake: boolean,
  backendUrl: string
): Proxy {
  const Cls = fake ? FakeProxy : ConcreteProxy
  return new Cls(backendUrl)
}
