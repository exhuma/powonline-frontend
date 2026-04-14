/**
 * Proxy for the remote API
 *
 * All requests use the native fetch API with `credentials: 'include'` so that
 * HttpOnly auth cookies are sent automatically.
 *
 * On a 401 the proxy attempts a single token refresh via POST /auth/refresh.
 * If the refresh also fails the error is propagated to the caller.
 */
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

export type SessionInfo = {
  user: string
  roles: string[]
}

export type AuthProvider = {
  name: string
  label: string
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
  getAuthProviders(): Promise<AuthProvider[]>
  addRoute(route: Route, eventId?: number): Promise<Route>
  addStation(station: Station, eventId?: number): Promise<Station>
  addTeam(team: Team, eventId?: number): Promise<Team>
  addTeamToRoute(routeName: string, team: Team, eventId?: number): Promise<unknown>
  addUser(user: User): Promise<User>
  advanceState(
    stationName: string,
    teamName: string,
    eventId?: number
  ): Promise<{ team: string; station: string; new_state: string }>
  assignStationToRoute(routeName: string, station: Station, eventId?: number): Promise<unknown>
  deleteRoute(routeName: string, eventId?: number): Promise<unknown>
  deleteStation(stationName: string, eventId?: number): Promise<unknown>
  deleteTeam(teamName: string, eventId?: number): Promise<unknown>
  deleteUser(userName: string): Promise<unknown>
  fetchAssignments(eventId?: number): Promise<AssignmentMap>
  fetchDashboard(eventId?: number): Promise<DashboardRow[]>
  fetchQuestionnaires(eventId?: number): Promise<Questionnaire[]>
  addQuestionnaire(questionnaire: Questionnaire, eventId?: number): Promise<Questionnaire>
  updateQuestionnaire(
    oldName: string,
    newData: Questionnaire,
    eventId?: number
  ): Promise<unknown>
  deleteQuestionnaire(questionnaireName: string, eventId?: number): Promise<unknown>
  fetchQuestionnaireScores(eventId?: number): Promise<QuestionnaireScores>
  fetchRelatedStation(stationName: string, relation: string, eventId?: number): Promise<string>
  fetchRelatedTeams(
    localStationName: string,
    relation: string,
    eventId?: number
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
  fetchUploads(eventId?: number): Promise<Upload[]>
  fetchUsers(): Promise<User[]>
  fetchUserRoles(userName: string): Promise<string[]>
  fetchUserStations(userName: string): Promise<[string, boolean][]>
  getPublicImages(eventId?: number): Promise<unknown[]>
  loginUser(username: string, password: string): Promise<SessionInfo>
  setQuestionnaireScore(
    stationName: string,
    teamName: string,
    score: number,
    eventId?: number
  ): Promise<unknown>
  setRouteColor(routeName: string, newColor: string, eventId?: number): Promise<string>
  setStationScore(
    stationName: string,
    teamName: string,
    score: number,
    eventId?: number
  ): Promise<unknown>
  unassignStationFromRoute(
    routeName: string,
    stationName: string,
    eventId?: number
  ): Promise<unknown>
  unassignTeamFromRoute(routeName: string, teamName: string, eventId?: number): Promise<unknown>
  updateTeam(teamName: string, newData: Team, eventId?: number): Promise<unknown>
  deleteFile(uuid: string, eventId?: number): Promise<unknown>
  updateStation(stationName: string, station: Station, eventId?: number): Promise<Station>
  addStationToUser(userName: string, stationName: string): Promise<unknown>
  removeStationFromUser(userName: string, stationName: string): Promise<unknown>
  removeUserRole(userName: string, roleName: string): Promise<string>
  addUserRole(userName: string, roleName: string): Promise<string>
  fetchAuditLog(eventId?: number): Promise<AuditLogRow[]>
  fetchTeamStations(teamName: string, eventId?: number): Promise<Station[]>
  fetchEvents(): Promise<EventInfo[]>
  createEvent(event: { name: string; time_range: TimeRange }): Promise<EventInfo>
  updateEvent(eventId: number, event: { name?: string; time_range?: TimeRange }): Promise<EventInfo>
  fetchEventMembers(eventId: number): Promise<EventMember[]>
  addEventMember(eventId: number, member: EventMember): Promise<EventMember>
  removeEventMember(eventId: number, userName: string, roleName: string): Promise<unknown>
  deleteEvent(eventId: number): Promise<unknown>
  fetchTeamsForEvent(eventId: number): Promise<Team[]>
  addTeamForEvent(eventId: number, team: Team): Promise<Team>
  updateTeamForEvent(eventId: number, teamName: string, newData: Team): Promise<unknown>
  deleteTeamForEvent(eventId: number, teamName: string): Promise<unknown>
  assignQuestionnaireToStation(
    stationName: string,
    questionnaire: Questionnaire,
    eventId?: number
  ): Promise<unknown>
  unassignQuestionnaireFromStation(questionnaireName: string, eventId?: number): Promise<unknown>
}

// ---------------------------------------------------------------------------
// FakeProxy — used when makeRemoteProxy(true, ...)
// ---------------------------------------------------------------------------

class FakeProxy implements Proxy {
  baseUrl: string
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getAuthProviders(): Promise<AuthProvider[]> {
    return [{ name: 'google', label: 'Google' }]
  }
  async deleteFile(_uuid: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async addTeam(_team: Team): Promise<Team> { throw new Error('Method not implemented.') }
  async updateTeam(_teamName: string, _newData: Team): Promise<unknown> { throw new Error('Method not implemented.') }
  async fetchRoutes(): Promise<Route[]> { throw new Error('Method not implemented.') }
  async fetchQuestionnaires(_eventId?: number): Promise<Questionnaire[]> { throw new Error('Method not implemented.') }
  async addQuestionnaire(_questionnaire: Questionnaire): Promise<Questionnaire> { throw new Error('Method not implemented.') }
  async updateQuestionnaire(_oldName: string, _newData: Questionnaire): Promise<unknown> { throw new Error('Method not implemented.') }
  async deleteQuestionnaire(_questionnaireName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async fetchStations(): Promise<Station[]> { throw new Error('Method not implemented.') }
  async fetchUsers(): Promise<User[]> { throw new Error('Method not implemented.') }
  async fetchUserRoles(_userName: string): Promise<string[]> { throw new Error('Method not implemented.') }
  fetchUserStations(_userName: string): Promise<[string, boolean][]> { throw new Error('Method not implemented.') }
  async fetchAssignments(): Promise<AssignmentMap> { throw new Error('Method not implemented.') }
  async fetchTeams(): Promise<Team[]> { throw new Error('Method not implemented.') }
  async fetchQuestionnaireScores(): Promise<QuestionnaireScores> { throw new Error('Method not implemented.') }
  async deleteTeam(_teamName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async deleteUser(_userName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async deleteStation(_stationName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async deleteRoute(_routeName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async addTeamToRoute(_routeName: string, _team: Team): Promise<unknown> { throw new Error('Method not implemented.') }
  async unassignTeamFromRoute(_routeName: string, _teamName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async assignStationToRoute(_routeName: string, _station: Station): Promise<unknown> { throw new Error('Method not implemented.') }
  async addUser(_user: User): Promise<User> { throw new Error('Method not implemented.') }
  async addRoute(_route: Route): Promise<Route> { throw new Error('Method not implemented.') }
  async addStation(_station: Station): Promise<Station> { throw new Error('Method not implemented.') }
  async unassignStationFromRoute(_routeName: string, _stationName: string): Promise<unknown> { throw new Error('Method not implemented.') }
  async assignQuestionnaireToStation(_stationName: string, _questionnaire: Questionnaire): Promise<unknown> { throw new Error('Method not implemented.') }
  async unassignQuestionnaireFromStation(_questionnaireName: string): Promise<unknown> { throw new Error('Method not implemented.') }

  async fetchRelatedStation(_stationName: string, _relation: string): Promise<string> {
    return 'fake-station'
  }

  async fetchRelatedTeams(_localStationName: string, _relation: string) {
    return [{ team: 'fake-team', state: 0, score: 0, updated: '' }]
  }

  install(vue: typeof Vue, _options?: unknown) {
    vue.prototype.$remoteProxy = this
  }

  async loginUser(username: string, _password: string): Promise<SessionInfo> {
    return { user: username, roles: ['role1'] }
  }

  async setStationScore(_stationName: string, _teamName: string, _score: number) {
    return {}
  }

  async setQuestionnaireScore(_stationName: string, _teamName: string, _score: number) {
    return {}
  }

  async advanceState(stationName: string, teamName: string) {
    return { team: teamName, station: stationName, new_state: 'arrived' }
  }

  async fetchDashboard(): Promise<DashboardRow[]> {
    return [
      { team: 'team-1', stations: [{ name: 'station-1', score: 10, state: 'arrived' }] },
      { team: 'team-2', stations: [{ name: 'station-1', score: 20, state: 'unknown' }] }
    ]
  }

  async setRouteColor(_routeName: string, newColor: string) {
    return newColor
  }

  async getPublicImages() {
    return []
  }

  async fetchTeam(teamName: string) {
    return { name: teamName }
  }

  async fetchUploads(): Promise<Upload[]> {
    return []
  }

  async updateStation(_stationName: string, station: Station): Promise<Station> {
    throw new Error('Method not implemented.')
  }

  async addStationToUser(_userName: string, _stationName: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }

  async removeStationFromUser(_userName: string, _stationName: string): Promise<unknown> {
    throw new Error('Method not implemented.')
  }

  async removeUserRole(_userName: string, _roleName: string): Promise<string> {
    throw new Error('Method not implemented')
  }

  async addUserRole(_userName: string, _roleName: string): Promise<string> {
    throw new Error('Method not implemented')
  }

  async fetchAuditLog(): Promise<AuditLogRow[]> {
    throw new Error('Method not implemented')
  }

  async fetchTeamStations(_teamName: string): Promise<Station[]> {
    throw new Error('Method not implemented')
  }

  async fetchEvents(): Promise<EventInfo[]> {
    return []
  }

  async createEvent(event: { name: string; time_range: TimeRange }): Promise<EventInfo> {
    return { id: 1, name: event.name, time_range: event.time_range }
  }

  async updateEvent(eventId: number, event: { name?: string; time_range?: TimeRange }): Promise<EventInfo> {
    return { id: eventId, name: event.name || 'fake-event', time_range: event.time_range || { start: '', end: '' } }
  }

  async fetchEventMembers(_eventId: number): Promise<EventMember[]> { return [] }
  async addEventMember(_eventId: number, member: EventMember): Promise<EventMember> { return member }
  async removeEventMember(_eventId: number, _userName: string, _roleName: string): Promise<unknown> { return {} }
  async deleteEvent(_eventId: number): Promise<unknown> { return {} }
  async fetchTeamsForEvent(eventId: number): Promise<Team[]> { return this.fetchTeams(eventId) }
  async addTeamForEvent(_eventId: number, team: Team): Promise<Team> { return team }
  async updateTeamForEvent(_eventId: number, _teamName: string, newData: Team): Promise<unknown> { return newData }
  async deleteTeamForEvent(_eventId: number, _teamName: string): Promise<unknown> { return {} }
}

// ---------------------------------------------------------------------------
// ConcreteProxy
// ---------------------------------------------------------------------------

class ConcreteProxy implements Proxy {
  baseUrl: string
  private _refreshing: Promise<void> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Core fetch wrapper.
   *
   * On 401 it attempts one refresh then retries the original request.
   * Throws on non-2xx after any retry.
   */
  private async _fetch(input: string, init: RequestInit = {}): Promise<Response> {
    const defaults: RequestInit = { credentials: 'include' }
    const response = await fetch(input, { ...defaults, ...init })

    if (response.status !== 401) {
      return response
    }

    // Attempt refresh (deduplicate concurrent refreshes)
    if (!this._refreshing) {
      this._refreshing = fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      }).then(async (r) => {
        if (!r.ok) throw new Error('refresh_failed')
      }).finally(() => {
        this._refreshing = null
      })
    }

    try {
      await this._refreshing
    } catch {
      // Refresh failed — propagate the original 401
      return response
    }

    // Retry original request
    return fetch(input, { ...defaults, ...init })
  }

  private async _json<T>(input: string, init: RequestInit = {}): Promise<T> {
    const response = await this._fetch(input, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
    })
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      const err: any = new Error(text)
      err.response = { status: response.status, data: text }
      throw err
    }
    return response.json() as Promise<T>
  }

  install(vue: typeof Vue, _options?: unknown) {
    vue.prototype.$remoteProxy = this
  }

  async getAuthProviders(): Promise<AuthProvider[]> {
    return this._json<AuthProvider[]>(`${this.baseUrl}/auth/providers`)
  }

  async loginUser(username: string, password: string): Promise<SessionInfo> {
    return this._json<SessionInfo>(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  }

  async fetchQuestionnaireScores(eventId?: number): Promise<QuestionnaireScores> {
    if (!eventId) throw new Error('eventId is required for questionnaire scores')
    return this._json(`${this.baseUrl}/events/${eventId}/questionnaire-scores`)
  }

  async addQuestionnaire(questionnaire: Questionnaire, eventId?: number): Promise<Questionnaire> {
    if (!eventId) throw new Error('eventId is required for questionnaire creation')
    await this._json(`${this.baseUrl}/events/${eventId}/questionnaire`, {
      method: 'POST',
      body: JSON.stringify(questionnaire)
    })
    return questionnaire
  }

  async updateQuestionnaire(oldName: string, newData: Questionnaire, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required for questionnaire update')
    return this._json(`${this.baseUrl}/events/${eventId}/questionnaire/${oldName}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    })
  }

  async deleteQuestionnaire(questionnaireName: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required for questionnaire deletion')
    return this._json(`${this.baseUrl}/events/${eventId}/questionnaire/${questionnaireName}`, {
      method: 'DELETE'
    })
  }

  async setStationScore(stationName: string, teamName: string, score: number, eventId?: number) {
    if (!eventId) throw new Error('eventId is required for station score updates')
    return this._json(`${this.baseUrl}/events/${eventId}/job`, {
      method: 'POST',
      body: JSON.stringify({ action: 'set_score', args: { station_name: stationName, team_name: teamName, score } })
    })
  }

  async setQuestionnaireScore(stationName: string, teamName: string, score: number, eventId?: number) {
    if (!eventId) throw new Error('eventId is required for questionnaire score updates')
    await this._json(`${this.baseUrl}/events/${eventId}/job`, {
      method: 'POST',
      body: JSON.stringify({ action: 'set_questionnaire_score', args: { station_name: stationName, team_name: teamName, score } })
    })
    return { stationName, teamName, score: parseInt(String(score), 10) }
  }

  async advanceState(stationName: string, teamName: string, eventId?: number) {
    if (!eventId) throw new Error('eventId is required to advance state')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/job`, {
      method: 'POST',
      body: JSON.stringify({ action: 'advance', args: { station_name: stationName, team_name: teamName } })
    })
    return { team: teamName, station: stationName, new_state: data.result.state }
  }

  async assignQuestionnaireToStation(stationName: string, questionnaire: Questionnaire, eventId?: number) {
    if (!eventId) throw new Error('eventId is required to assign questionnaire')
    return this._json(`${this.baseUrl}/events/${eventId}/station/${stationName}/questionnaires`, {
      method: 'POST',
      body: JSON.stringify(questionnaire)
    })
  }

  async unassignQuestionnaireFromStation(questionnaireName: string, eventId?: number) {
    if (!eventId) throw new Error('eventId is required to unassign questionnaire')
    return this._json(`${this.baseUrl}/events/${eventId}/questionnaire/${questionnaireName}/station`, {
      method: 'DELETE'
    })
  }

  async fetchDashboard(eventId?: number): Promise<DashboardRow[]> {
    if (!eventId) throw new Error('eventId is required for dashboard')
    return this._json(`${this.baseUrl}/events/${eventId}/dashboard`)
  }

  async addUser(user: User) {
    await this._json(`${this.baseUrl}/user`, { method: 'POST', body: JSON.stringify(user) })
    return user
  }

  async addTeam(team: Team, eventId?: number): Promise<Team> {
    if (!eventId) throw new Error('eventId is required for team creation')
    return this.addTeamForEvent(eventId, team)
  }

  async addTeamForEvent(eventId: number, team: Team): Promise<Team> {
    return this._json(`${this.baseUrl}/events/${eventId}/team`, {
      method: 'POST',
      body: JSON.stringify(team)
    })
  }

  async addRoute(route: Route, eventId?: number): Promise<Route> {
    if (!eventId) throw new Error('eventId is required for route creation')
    await this._json(`${this.baseUrl}/events/${eventId}/route`, { method: 'POST', body: JSON.stringify(route) })
    return route
  }

  async addStation(station: Station, eventId?: number): Promise<Station> {
    if (!eventId) throw new Error('eventId is required for station creation')
    await this._json(`${this.baseUrl}/events/${eventId}/station`, { method: 'POST', body: JSON.stringify(station) })
    return station
  }

  async fetchUsers(): Promise<User[]> {
    const data: any = await this._json(`${this.baseUrl}/user`)
    return data.items
  }

  async fetchUserStations(userName: string): Promise<[string, boolean][]> {
    return this._json(`${this.baseUrl}/user/${userName}/stations`)
  }

  async fetchUserRoles(userName: string): Promise<string[]> {
    return this._json(`${this.baseUrl}/user/${userName}/roles`)
  }

  async addUserRole(userName: string, roleName: string): Promise<string> {
    return this._json(`${this.baseUrl}/user/${userName}/roles`, {
      method: 'POST',
      body: JSON.stringify({ name: roleName })
    })
  }

  async removeUserRole(userName: string, roleName: string): Promise<string> {
    return this._json(`${this.baseUrl}/user/${userName}/roles/${roleName}`, { method: 'DELETE' })
  }

  async fetchTeams(eventId?: number): Promise<Team[]> {
    if (!eventId) throw new Error('eventId is required for teams')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/team`)
    return data.items
  }

  async fetchTeamsForEvent(eventId: number): Promise<Team[]> {
    return this.fetchTeams(eventId)
  }

  async fetchTeam(teamName: string, eventId?: number): Promise<{ name: string }> {
    if (!eventId) throw new Error('eventId is required for team lookup')
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`)
  }

  async addStationToUser(userName: string, stationName: string): Promise<unknown> {
    return this._json(`${this.baseUrl}/user/${userName}/stations`, {
      method: 'POST',
      body: JSON.stringify({ name: stationName })
    })
  }

  async removeStationFromUser(userName: string, stationName: string): Promise<unknown> {
    return this._json(`${this.baseUrl}/user/${userName}/stations/${stationName}`, { method: 'DELETE' })
  }

  async fetchRoutes(eventId?: number): Promise<Route[]> {
    if (!eventId) throw new Error('eventId is required for routes')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/route`)
    return data.items
  }

  async fetchQuestionnaires(eventId?: number): Promise<Questionnaire[]> {
    if (!eventId) throw new Error('eventId is required for questionnaires')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/questionnaire`)
    return data.items
  }

  async fetchStations(eventId?: number): Promise<Station[]> {
    if (!eventId) throw new Error('eventId is required for stations')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/station`)
    return data.items
  }

  async fetchAssignments(eventId?: number): Promise<AssignmentMap> {
    if (!eventId) throw new Error('eventId is required for assignments')
    return this._json(`${this.baseUrl}/events/${eventId}/assignments`)
  }

  async addTeamToRoute(route: string, team: Team, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to assign team to route')
    return this._json(`${this.baseUrl}/events/${eventId}/route/${route}/teams`, {
      method: 'POST',
      body: JSON.stringify(team)
    })
  }

  async unassignTeamFromRoute(route: string, team: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to unassign team from route')
    return this._json(`${this.baseUrl}/events/${eventId}/route/${route}/teams/${team}`, { method: 'DELETE' })
  }

  async assignStationToRoute(routeName: string, station: Station, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to assign station to route')
    return this._json(`${this.baseUrl}/events/${eventId}/route/${routeName}/stations`, {
      method: 'POST',
      body: JSON.stringify(station)
    })
  }

  async unassignStationFromRoute(routeName: string, stationName: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to unassign station from route')
    return this._json(`${this.baseUrl}/events/${eventId}/route/${routeName}/stations/${stationName}`, { method: 'DELETE' })
  }

  async deleteRoute(routeName: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to delete route')
    return this._json(`${this.baseUrl}/events/${eventId}/route/${routeName}`, { method: 'DELETE' })
  }

  async deleteStation(stationName: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to delete station')
    return this._json(`${this.baseUrl}/events/${eventId}/station/${stationName}`, { method: 'DELETE' })
  }

  async deleteUser(userName: string): Promise<unknown> {
    return this._json(`${this.baseUrl}/user/${userName}`, { method: 'DELETE' })
  }

  async deleteTeam(teamName: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required to delete team')
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`, { method: 'DELETE' })
  }

  async deleteTeamForEvent(eventId: number, teamName: string): Promise<unknown> {
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`, { method: 'DELETE' })
  }

  async fetchTeamStations(teamName: string, eventId?: number): Promise<Station[]> {
    if (!eventId) throw new Error('eventId is required for team stations lookup')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}/stations`)
    return data.items || data
  }

  async updateStation(stationName: string, newData: Station, eventId?: number): Promise<Station> {
    if (!eventId) throw new Error('eventId is required for station update')
    return this._json(`${this.baseUrl}/events/${eventId}/station/${stationName}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    })
  }

  async updateTeam(teamName: string, newData: Team, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required for team update')
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    })
  }

  async updateTeamForEvent(eventId: number, teamName: string, newData: Team): Promise<unknown> {
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    })
  }

  async fetchEvents(): Promise<EventInfo[]> {
    const data: any = await this._json(`${this.baseUrl}/events`)
    return data.items
  }

  async createEvent(event: { name: string; time_range: TimeRange }): Promise<EventInfo> {
    return this._json(`${this.baseUrl}/events`, { method: 'POST', body: JSON.stringify(event) })
  }

  async updateEvent(eventId: number, event: { name?: string; time_range?: TimeRange }): Promise<EventInfo> {
    return this._json(`${this.baseUrl}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    })
  }

  async fetchEventMembers(eventId: number): Promise<EventMember[]> {
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/members`)
    return data.items
  }

  async addEventMember(eventId: number, member: EventMember): Promise<EventMember> {
    return this._json(`${this.baseUrl}/events/${eventId}/members`, {
      method: 'POST',
      body: JSON.stringify(member)
    })
  }

  async removeEventMember(eventId: number, userName: string, roleName: string): Promise<unknown> {
    return this._json(`${this.baseUrl}/events/${eventId}/members/${userName}/${roleName}`, { method: 'DELETE' })
  }

  async deleteEvent(eventId: number): Promise<unknown> {
    return this._json(`${this.baseUrl}/events/${eventId}`, { method: 'DELETE' })
  }

  async setRouteColor(routeName: string, newColor: string, eventId?: number): Promise<string> {
    if (!eventId) throw new Error('eventId is required for route color updates')
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/route/${routeName}/color`, {
      method: 'PUT',
      body: JSON.stringify({ color: newColor })
    })
    return data.color
  }

  async sendUpload(file: File, eventId?: number) {
    if (!eventId) throw new Error('eventId is required for uploads')
    const formData = new FormData()
    formData.append('file', file)
    const response = await this._fetch(`${this.baseUrl}/events/${eventId}/upload`, {
      method: 'POST',
      body: formData
      // No Content-Type header — browser sets multipart boundary automatically
    })
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      throw new Error(text)
    }
    return {}
  }

  async deleteFile(uuid: string, eventId?: number): Promise<unknown> {
    if (!eventId) throw new Error('eventId is required for file deletion')
    return this._json(`${this.baseUrl}/events/${eventId}/upload/${uuid}`, { method: 'DELETE' })
  }

  async fetchUploads(eventId?: number): Promise<Upload[]> {
    if (!eventId) throw new Error('eventId is required for uploads')
    return this._json(`${this.baseUrl}/events/${eventId}/upload`)
  }

  async getPublicImages(eventId?: number): Promise<unknown[]> {
    if (!eventId) throw new Error('eventId is required for public images')
    return this._json(`${this.baseUrl}/events/${eventId}/upload?public=1`)
  }

  async fetchAuditLog(eventId?: number): Promise<AuditLogRow[]> {
    if (!eventId) throw new Error('eventId is required for audit log')
    return this._json(`${this.baseUrl}/events/${eventId}/auditlog`)
  }

  async fetchRelatedTeams(
    localStationName: string,
    relation: string,
    eventId?: number
  ) {
    if (!eventId) throw new Error('eventId is required for related dashboard data')
    const data = await this._json<any[]>(
      `${this.baseUrl}/events/${eventId}/station/${localStationName}/${relation}/dashboard`
    )
    const statePrecedence: Record<string, number> = { unknown: 10, arrived: 20, finished: 30 }
    data.sort((a, b) => (statePrecedence[b.state] || 0) - (statePrecedence[a.state] || 0))
    data.forEach((item) => {
      item.updatedParsed = item.updated ? moment(item.updated) : null
      if (item.updatedParsed) {
        item.updateAge = moment().diff(item.updatedParsed, 'seconds')
      }
    })
    return data
  }

  async fetchRelatedStation(localStationName: string, relation: string, eventId?: number): Promise<string> {
    if (!eventId) throw new Error('eventId is required for related station lookup')
    return this._json(`${this.baseUrl}/events/${eventId}/station/${localStationName}/related/${relation}`)
  }
}

export default function makeRemoteProxy(fake: boolean, backendUrl: string): Proxy {
  const Cls = fake ? FakeProxy : ConcreteProxy
  return new Cls(backendUrl)
}
