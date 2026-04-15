import Pusher from 'pusher-js'
import type { ApiClient } from './api'

type EventConfig = {
  key: string
  debug: boolean
  teamChannel: string
  fileChannel: string
}

export type RealtimeCallbacks = {
  /** Called when a team's state or score changes at a station */
  onTeamStateChange: (data: {
    team: string
    station: string
    new_state?: string
    new_score?: number
  }) => void
  /** Called when a team's questionnaire score changes */
  onQuestionnaireScoreChange: (data: {
    teamName: string
    stationName: string
    score: number
  }) => void
  /** Called when a team's details change; re-fetching is the caller's responsibility */
  onTeamDetailsChange: (teamName: string) => void
  /** Called when a team is deleted */
  onTeamDeleted: (teamName: string) => void
  /** Called when a file is added to the event */
  onFileAdded: (data: object) => void
  /** Called when a file is deleted from the event */
  onFileDeleted: () => void
}

export function init(
  api: ApiClient,
  config: EventConfig,
  callbacks: RealtimeCallbacks
): void {
  if (!config.key) {
    console.debug('No pusher-key defined. Realtime events will be disabled')
    return
  }

  Pusher.logToConsole = config.debug
  const pusher = new Pusher(config.key, { cluster: 'eu' })

  const teamChannel = pusher.subscribe(config.teamChannel)

  teamChannel.bind('state-change', (data: any) => {
    callbacks.onTeamStateChange(data)
  })

  teamChannel.bind('score-change', (data: any) => {
    callbacks.onTeamStateChange(data)
  })

  teamChannel.bind('questionnaire-score-change', (data: any) => {
    callbacks.onQuestionnaireScoreChange(data)
  })

  teamChannel.bind('team-details-change', (data: { name: string }) => {
    callbacks.onTeamDetailsChange(data.name)
  })

  teamChannel.bind('team-deleted', (data: { name: string }) => {
    callbacks.onTeamDeleted(data.name)
  })

  const fileChannel = pusher.subscribe(config.fileChannel)

  fileChannel.bind('file-added', (data: object) => {
    callbacks.onFileAdded(data)
  })

  fileChannel.bind('file-deleted', () => {
    callbacks.onFileDeleted()
  })
}

export default { init }
