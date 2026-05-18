/**
 * useRealtimeStream — singleton SSE composable.
 *
 * Opens a single EventSource for the currently selected event and exposes
 * reactive refs that components can watch to react to server-push updates.
 *
 * Data ownership
 * --------------
 * In addition to signal refs (lastXxx), the composable owns the three data
 * refs that change in real time:
 *   • dashboardRows  — global dashboard (DashboardRow[])
 *   • questionnaireScores — QuestionnaireScores map
 *   • liveTeams      — Team[]
 *
 * On every SSE event these are mutated surgically in-place so bound
 * components update without any HTTP re-fetch.
 *
 * initData(eventId) performs the initial fetch that seeds the three data
 * refs; it is called automatically inside connect() and can also be called
 * manually (e.g. for a manual refresh button).
 *
 * Lifecycle:
 *   • connect(eventId) opens (or switches) the stream and seeds data.
 *   • disconnect() closes the stream (e.g. in app teardown).
 *   • The composable automatically closes the old stream before opening a
 *     new one, so switching events is safe to call at any time.
 *
 * Both selectedEventId (manual selection) and pinnedEvent (domain-pinned)
 * are watched; whichever resolves first triggers a connection.
 */

import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { pinnedEvent } from '@/pinnedEvent'
import { api } from '@/main'
import type { Team } from '@/remote/model/team'
import type { DashboardRow } from '@/remote/model/dashboardRow'
import type { QuestionnaireScores } from '@/remote/model/questionnaireScores'

// ---------------------------------------------------------------------------
// Payload types — mirror the backend SSE event shapes
// ---------------------------------------------------------------------------

export type StateChangePayload = {
  station: string
  team: string
  new_state: string
}

export type ScoreChangePayload = {
  station: string
  team: string
  new_score: number
}

export type QuestionnaireScoreChangePayload = {
  stationName: string
  teamName: string
  score: number
}

export type TeamDetailsChangePayload = {
  name: string
  route_name: string | null
  cancelled: boolean
  accepted: boolean
  completed: boolean
  order: number
}

export type TeamDeletedPayload = {
  name: string
}

export type FileAddedPayload = {
  uuid: string
  href: string
  thumbnail: string
  tiny: string
  name: string
  when: string
}

export type FileDeletedPayload = {
  id: string
}

// ---------------------------------------------------------------------------
// Module-level singleton state
// ---------------------------------------------------------------------------

const _eventSource: Ref<EventSource | null> = ref(null)

/** The event_id the current stream is connected to (null = disconnected). */
const connectedEventId: Ref<number | null> = ref(null)

/** The manually-selected event ID (written by App.vue via setSelectedEventId). */
export const selectedEventId: Ref<number | null> = ref(null)

// Signal refs — written on every matching SSE message; components may watch
// these directly to trigger their own side-effects (e.g. StationDashboard).
export const lastStateChange: Ref<StateChangePayload | null> = ref(null)
export const lastScoreChange: Ref<ScoreChangePayload | null> = ref(null)
export const lastQuestionnaireScoreChange: Ref<QuestionnaireScoreChangePayload | null> =
  ref(null)
export const lastTeamDetailsChange: Ref<TeamDetailsChangePayload | null> =
  ref(null)
export const lastTeamDeleted: Ref<TeamDeletedPayload | null> = ref(null)
export const lastFileAdded: Ref<FileAddedPayload | null> = ref(null)
export const lastFileDeleted: Ref<FileDeletedPayload | null> = ref(null)

// ---------------------------------------------------------------------------
// Live data refs — owned by the composable, mutated surgically on SSE events
// ---------------------------------------------------------------------------

/** Global dashboard rows — mutated in-place on state-change / score-change. */
export const dashboardRows: Ref<DashboardRow[]> = ref([])

/** Questionnaire scores map — mutated in-place on questionnaire-score-change. */
export const questionnaireScores: Ref<QuestionnaireScores> = ref({})

/** Live team list — mutated in-place on team-details-change / team-deleted. */
export const liveTeams: Ref<Team[]> = ref([])

// ---------------------------------------------------------------------------
// Data initialisation
// ---------------------------------------------------------------------------

/**
 * Fetch the three real-time data sets and populate the live refs.
 * Called automatically by connect(); may also be called manually for a
 * forced refresh.
 */
export async function initData(eventId: number): Promise<void> {
  const [rows, teams, qScores] = await Promise.all([
    api.fetchDashboard(eventId),
    api.fetchTeams(eventId),
    api.fetchQuestionnaireScores(eventId)
  ])
  dashboardRows.value = rows
  liveTeams.value = teams
  questionnaireScores.value = qScores
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _buildUrl(eventId: number): string {
  return `${api.baseUrl}/events/${eventId}/stream`
}

function _handleMessage(raw: string): void {
  let parsed: { type: string; data: unknown }
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.warn('[SSE] Failed to parse message:', raw)
    return
  }
  const { type, data } = parsed
  switch (type) {
    case 'state-change': {
      const p = data as StateChangePayload
      lastStateChange.value = p
      // Surgical update: patch the matching cell in dashboardRows
      const row = dashboardRows.value.find((r) => r.team === p.team)
      const cell = row?.stations.find((s) => s.name === p.station)
      if (cell) cell.state = p.new_state
      break
    }
    case 'score-change': {
      const p = data as ScoreChangePayload
      lastScoreChange.value = p
      // Surgical update: patch score in the matching cell
      const row = dashboardRows.value.find((r) => r.team === p.team)
      const cell = row?.stations.find((s) => s.name === p.station)
      if (cell) cell.score = p.new_score
      break
    }
    case 'questionnaire-score-change': {
      const p = data as QuestionnaireScoreChangePayload
      lastQuestionnaireScoreChange.value = p
      // Surgical update: patch score in questionnaireScores
      const teamEntry = questionnaireScores.value[p.teamName]
      const stationEntry = teamEntry?.[p.stationName]
      if (stationEntry) {
        stationEntry.score = p.score
      } else {
        // New entry not yet in the map — fall back to a full re-fetch
        if (connectedEventId.value) {
          api.fetchQuestionnaireScores(connectedEventId.value).then((fresh) => {
            questionnaireScores.value = fresh
          })
        }
      }
      break
    }
    case 'team-details-change': {
      const p = data as TeamDetailsChangePayload
      lastTeamDetailsChange.value = p
      // Surgical update: patch the relevant fields on the matching team
      const idx = liveTeams.value.findIndex((t) => t.name === p.name)
      if (idx !== -1) {
        liveTeams.value[idx] = {
          ...liveTeams.value[idx],
          route_name: p.route_name,
          cancelled: p.cancelled,
          accepted: p.accepted,
          completed: p.completed,
          order: p.order
        }
      }
      break
    }
    case 'team-deleted': {
      const p = data as TeamDeletedPayload
      lastTeamDeleted.value = p
      // Remove from both liveTeams and dashboardRows
      liveTeams.value = liveTeams.value.filter((t) => t.name !== p.name)
      dashboardRows.value = dashboardRows.value.filter((r) => r.team !== p.name)
      break
    }
    case 'file-added':
      lastFileAdded.value = data as FileAddedPayload
      break
    case 'file-deleted':
      lastFileDeleted.value = data as FileDeletedPayload
      break
    default:
      console.debug('[SSE] Unknown event type:', type)
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Open (or switch to) the SSE stream for the given event. */
async function connect(eventId: number | null): Promise<void> {
  if (!eventId) {
    disconnect()
    return
  }
  // Already connected to the right event — nothing to do
  if (connectedEventId.value === eventId && _eventSource.value) return

  // Close any existing connection first
  disconnect()

  const url = _buildUrl(eventId)
  const es = new EventSource(url)

  es.onmessage = (event: MessageEvent) => {
    _handleMessage(event.data)
  }

  es.onerror = () => {
    // EventSource will automatically reconnect; just log
    console.warn(`[SSE] Connection error for event ${eventId}, will retry…`)
  }

  _eventSource.value = es
  connectedEventId.value = eventId
  console.debug(`[SSE] Connected to event ${eventId}`)

  // Seed the live data refs now that we know the event ID
  await initData(eventId)
}

/** Close the current SSE connection. */
export function disconnect(): void {
  if (_eventSource.value) {
    _eventSource.value.close()
    _eventSource.value = null
    console.debug(`[SSE] Disconnected from event ${connectedEventId.value}`)
    connectedEventId.value = null
  }
}

// ---------------------------------------------------------------------------
// Automatic reconnect when event context changes
//
// Watch both pinnedEvent (module ref) and selectedEventId (written by App.vue)
// and reconnect whenever the effective event ID changes.
// ---------------------------------------------------------------------------

watch(
  () => pinnedEvent.value?.id ?? selectedEventId.value,
  (effectiveId) => {
    connect(effectiveId ?? null)
  }
)

// ---------------------------------------------------------------------------
// Composable export
// ---------------------------------------------------------------------------

export function useRealtimeStream() {
  return {
    connect,
    disconnect,
    initData,
    connectedEventId,
    selectedEventId,
    dashboardRows,
    questionnaireScores,
    liveTeams,
    lastStateChange,
    lastScoreChange,
    lastQuestionnaireScoreChange,
    lastTeamDetailsChange,
    lastTeamDeleted,
    lastFileAdded,
    lastFileDeleted
  }
}
