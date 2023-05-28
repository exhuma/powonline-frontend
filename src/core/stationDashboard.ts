import type { Proxy } from '@/remote'
import type { TeamStationState } from './model'
import type {
  ApiDashboardItem,
  ApiRelatedDashboardStationState
} from './apiModel'

/**
 * Set the image classes based on "last update age". The "updateAge" is
 * expressed in seconds
 */
function applyAgeClasses(data: ApiRelatedDashboardStationState[]) {
  // Mark an update as ancient after 2 hours
  const ancient = 2 * 60 * 60
  // Mark an update as ancient after 1 hour
  const old = 1 * 60 * 60
  data.map((item) => {
    if (item.updateAge > ancient || !item.updateAge) {
      item.ageClass = { ancient: true }
    } else if (item.updateAge > old) {
      item.ageClass = { old: true }
    } else {
      item.ageClass = { recent: true }
    }
  })
  data.sort((a, b) => {
    if (a) {
      return 1
    }
    if (a.updateAge > b.updateAge) {
      return -1
    }
    if (a.updateAge < b.updateAge) {
      return 1
    }
    return 0
  })
}

class Peek {
  // XXX states: { state: string; lastUpdate: string; order: number }[]
  states: ApiRelatedDashboardStationState[]
  stationName: string

  constructor(
    stationName?: string,
    states?: ApiRelatedDashboardStationState[]
  ) {
    this.states = states ?? []
    this.stationName = stationName ?? 'unknown'
  }
}

export class StationDashboard {
  peekLeft: Peek
  peekRight: Peek
  name: string
  quickFilter: string
  states: TeamStationState[]

  static async load(
    remote: Proxy,
    stationName: string
  ): Promise<StationDashboard> {
    const dashboard: ApiDashboardItem[] = await remote.fetchDashboard()
    const states: TeamStationState[] = []
    dashboard.forEach((item) => {
      item.stations.forEach((stationState) => {
        if (stationState.name !== stationName) {
          return // skip states from other stations
        }
        if (stationState.state === 'unreachable') {
          // This team cannot reach the current sation (not assigned)
          return
        }
        states.push({
          team: item.team,
          station: stationName,
          state: stationState.state,
          score: stationState.score || 0
        })
      })
    })
    const previousStates: ApiRelatedDashboardStationState[] =
      await remote.fetchRelatedTeams(stationName, 'previous')
    const previousStation: string = await remote.fetchRelatedStation(
      stationName,
      'previous'
    )
    const nextStation: string = await remote.fetchRelatedStation(
      stationName,
      'next'
    )
    const nextStates: ApiRelatedDashboardStationState[] =
      await remote.fetchRelatedTeams(stationName, 'next')
    applyAgeClasses(previousStates)
    applyAgeClasses(nextStates)
    const output = new StationDashboard(
      stationName,
      new Peek(previousStation, previousStates),
      new Peek(nextStation, nextStates),
      states
    )
    return output
  }

  constructor(
    name?: string,
    peekLeft?: Peek,
    peekRight?: Peek,
    states?: TeamStationState[]
  ) {
    this.name = name ?? ''
    this.peekLeft = peekLeft ?? new Peek()
    this.peekRight = peekRight ?? new Peek()
    this.quickFilter = ''
    this.states = states ?? []
  }

  visibleStates(selectedStates: string[]): TeamStationState[] {
    const output = this.states.filter((item) => {
      return selectedStates.includes(item.state)
    })
    return output
  }

  /**
   * Update the state of a team on a station
   *
   * NOTE: This is a workaround because the remote response is bypassing the Vue
   * observers. This happens because the dashboard instance is created at the
   * very bottom and lives isolated from the whole Vue framework. This was
   * caused when isolating business logic from Vue framework logic
   */
  recordNewState(state: {
    team: string
    station: string
    new_state: string
  }): void {
    this.states.forEach((item) => {
      if (item.team == state.team && item.station == state.station) {
        item.state = state.new_state
      }
    })
  }

  /**
   * Update the score of a team on a station
   *
   * NOTE: This is a workaround because the remote response is bypassing the Vue
   * observers. This happens because the dashboard instance is created at the
   * very bottom and lives isolated from the whole Vue framework. This was
   * caused when isolating business logic from Vue framework logic
   */
  recordNewScore(state: {
    team: string
    station: string
    new_score: number
  }): void {
    this.states.forEach((item) => {
      if (item.team == state.team && item.station == state.station) {
        item.score = state.new_score
      }
    })
  }

  /**
   * Update the questionnaire score of a team on a station
   *
   * NOTE: This is a workaround because the remote response is bypassing the Vue
   * observers. This happens because the dashboard instance is created at the
   * very bottom and lives isolated from the whole Vue framework. This was
   * caused when isolating business logic from Vue framework logic
   */
  recordNewQuestionnaireScore(state: {
    stationName: string
    teamName: string
    score: number
  }): void {
    this.states.forEach((item) => {
      if (item.team == state.teamName && item.station == state.stationName) {
        item.questionnaireScore = state.score
      }
    })
  }
}
