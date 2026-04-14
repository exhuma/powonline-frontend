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
import { type Questionnaire } from './model/questionnaire'
import { Team } from './model/team'
import { Route } from './model/route'
import { AssignmentMap } from './model/assignmentMap'
import { QuestionnaireScores } from './model/questionnaireScores'
import { User } from './model/user'
import { DashboardRow } from './model/dashboardRow'
import type { AuditLogRow } from './model/auditLogRow'

export type TimeRange = {
  start: string
  end: string
}

export type EventInfo = {
  id: number
  name: string
  time_range: TimeRange
  inserted?: string | null
  updated?: string | null
}

export type EventMember = {
  user_name: string
  role_name: string
}

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
  fetchAssignments(eventId?: number): Promise<AssignmentMap>
  fetchDashboard(eventId?: number): Promise<DashboardRow[]>
  fetchQuestionnaires(eventId?: number): Promise<Questionnaire[]>
  addQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire>
  updateQuestionnaire(
    oldName: string,
    newData: Questionnaire
  ): Promise<AxiosResponse>
  deleteQuestionnaire(questionnaireName: string): Promise<AxiosResponse>
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
  fetchRoutes(eventId?: number): Promise<Route[]>
  fetchStations(eventId?: number): Promise<Station[]>
  fetchTeam(teamName: string, eventId?: number): Promise<{ name: string }>
  fetchTeams(eventId?: number): Promise<Team[]>
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
  addStationToUser(
    userName: string,
    stationName: string
  ): Promise<AxiosResponse>
  removeStationFromUser(
    userName: string,
    stationName: string
  ): Promise<AxiosResponse>
  removeUserRole(userName: string, roleName: string): Promise<string>
  addUserRole(userName: string, roleName: string): Promise<string>
  fetchAuditLog(): Promise<AuditLogRow[]>
  fetchTeamStations(teamName: string): Promise<Station[]>
  fetchEvents(): Promise<EventInfo[]>
  createEvent(event: {
    name: string
    time_range: TimeRange
  }): Promise<EventInfo>
  updateEvent(
    eventId: number,
    event: {
      name?: string
      time_range?: TimeRange
    }
  ): Promise<EventInfo>
  fetchEventMembers(eventId: number): Promise<EventMember[]>
  addEventMember(eventId: number, member: EventMember): Promise<EventMember>
  removeEventMember(
    eventId: number,
    userName: string,
    roleName: string
  ): Promise<unknown>
  deleteEvent(eventId: number): Promise<unknown>
  fetchTeamsForEvent(eventId: number): Promise<Team[]>
  addTeamForEvent(eventId: number, team: Team): Promise<Team>
  updateTeamForEvent(
    eventId: number,
    teamName: string,
    newData: Team
  ): Promise<unknown>
  deleteTeamForEvent(eventId: number, teamName: string): Promise<unknown>
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
  async fetchQuestionnaires(eventId?: number): Promise<Questionnaire[]> {
    throw new Error('Method not implemented.')
  }
  async addQuestionnaire(questionnaire: Questionnaire): Promise<Questionnaire> {
    throw new Error('Method not implemented.')
  }
  async updateQuestionnaire(
    oldName: string,
    newData: Questionnaire
  ): Promise<AxiosResponse> {
    throw new Error('Method not implemented.')
  }
  async deleteQuestionnaire(questionnaireName: string): Promise<AxiosResponse> {
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

  async deleteQuestionnaire(questionnaireName) {
    return axios.delete(this.baseUrl + '/questionnaire/' + questionnaireName)
  }

  async updateQuestionnaire(oldName, newData) {
    return axios.put(this.baseUrl + '/questionnaire/' + oldName, newData)
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
  async addStationToUser(
    userName: string,
    stationName: string
  ): Promise<AxiosResponse> {
    throw new Error('Method not implemented.')
  }
  async removeStationFromUser(
    userName: string,
    stationName: string
  ): Promise<AxiosResponse> {
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
  async fetchEvents(): Promise<EventInfo[]> {
    return []
  }
  async createEvent(event: {
    name: string
    time_range: TimeRange
  }): Promise<EventInfo> {
    return {
      id: 1,
      name: event.name,
      time_range: event.time_range
    }
  }
  async updateEvent(
    eventId: number,
    event: {
      name?: string
      time_range?: TimeRange
    }
  ): Promise<EventInfo> {
    return {
      id: eventId,
      name: event.name || 'fake-event',
      time_range: event.time_range || { start: '', end: '' }
    }
  }
  async fetchEventMembers(eventId: number): Promise<EventMember[]> {
    return []
  }
  async addEventMember(
    eventId: number,
    member: EventMember
  ): Promise<EventMember> {
    return member
  }
  async removeEventMember(
    eventId: number,
    userName: string,
    roleName: string
  ): Promise<unknown> {
    return {}
  }
  async deleteEvent(eventId: number): Promise<unknown> {
    return {}
  }
  async fetchTeamsForEvent(eventId: number): Promise<Team[]> {
    return this.fetchTeams(eventId)
  }
  async addTeamForEvent(eventId: number, team: Team): Promise<Team> {
    return team
  }
  async updateTeamForEvent(
    eventId: number,
    teamName: string,
    newData: Team
  ): Promise<unknown> {
    return newData
  }
  async deleteTeamForEvent(eventId: number, teamName: string): Promise<unknown> {
    return {}
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
  async fetchQuestionnaireScores(eventId?: number): Promise<QuestionnaireScores> {
    if (!eventId) {
      throw new Error('eventId is required for questionnaire scores')
    }
    return axios
      .get(`${this.baseUrl}/events/${eventId}/questionnaire-scores`)
      .then((response) => {
        return response.data
      })
  }

  async addQuestionnaire(questionnaire: Questionnaire, eventId?: number): Promise<Questionnaire> {
    if (!eventId) {
      throw new Error('eventId is required for questionnaire creation')
    }
    return axios
      .post(`${this.baseUrl}/events/${eventId}/questionnaire`, questionnaire)
      .then(() => {
        return questionnaire
      })
  }

  async updateQuestionnaire(
    oldName: string,
    newData: Questionnaire,
    eventId?: number
  ): Promise<AxiosResponse> {
    if (!eventId) {
      throw new Error('eventId is required for questionnaire update')
    }
    return axios.put(`${this.baseUrl}/events/${eventId}/questionnaire/${oldName}`, newData)
  }

  async deleteQuestionnaire(questionnaireName: string, eventId?: number): Promise<AxiosResponse> {
    if (!eventId) {
      throw new Error('eventId is required for questionnaire deletion')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/questionnaire/${questionnaireName}`)
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

  async setStationScore(stationName, teamName, score, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for station score updates')
    }
    return axios.post(`${this.baseUrl}/events/${eventId}/job`, {
      action: 'set_score',
      args: {
        station_name: stationName,
        team_name: teamName,
        score: score
      }
    })
  }

  async setQuestionnaireScore(stationName, teamName, score, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for questionnaire score updates')
    }
    const payload = {
      action: 'set_questionnaire_score',
      args: {
        station_name: stationName,
        team_name: teamName,
        score: score
      }
    }
    return axios.post(`${this.baseUrl}/events/${eventId}/job`, payload).then((response) => {
      return {
        stationName: stationName,
        teamName: teamName,
        score: parseInt(score, 10)
      }
    })
  }

  async advanceState(stationName, teamName, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required to advance state')
    }
    const payload = {
      action: 'advance',
      args: {
        station_name: stationName,
        team_name: teamName
      }
    }
    return axios.post(`${this.baseUrl}/events/${eventId}/job`, payload).then((response) => {
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

  /**
   * Assign a questionnaire to a station
   */
  async assignQuestionnaireToStation(stationName, questionnaire, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required to assign questionnaire')
    }
    return axios
      .post(
        `${this.baseUrl}/events/${eventId}/station/${stationName}/questionnaires`,
        questionnaire
      )
      .then((response) => {
        return response.data
      })
  }

  /**
   * Unassign a questionnaire from a station
   */
  async unassignQuestionnaireFromStation(questionnaireName, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required to unassign questionnaire')
    }
    return axios
      .delete(`${this.baseUrl}/events/${eventId}/questionnaire/${questionnaireName}/station`)
      .then((response) => {
        return response.data
      })
  }

  async fetchDashboard(eventId?: number): Promise<DashboardRow[]> {
    if (!eventId) {
      throw new Error('eventId is required for dashboard')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/dashboard`).then((response) => {
      return response.data
    })
  }

  async addUser(user) {
    return axios.post(this.baseUrl + '/user', user).then((response) => {
      return user
    })
  }

  async addTeam(team, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for team creation')
    }
    return this.addTeamForEvent(eventId, team)
  }

  async addTeamForEvent(eventId: number, team: Team): Promise<Team> {
    return axios
      .post(`${this.baseUrl}/events/${eventId}/team`, team)
      .then((response) => {
        return response.data
      })
  }

  async addRoute(route, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for route creation')
    }
    return axios.post(`${this.baseUrl}/events/${eventId}/route`, route).then((response) => {
      return route
    })
  }

  async addStation(station, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for station creation')
    }
    return axios.post(`${this.baseUrl}/events/${eventId}/station`, station).then((response) => {
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

  async fetchTeams(eventId?: number): Promise<Team[]> {
    if (!eventId) {
      throw new Error('eventId is required for teams')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/team`).then((response) => {
      return response.data.items
    })
  }

  async fetchTeamsForEvent(eventId: number): Promise<Team[]> {
    return this.fetchTeams(eventId)
  }

  async fetchTeam(teamName: string, eventId?: number): Promise<{ name: string }> {
    if (!eventId) {
      throw new Error('eventId is required for team lookup')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/team/${teamName}`).then((response) => {
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

  async fetchRoutes(eventId?: number): Promise<Route[]> {
    if (!eventId) {
      throw new Error('eventId is required for routes')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/route`).then((response) => {
      return response.data.items
    })
  }

  fetchQuestionnaires(eventId?: number): Promise<Questionnaire[]> {
    if (!eventId) {
      throw new Error('eventId is required for questionnaires')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/questionnaire`).then((response) => {
      return response.data.items
    })
  }

  async fetchStations(eventId?: number): Promise<Station[]> {
    if (!eventId) {
      throw new Error('eventId is required for stations')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/station`).then((response) => {
      return response.data.items
    })
  }

  async fetchAssignments(eventId?: number): Promise<AssignmentMap> {
    if (!eventId) {
      throw new Error('eventId is required for assignments')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/assignments`).then((response) => {
      return response.data
    })
  }

  async addTeamToRoute(route, team, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to assign team to route')
    }
    return axios.post(`${this.baseUrl}/events/${eventId}/route/${route}/teams`, team)
  }

  async unassignTeamFromRoute(route, team, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to unassign team from route')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/route/${route}/teams/${team}`)
  }

  async assignStationToRoute(routeName, station, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to assign station to route')
    }
    return axios.post(
      `${this.baseUrl}/events/${eventId}/route/${routeName}/stations`,
      station
    )
  }

  async unassignStationFromRoute(routeName, stationName, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to unassign station from route')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/route/${routeName}/stations/${stationName}`)
  }

  async deleteRoute(routeName, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to delete route')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/route/${routeName}`)
  }

  async deleteStation(stationName, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to delete station')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/station/${stationName}`)
  }

  async deleteUser(userName): Promise<unknown> {
    return axios.delete(this.baseUrl + '/user/' + userName)
  }

  async deleteTeam(teamName, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required to delete team')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/team/${teamName}`)
  }

  async deleteTeamForEvent(eventId: number, teamName: string): Promise<unknown> {
    return axios.delete(`${this.baseUrl}/events/${eventId}/team/${teamName}`)
  }

  async fetchTeamState(stationName, teamName, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for team state lookup')
    }
    return axios
      .get(`${this.baseUrl}/events/${eventId}/station/${stationName}/teams/${teamName}`)
      .then((response) => {
        return response.data.state
      })
  }

  async fetchTeamStations(teamName: string, eventId?: number): Promise<Station[]> {
    if (!eventId) {
      throw new Error('eventId is required for team stations lookup')
    }
    return axios
      .get(`${this.baseUrl}/events/${eventId}/team/${teamName}/stations`)
      .then((response) => {
        return response.data.items || response.data
      })
  }

  async updateStation(stationName, newData, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for station update')
    }
    return axios
      .put(`${this.baseUrl}/events/${eventId}/station/${stationName}`, newData)
      .then((response) => {
        return response.data
      })
  }

  async updateTeam(teamName, newData, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required for team update')
    }
    return axios
      .put(`${this.baseUrl}/events/${eventId}/team/${teamName}`, newData)
      .then((response) => {
        return response.data
      })
  }

  async updateTeamForEvent(
    eventId: number,
    teamName: string,
    newData: Team
  ): Promise<unknown> {
    return axios
      .put(`${this.baseUrl}/events/${eventId}/team/${teamName}`, newData)
      .then((response) => {
        return response.data
      })
  }

  async fetchEvents(): Promise<EventInfo[]> {
    return axios.get(`${this.baseUrl}/events`).then((response) => {
      return response.data.items
    })
  }

  async createEvent(event: {
    name: string
    time_range: TimeRange
  }): Promise<EventInfo> {
    return axios.post(`${this.baseUrl}/events`, event).then((response) => {
      return response.data
    })
  }

  async updateEvent(
    eventId: number,
    event: {
      name?: string
      time_range?: TimeRange
    }
  ): Promise<EventInfo> {
    return axios
      .put(`${this.baseUrl}/events/${eventId}`, event)
      .then((response) => {
        return response.data
      })
  }

  async fetchEventMembers(eventId: number): Promise<EventMember[]> {
    return axios.get(`${this.baseUrl}/events/${eventId}/members`).then((response) => {
      return response.data.items
    })
  }

  async addEventMember(
    eventId: number,
    member: EventMember
  ): Promise<EventMember> {
    return axios
      .post(`${this.baseUrl}/events/${eventId}/members`, member)
      .then((response) => {
        return response.data
      })
  }

  async removeEventMember(
    eventId: number,
    userName: string,
    roleName: string
  ): Promise<unknown> {
    return axios.delete(
      `${this.baseUrl}/events/${eventId}/members/${userName}/${roleName}`
    )
  }

  async deleteEvent(eventId: number): Promise<unknown> {
    return axios.delete(`${this.baseUrl}/events/${eventId}`)
  }

  async setRouteColor(routeName, newColor, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for route color updates')
    }
    return axios
      .put(`${this.baseUrl}/events/${eventId}/route/${routeName}/color`, { color: newColor })
      .then((response) => {
        return response.data.color
      })
  }

  async sendUpload(file, eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for uploads')
    }
    const formData = new FormData()
    formData.append('file', file)
    return axios
      .post(`${this.baseUrl}/events/${eventId}/upload`, formData, {
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

  async deleteFile(uuid, eventId?: number): Promise<unknown> {
    if (!eventId) {
      throw new Error('eventId is required for file deletion')
    }
    return axios.delete(`${this.baseUrl}/events/${eventId}/upload/${uuid}`).then((response) => {
      return response.data
    })
  }

  async fetchUploads(eventId?: number): Promise<Upload[]> {
    if (!eventId) {
      throw new Error('eventId is required for uploads')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/upload`).then((response) => {
      return response.data
    })
  }

  async getPublicImages(eventId?: number) {
    if (!eventId) {
      throw new Error('eventId is required for public images')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/upload?public=1`).then((response) => {
      return response.data
    })
  }

  async fetchAuditLog(eventId?: number): Promise<AuditLogRow[]> {
    if (!eventId) {
      throw new Error('eventId is required for audit log')
    }
    return axios.get(`${this.baseUrl}/events/${eventId}/auditlog`).then((response) => {
      return response.data
    })
  }

  async fetchRelatedTeams(
    localStationName,
    relation,
    eventId?
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
    if (!eventId) {
      throw new Error('eventId is required for related dashboard data')
    }
    const response = await axios.get(
      `${this.baseUrl}/events/${eventId}/station/${localStationName}/${relation}/dashboard`
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

  async fetchRelatedStation(localStationName, relation, eventId?) {
    if (!eventId) {
      throw new Error('eventId is required for related station lookup')
    }
    const response = await axios.get(
      `${this.baseUrl}/events/${eventId}/station/${localStationName}/related/${relation}`
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
