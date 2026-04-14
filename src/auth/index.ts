/**
 * Auth helpers.
 *
 * Session state is held exclusively in the Vuex store (populated via
 * GET /auth/me on startup and after social-login callback).  There is no
 * localStorage, no readable JWT — cookies are HttpOnly and managed by the
 * browser transparently.
 */
import type { Store } from 'vuex'

export class Auth {
  private store: Store<any>

  constructor(store: Store<any>) {
    this.store = store
  }

  isAuthenticated(): boolean {
    return Boolean(this.store.state.userName)
  }

  get_roles(): string[] {
    return this.store.state.roles || []
  }

  get_username(): string {
    return this.store.state.userName || ''
  }
}
