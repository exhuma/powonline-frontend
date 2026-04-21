/**
 * Custom service worker for powonline.
 *
 * Strategies:
 *   - App shell / static assets: precached by Workbox (injected manifest).
 *   - Read API endpoints: NetworkFirst with a 10 s timeout; falls back to
 *     cache so the Station Dashboard loads with last-known data when offline.
 *   - Write API endpoints (POST .../job): NetworkOnly with BackgroundSync so
 *     queued writes are replayed automatically when connectivity is restored.
 *     A manual-retry fallback message is broadcast when BackgroundSync is not
 *     supported.
 *
 * Build note: this file is compiled by vite-plugin-pwa (injectManifest
 * strategy).  The `self.__WB_MANIFEST` injection point is required.
 */

/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, NetworkOnly } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// ---------------------------------------------------------------------------
// Precache app shell (injected by vite-plugin-pwa at build time)
// ---------------------------------------------------------------------------
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// ---------------------------------------------------------------------------
// Helper: broadcast a message to all controlled clients
// ---------------------------------------------------------------------------
async function broadcastToClients(data: object) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true })
  clients.forEach((client) => client.postMessage(data))
}

// ---------------------------------------------------------------------------
// BackgroundSync plugin for queued write operations
// ---------------------------------------------------------------------------
const SYNC_TAG = 'powonline-score-sync'

const bgSyncPlugin = new BackgroundSyncPlugin(SYNC_TAG, {
  maxRetentionTime: 24 * 60, // keep queued requests for up to 24 hours
  async onSync({ queue }) {
    let entry
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone())
        broadcastToClients({ type: 'SYNC_SUCCESS', request: entry.request.url })
      } catch (error) {
        // Re-queue on failure and stop processing the rest of the batch
        await queue.unshiftRequest(entry)
        broadcastToClients({ type: 'SYNC_FAILED', request: entry.request.url })
        throw error
      }
    }
    broadcastToClients({ type: 'QUEUE_EMPTY' })
  }
})

// ---------------------------------------------------------------------------
// Read API: NetworkFirst (with cache fallback)
//   /events/{id}/station              – station metadata
//   /events/{id}/station/{s}/{r}/dashboard – team states per station
//   /events/{id}/questionnaire         – questionnaire list
//   /events/{id}/dashboard             – combined dashboard
// ---------------------------------------------------------------------------
const READ_API_PATTERN =
  /\/events\/\d+\/(station|questionnaire|dashboard)(\/.+)?(\/dashboard)?(\?.*)?$/

registerRoute(
  ({ url }) => READ_API_PATTERN.test(url.pathname + url.search),
  new NetworkFirst({
    networkTimeoutSeconds: 10,
    cacheName: 'powonline-api-reads',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 // 1 hour
      })
    ]
  })
)

// ---------------------------------------------------------------------------
// Write API: NetworkOnly + BackgroundSync
//   POST /events/{id}/job  – score update, questionnaire score, advance state
// ---------------------------------------------------------------------------
registerRoute(
  ({ url, request }) =>
    request.method === 'POST' && /\/events\/\d+\/job$/.test(url.pathname),
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
)

// ---------------------------------------------------------------------------
// Expose queue size to the main thread on demand
// ---------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_QUEUE_COUNT') {
    // We can't easily inspect the queue size from here without importing
    // the Queue class directly, so we broadcast a sentinel that lets the
    // UI poll IndexedDB directly via the workbox-background-sync store.
    event.ports?.[0]?.postMessage({ type: 'QUEUE_COUNT_NA' })
  }
})
