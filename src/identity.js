import jwt_decode from 'jwt-decode' // eslint-disable-line camelcase

const LOG = window.console


/**
 * This class contains a wrapper around the application authentication
 * mechanism based on JWT.
 *
 * A JWT token for this class must have the keys:
 *
 *   * username: the login-name as string
 *   * roles: A list of strings representing the users roles
 *   * iat: The standard JWT iat key
 *   * exp: The standard JWT exp key
 */
class Identity {

  constructor (username, roles, iat, exp, token) {
    this.username = username
    this.roles = roles
    this.iat = iat
    this.exp = exp
    this.token = token
    this.failedRenewals = 0
  }

  /**
   * Creates a new empty, invalid identity
   */
  static makeNull () {
    const instance = new Identity('', [], 0, 0, '')
    return instance
  }

  /**
   * Creates a new identity from a JWT token
   *
   * @param token: The JWT token as string
   * @return str returns a new "Identity" instance
   */
  static fromToken (token) {
    const decoded = jwt_decode(token)
    const instance = new Identity(
      decoded.username,
      decoded.roles,
      decoded.iat || null,
      decoded.exp || null,
      token
    )
    return instance
  }

  /**
   * Persists the identity token into local storage to be able to retrieve it
   * later.
   */
  persistToLocalStorage () {
    localStorage.setItem('jwt', this.token)
  }

  /**
   * Removes all identity related keys from local-storage
   */
  static clearLocalStorage () {
    localStorage.removeItem('jwt')
  }


  /**
   * Creates an identity object from local storage. If it does not exist, this
   * will return null.
   */
  static fromLocalStorage () {
    const token = localStorage.getItem('jwt') || ''
    if (token === '') {
      LOG.debug(
        'No identity available in local-storage, returning a dummy entry')
      return new Identity.makeNull()
    }
    const instance = Identity.fromToken(token)
    return instance
  }


  /**
   * Performs a local login against the system back-end
   *
   * @param username The login name for the user
   * @param password The password name for the user
   * @param backend An optional injection point for back-end communications
   */
  static login(username, password, backend) {
    const prm = new Promise((resolve, reject) => {
      backend.loginUser(username, password).then(data => {
        if (data.status === 200) {
          const instance = Identity.fromToken(data.token)
          resolve(instance)
        } else {
          reject({
            message: 'Unexpected remote response (' + data.status + ')'
          })
        }
      }).catch(e => {
        let message = 'Unknown Error'
        if (e.response) {
          message = e.response.data
        } else {
          message = e.message
        }
        reject({message: message})
      })
    })
    return prm
  }

  /**
   * Check if the identity is valid and usable (even an expired identity is
   * considered "usable")
   */
  isUsable () {
    return this.token !== ''
  }

  /**
   * Determines whether a token has expired or not.
   */
  isExpired () {
    LOG.debug('Checking if current token has expired')
    if (this.token === '') {
      LOG.debug('Empty token (always counts as expired)')
      return true
    }
    const now = Math.floor(Date.now() / 1000)
    LOG.debug('Token will expire in ' + (this.exp - now) + 's')
    if (this.exp <= now) {
      LOG.debug('Security token has expired!')
      return true
    } else {
      LOG.debug('Security token is still fresh')
      return false
    }
  }

  /**
   * Check if the current identity has a given role
   *
   * @param roleName the role name to check
   */
  hasRole (roleName) {
    const idx = this.roles.findIndex((item) => {
      return item === roleName
    })
    const output = idx > -1
    return output
  }

  /**
   * Renews the current token. Note that this will only work for tokens that
   * have not expired yet!

   * @param backend An optional injection point for back-end communications
   */
  renew (backend) {
    const prm = new Promise((resolve, reject) => {
      if (this.token === '') {
        resolve()
      } else if (this.failedRenewals > 5) {
        this.invalidate()
        reject({message: 'Too many retries!'})
      } else {
        backend.renewToken(this.token).then(data => {
          // XXX TODO ENDLESS LOOP
          // if (data.status < 300) {
          //   this.token = data.token
          //   this.failedRenewals = 0
          //   resolve()
          // } else {
          //   LOG.error('Unable to renew the token!')
          //   this.failedRenewals += 1
          //   resolve()
          // }
        })
      }
    })
    return prm
  }

  /**
   * Removes all authentication from this intance
   *
   * @param resetFailedRenewals Whether to set failedRenewals back to 0
   */
  clear (resetFailedRenewals) {
    this.roles = []
    this.iat = 0
    this.exp = 0
    this.token = ''
    if (resetFailedRenewals) {
      this.failedRenewals = 0
    }
  }

}

export {
  Identity
}
