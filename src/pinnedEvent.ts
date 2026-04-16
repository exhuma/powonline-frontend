/**
 * Shared reactive ref holding the event that is pinned to the current domain.
 *
 * Extracted into its own module so that both `main.ts` (which populates it)
 * and `router/index.ts` (which reads it in the navigation guard) can import
 * it without creating a circular dependency.
 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { EventInfo } from '@/api'

export const pinnedEvent: Ref<EventInfo | null> = ref(null)
