/**
 * useRealtimeStream — singleton SSE composable.
 *
 * Opens a single EventSource for the currently selected event and exposes
 * reactive refs that components can watch to react to server-push updates.
 *
 * Usage:
 *   const { lastStateChange, lastScoreChange, ... } = useRealtimeStream()
 *
 * Lifecycle:
 *   • Call connect(eventId) to open (or switch) the stream.
 *   • Call disconnect() to close it (e.g. in app teardown).
 *   • The composable automatically closes the old stream before opening a
 *     new one, so switching events is safe to call at any time.
 *
 * Both selectedEventId (manual selection) and pinnedEvent (domain-pinned)
 * are watched; whichever resolves first triggers a connection.
 */

import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { pinnedEvent } from '@/pinnedEvent'

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

// Reactive refs — updated on every matching SSE message
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
// Internal helpers
// ---------------------------------------------------------------------------

function _buildUrl(eventId: number): string {
  const base = (import.meta as any).env?.VITE_BACKEND_URL ?? ''
  return `${base}/events/${eventId}/stream`
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
    case 'state-change':
      lastStateChange.value = data as StateChangePayload
      break
    case 'score-change':
      lastScoreChange.value = data as ScoreChangePayload
      break
    case 'questionnaire-score-change':
      lastQuestionnaireScoreChange.value =
        data as QuestionnaireScoreChangePayload
      break
    case 'team-details-change':
      lastTeamDetailsChange.value = data as TeamDetailsChangePayload
      break
    case 'team-deleted':
      lastTeamDeleted.value = data as TeamDeletedPayload
      break
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
function connect(eventId: number | null): void {
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
    connectedEventId,
    selectedEventId,
    lastStateChange,
    lastScoreChange,
    lastQuestionnaireScoreChange,
    lastTeamDetailsChange,
    lastTeamDeleted,
    lastFileAdded,
    lastFileDeleted
  }
}
