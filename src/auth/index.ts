/**
 * Auth helpers.
 *
 * Session state is held by App.vue (populated via GET /auth/me on startup
 * and after social-login callback). There is no localStorage, no readable JWT
 * — cookies are HttpOnly and managed by the browser transparently.
 */

export type Session = {
  userName: string
  roles: string[]
}

export class Auth {
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  isAuthenticated(): boolean {
    return Boolean(this.session.userName)
  }

  get_roles(): string[] {
    return this.session.roles || []
  }

  get_username(): string {
    return this.session.userName || ''
  }
}
