/**
 * useOfflineStatus
 *
 * Reactive composable that tracks:
 *   - isOffline: whether the browser is currently offline
 *   - pendingSyncCount: approximate number of queued write operations in the
 *     workbox-background-sync IndexedDB store.
 *
 * The pending count is polled from IndexedDB because the service worker can't
 * push a live count; however the count is also refreshed on SW messages.
 */
import { ref, onMounted, onUnmounted } from 'vue'

const IDB_DB_NAME = 'workbox-background-sync'
const IDB_STORE_NAME = 'requests'
const SYNC_QUEUE_NAME = 'powonline-score-sync'
const POLL_INTERVAL_MS = 5_000

async function readPendingCount(): Promise<number> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_DB_NAME)
      request.onsuccess = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.close()
          resolve(0)
          return
        }
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readonly')
          const store = tx.objectStore(IDB_STORE_NAME)
          const countReq = store.count()
          countReq.onsuccess = () => {
            db.close()
            // Workbox stores requests for ALL queues in one store; we can't
            // easily filter by queue name without an index, so we use the
            // total count as the approximation.
            resolve(countReq.result)
          }
          countReq.onerror = () => {
            db.close()
            resolve(0)
          }
        } catch {
          db.close()
          resolve(0)
        }
      }
      request.onerror = () => resolve(0)
    } catch {
      resolve(0)
    }
  })
}

export function useOfflineStatus() {
  const isOffline = ref(!navigator.onLine)
  const pendingSyncCount = ref(0)
  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function refreshPendingCount() {
    pendingSyncCount.value = await readPendingCount()
  }

  function handleOnline() {
    isOffline.value = false
    refreshPendingCount()
  }
  function handleOffline() {
    isOffline.value = true
  }

  function handleSwMessage(event: MessageEvent) {
    const { type } = event.data ?? {}
    if (
      type === 'SYNC_SUCCESS' ||
      type === 'QUEUE_EMPTY' ||
      type === 'SYNC_FAILED'
    ) {
      refreshPendingCount()
    }
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    navigator.serviceWorker?.addEventListener('message', handleSwMessage)

    refreshPendingCount()
    pollTimer = setInterval(refreshPendingCount, POLL_INTERVAL_MS)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    navigator.serviceWorker?.removeEventListener('message', handleSwMessage)
    if (pollTimer !== null) clearInterval(pollTimer)
  })

  return { isOffline, pendingSyncCount }
}

export default useOfflineStatus
