/**
 * ApiClient — centralised HTTP client for the powonline backend.
 *
 * Construct once (in main.ts) and distribute via Vue 2.7 provide/inject.
 *
 * All requests use the native fetch API with `credentials: 'include'` so that
 * HttpOnly auth cookies are sent automatically.
 *
 * On a 401 the client attempts a single token refresh via POST /auth/refresh.
 * If the refresh also fails the error is propagated to the caller.
 */
import moment from 'moment'
import type { Moment } from 'moment'
import type { Upload } from '@/remote/model/upload'
import type { Station } from '@/remote/model/station'
import type { Questionnaire } from '@/remote/model/questionnaire'
import type { Team } from '@/remote/model/team'
import type { Route } from '@/remote/model/route'
import type { AssignmentMap } from '@/remote/model/assignmentMap'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'
import type { User } from '@/remote/model/user'
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { AuditLogRow } from '@/remote/model/auditLogRow'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

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

export type EventDomain = {
  id: number
  event_id: number
  domain: string
}

export type SessionInfo = {
  user: string
  roles: string[]
}

export type AuthProvider = {
  name: string
  label: string
}

export type RelatedTeamEntry = {
  team: string
  state: number
  score: number
  updated: string
  updatedParsed?: Moment | null
  updateAge?: number
}

// ---------------------------------------------------------------------------
// ApiClient
// ---------------------------------------------------------------------------

export class ApiClient {
  readonly baseUrl: string
  readonly timeoutMs: number
  private _refreshing: Promise<void> | null = null

  constructor(baseUrl: string, timeoutMs = 15_000) {
    this.baseUrl = baseUrl
    this.timeoutMs = timeoutMs
  }

  // -------------------------------------------------------------------------
  // Core fetch helpers
  // -------------------------------------------------------------------------

  /**
   * Wraps fetch with credentials, a configurable timeout, and automatic
   * 401-refresh-retry logic.  If the server does not respond within
   * `timeoutMs` milliseconds the request is aborted and an error is thrown,
   * which lets callers' `finally` blocks run and clears any loading spinners.
   */
  private async _fetch(
    input: string,
    init: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    const defaults: RequestInit = {
      credentials: 'include',
      signal: controller.signal
    }
    let response: Response
    try {
      response = await fetch(input, { ...defaults, ...init })
    } finally {
      clearTimeout(timer)
    }

    if (response.status !== 401) {
      return response
    }

    // Attempt refresh (deduplicate concurrent refreshes)
    if (!this._refreshing) {
      this._refreshing = fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })
        .then(async (r) => {
          if (!r.ok) throw new Error('refresh_failed')
        })
        .finally(() => {
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
    if (response.status === 204) {
      return null as unknown as T
    }
    return response.json() as Promise<T>
  }

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------

  async getAuthProviders(): Promise<AuthProvider[]> {
    return this._json<AuthProvider[]>(`${this.baseUrl}/auth/providers`)
  }

  async loginUser(username: string, password: string): Promise<SessionInfo> {
    return this._json<SessionInfo>(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
  }

  /**
   * Check for an existing backend session. Returns SessionInfo on success,
   * null on 401 (no session).
   */
  async checkSession(): Promise<SessionInfo | null> {
    const res = await this._fetch(`${this.baseUrl}/auth/me`)
    if (res.ok) {
      return res.json() as Promise<SessionInfo>
    }
    return null
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch {
      // ignore network errors during logout
    }
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------

  async fetchEvents(): Promise<EventInfo[]> {
    const data: any = await this._json(`${this.baseUrl}/events`)
    return data.items
  }

  async createEvent(event: {
    name: string
    time_range: TimeRange
  }): Promise<EventInfo> {
    return this._json(`${this.baseUrl}/events`, {
      method: 'POST',
      body: JSON.stringify(event)
    })
  }

  async updateEvent(
    eventId: number,
    event: { name?: string; time_range?: TimeRange }
  ): Promise<EventInfo> {
    return this._json(`${this.baseUrl}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    })
  }

  async deleteEvent(eventId: number): Promise<void> {
    await this._json(`${this.baseUrl}/events/${eventId}`, { method: 'DELETE' })
  }

  async fetchEventMembers(eventId: number): Promise<EventMember[]> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/members`
    )
    return data.items
  }

  async addEventMember(
    eventId: number,
    member: EventMember
  ): Promise<EventMember> {
    return this._json(`${this.baseUrl}/events/${eventId}/members`, {
      method: 'POST',
      body: JSON.stringify(member)
    })
  }

  async removeEventMember(
    eventId: number,
    userName: string,
    roleName: string
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/members/${userName}/${roleName}`,
      { method: 'DELETE' }
    )
  }

  // -------------------------------------------------------------------------
  // Event domains
  // -------------------------------------------------------------------------

  /**
   * Look up the event pinned to a given hostname.
   * Returns null if no mapping exists (404 is treated as a normal "no match").
   */
  async fetchEventByDomain(domain: string): Promise<EventInfo | null> {
    const url = `${this.baseUrl}/domain-lookup?domain=${encodeURIComponent(
      domain
    )}`
    const response = await this._fetch(url, {
      headers: { 'Content-Type': 'application/json' }
    })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`Unexpected status ${response.status}`)
    return response.json()
  }

  async fetchEventDomains(eventId: number): Promise<EventDomain[]> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/domains`
    )
    return data.items
  }

  async addEventDomain(eventId: number, domain: string): Promise<EventDomain> {
    return this._json(`${this.baseUrl}/events/${eventId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ domain })
    })
  }

  async removeEventDomain(eventId: number, domain: string): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/domains/${encodeURIComponent(domain)}`,
      { method: 'DELETE' }
    )
  }

  // -------------------------------------------------------------------------
  // Teams
  // -------------------------------------------------------------------------

  async fetchTeams(eventId: number): Promise<Team[]> {
    const data: any = await this._json(`${this.baseUrl}/events/${eventId}/team`)
    return data.items
  }

  async fetchTeam(teamName: string, eventId: number): Promise<Team> {
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`)
  }

  async addTeam(team: Team, eventId: number): Promise<Team> {
    return this._json(`${this.baseUrl}/events/${eventId}/team`, {
      method: 'POST',
      body: JSON.stringify(team)
    })
  }

  async updateTeam(
    teamName: string,
    newData: Team,
    eventId: number
  ): Promise<Team> {
    return this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`, {
      method: 'PUT',
      body: JSON.stringify(newData)
    })
  }

  async deleteTeam(teamName: string, eventId: number): Promise<void> {
    await this._json(`${this.baseUrl}/events/${eventId}/team/${teamName}`, {
      method: 'DELETE'
    })
  }

  async fetchTeamStations(
    teamName: string,
    eventId: number
  ): Promise<Station[]> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/team/${teamName}/stations`
    )
    return data.items || data
  }

  // -------------------------------------------------------------------------
  // Stations
  // -------------------------------------------------------------------------

  async fetchStations(eventId: number): Promise<Station[]> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/station`
    )
    return data.items
  }

  async addStation(station: Station, eventId: number): Promise<Station> {
    await this._json(`${this.baseUrl}/events/${eventId}/station`, {
      method: 'POST',
      body: JSON.stringify(station)
    })
    return station
  }

  async updateStation(
    stationName: string,
    newData: Station,
    eventId: number
  ): Promise<Station> {
    return this._json(
      `${this.baseUrl}/events/${eventId}/station/${stationName}`,
      {
        method: 'PUT',
        body: JSON.stringify(newData)
      }
    )
  }

  async deleteStation(stationName: string, eventId: number): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/station/${stationName}`,
      {
        method: 'DELETE'
      }
    )
  }

  // -------------------------------------------------------------------------
  // Routes
  // -------------------------------------------------------------------------

  async fetchRoutes(eventId: number): Promise<Route[]> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/route`
    )
    return data.items
  }

  async addRoute(route: Route, eventId: number): Promise<Route> {
    await this._json(`${this.baseUrl}/events/${eventId}/route`, {
      method: 'POST',
      body: JSON.stringify(route)
    })
    return route
  }

  async deleteRoute(routeName: string, eventId: number): Promise<void> {
    await this._json(`${this.baseUrl}/events/${eventId}/route/${routeName}`, {
      method: 'DELETE'
    })
  }

  async setRouteColor(
    routeName: string,
    newColor: string,
    eventId: number
  ): Promise<string> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/route/${routeName}/color`,
      {
        method: 'PUT',
        body: JSON.stringify({ color: newColor })
      }
    )
    return data.color
  }

  // -------------------------------------------------------------------------
  // Assignments
  // -------------------------------------------------------------------------

  async fetchAssignments(eventId: number): Promise<AssignmentMap> {
    return this._json(`${this.baseUrl}/events/${eventId}/assignments`)
  }

  async addTeamToRoute(
    routeName: string,
    team: Team,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/route/${routeName}/teams`,
      {
        method: 'POST',
        body: JSON.stringify(team)
      }
    )
  }

  async unassignTeamFromRoute(
    routeName: string,
    teamName: string,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/route/${routeName}/teams/${teamName}`,
      { method: 'DELETE' }
    )
  }

  async assignStationToRoute(
    routeName: string,
    station: Station,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/route/${routeName}/stations`,
      {
        method: 'POST',
        body: JSON.stringify(station)
      }
    )
  }

  async unassignStationFromRoute(
    routeName: string,
    stationName: string,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/route/${routeName}/stations/${stationName}`,
      { method: 'DELETE' }
    )
  }

  // -------------------------------------------------------------------------
  // Questionnaires
  // -------------------------------------------------------------------------

  async fetchQuestionnaires(eventId: number): Promise<Questionnaire[]> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/questionnaire`
    )
    return data.items
  }

  async addQuestionnaire(
    questionnaire: Questionnaire,
    eventId: number
  ): Promise<Questionnaire> {
    await this._json(`${this.baseUrl}/events/${eventId}/questionnaire`, {
      method: 'POST',
      body: JSON.stringify(questionnaire)
    })
    return questionnaire
  }

  async updateQuestionnaire(
    oldName: string,
    newData: Questionnaire,
    eventId: number
  ): Promise<Questionnaire> {
    return this._json(
      `${this.baseUrl}/events/${eventId}/questionnaire/${oldName}`,
      {
        method: 'PUT',
        body: JSON.stringify(newData)
      }
    )
  }

  async deleteQuestionnaire(
    questionnaireName: string,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/questionnaire/${questionnaireName}`,
      { method: 'DELETE' }
    )
  }

  async fetchQuestionnaireScores(
    eventId: number
  ): Promise<QuestionnaireScores> {
    return this._json(`${this.baseUrl}/events/${eventId}/questionnaire-scores`)
  }

  async assignQuestionnaireToStation(
    stationName: string,
    questionnaire: Questionnaire,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/station/${stationName}/questionnaires`,
      {
        method: 'POST',
        body: JSON.stringify(questionnaire)
      }
    )
  }

  async unassignQuestionnaireFromStation(
    questionnaireName: string,
    eventId: number
  ): Promise<void> {
    await this._json(
      `${this.baseUrl}/events/${eventId}/questionnaire/${questionnaireName}/station`,
      { method: 'DELETE' }
    )
  }

  // -------------------------------------------------------------------------
  // Dashboard / scoring
  // -------------------------------------------------------------------------

  async fetchDashboard(eventId: number): Promise<DashboardRow[]> {
    return this._json(`${this.baseUrl}/events/${eventId}/dashboard`)
  }

  async setStationScore(
    stationName: string,
    teamName: string,
    score: number,
    eventId: number
  ): Promise<number> {
    const result = (await this._json(`${this.baseUrl}/events/${eventId}/job`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'set_score',
        args: { station_name: stationName, team_name: teamName, score }
      })
    })) as { new_score: number }
    return result.new_score
  }

  async setQuestionnaireScore(
    stationName: string,
    teamName: string,
    score: number,
    eventId: number
  ): Promise<{ stationName: string; teamName: string; score: number }> {
    await this._json(`${this.baseUrl}/events/${eventId}/job`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'set_questionnaire_score',
        args: { station_name: stationName, team_name: teamName, score }
      })
    })
    return { stationName, teamName, score: parseInt(String(score), 10) }
  }

  async advanceState(
    stationName: string,
    teamName: string,
    eventId: number
  ): Promise<{ team: string; station: string; new_state: string }> {
    const data: any = await this._json(
      `${this.baseUrl}/events/${eventId}/job`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'advance',
          args: { station_name: stationName, team_name: teamName }
        })
      }
    )
    return {
      team: teamName,
      station: stationName,
      new_state: data.result.state
    }
  }

  // -------------------------------------------------------------------------
  // Related station data (station dashboard)
  // -------------------------------------------------------------------------

  async fetchRelatedTeams(
    localStationName: string,
    relation: string,
    eventId: number
  ): Promise<RelatedTeamEntry[]> {
    const data = await this._json<any[]>(
      `${this.baseUrl}/events/${eventId}/station/${localStationName}/${relation}/dashboard`
    )
    const statePrecedence: Record<string, number> = {
      unknown: 10,
      arrived: 20,
      finished: 30
    }
    data.sort(
      (a, b) =>
        (statePrecedence[b.state] || 0) - (statePrecedence[a.state] || 0)
    )
    data.forEach((item) => {
      item.updatedParsed = item.updated ? moment(item.updated) : null
      if (item.updatedParsed) {
        item.updateAge = moment().diff(item.updatedParsed, 'seconds')
      }
    })
    return data
  }

  async fetchRelatedStation(
    localStationName: string,
    relation: string,
    eventId: number
  ): Promise<string> {
    return this._json(
      `${this.baseUrl}/events/${eventId}/station/${localStationName}/related/${relation}`
    )
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  async fetchUsers(): Promise<User[]> {
    const data: any = await this._json(`${this.baseUrl}/user`)
    return data.items
  }

  async fetchMyAdminEvents(): Promise<EventInfo[]> {
    const data: any = await this._json(`${this.baseUrl}/user/me/admin-events`)
    return data.items
  }

  async addUser(user: User): Promise<User> {
    await this._json(`${this.baseUrl}/user`, {
      method: 'POST',
      body: JSON.stringify(user)
    })
    return user
  }

  async deleteUser(userName: string): Promise<void> {
    await this._json(`${this.baseUrl}/user/${userName}`, { method: 'DELETE' })
  }

  async fetchUserRoles(userName: string): Promise<string[]> {
    return this._json(`${this.baseUrl}/user/${userName}/roles`)
  }

  async addUserRole(userName: string, roleName: string): Promise<void> {
    await this._json(`${this.baseUrl}/user/${userName}/roles`, {
      method: 'POST',
      body: JSON.stringify({ name: roleName })
    })
  }

  async removeUserRole(userName: string, roleName: string): Promise<void> {
    await this._json(`${this.baseUrl}/user/${userName}/roles/${roleName}`, {
      method: 'DELETE'
    })
  }

  async fetchUserStations(
    userName: string,
    eventId?: number
  ): Promise<[string, boolean][]> {
    const url = new URL(`${this.baseUrl}/user/${userName}/stations`)
    if (eventId !== undefined) url.searchParams.set('event_id', String(eventId))
    return this._json(url.toString())
  }

  async addStationToUser(
    userName: string,
    stationName: string,
    eventId?: number
  ): Promise<void> {
    const url = new URL(`${this.baseUrl}/user/${userName}/stations`)
    if (eventId !== undefined) url.searchParams.set('event_id', String(eventId))
    await this._json(url.toString(), {
      method: 'POST',
      body: JSON.stringify({ name: stationName })
    })
  }

  async removeStationFromUser(
    userName: string,
    stationName: string,
    eventId?: number
  ): Promise<void> {
    const url = new URL(
      `${this.baseUrl}/user/${userName}/stations/${stationName}`
    )
    if (eventId !== undefined) url.searchParams.set('event_id', String(eventId))
    await this._json(url.toString(), {
      method: 'DELETE'
    })
  }

  // -------------------------------------------------------------------------
  // Uploads / Gallery
  // -------------------------------------------------------------------------

  async fetchUploads(
    eventId: number
  ): Promise<{ [username: string]: Upload[] }> {
    return this._json(`${this.baseUrl}/events/${eventId}/upload`)
  }

  async sendUpload(file: File, eventId: number): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await this._fetch(
      `${this.baseUrl}/events/${eventId}/upload`,
      {
        method: 'POST',
        body: formData
        // No Content-Type header — browser sets multipart boundary automatically
      }
    )
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText)
      throw new Error(text)
    }
  }

  async deleteFile(uuid: string, eventId: number): Promise<void> {
    await this._json(`${this.baseUrl}/events/${eventId}/upload/${uuid}`, {
      method: 'DELETE'
    })
  }

  async getPublicImages(eventId: number): Promise<unknown[]> {
    return this._json(`${this.baseUrl}/events/${eventId}/upload?public=1`)
  }

  // -------------------------------------------------------------------------
  // Audit log
  // -------------------------------------------------------------------------

  async fetchAuditLog(eventId: number): Promise<AuditLogRow[]> {
    return this._json(`${this.baseUrl}/events/${eventId}/auditlog`)
  }
}

export default ApiClient
