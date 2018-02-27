import jwt_decode from 'jwt-decode' // eslint-disable-line camelcase
import axios from 'axios'

export default {

  /**
   * Get the current JWT token from local-storage.
   *
   * Returns an empty string if the token is not defined or empty.
   */
  get_token: function () {
    return localStorage.getItem('jwt') || ''
  },

  /**
   * Returns the user-roles from local-storage
   */
  get_roles: function () {
    return localStorage.getItem('roles') || []
  },

  /**
   * Returns the current username from local storage.
   */
  get_username: function () {
    return localStorage.getItem('userName') || ''
  },

  /**
   * Determines whether a token has expired or not.
   */
  token_expired: function (token) {
    console.log('Checking if current token has expired')
    if (token === '') {
      console.log('Empty token (always counts as expired)')
      return true
    }
    const now = Math.floor(Date.now() / 1000)
    let decoded = null
    try {
      decoded = jwt_decode(token)
    } catch (err) {
      console.error('Invalid token detected, clearing auth info!')
      return true
    }
    console.log('Token will expire in ' + (decoded['exp'] - now) + 's')
    if (decoded['exp'] <= now) {
      console.log('Security token has expired!')
      return true
    } else {
      console.log('Security token is still fresh')
      return false
    }
  },

  /**
   * Renews the current token. Note that this will only work for tokens that
   * have not expired yet!
   */
  renew_token: function (url, token) {
    if (token === '') {
      return ''
    }
    const failedRenewals = parseInt(localStorage.getItem(
      'failedRenewals', 0), 10)
    if (failedRenewals > 5) {
      console.error('Too many retries!')
      return ''
    }
    this.clearToken(false)
    console.log('Renewing token')
    axios.post(url, {
      'token': token
    }).then(response => {
      if (response.status < 300) {
        localStorage.setItem('jwt', response.data.token)
        localStorage.setItem('failedRenewals', 0)
      } else {
        console.error('Unable to renew the token!')
        localStorage.setItem('failedRenewals', failedRenewals + 1)
      }
    })
  },

  /**
   * Remove all auth information from local storage
   *
   * @param resetFailedRenewals Whether to set failedRenewals back to 0
   */
  clearToken: function (resetFailedRenewals) {
    if (resetFailedRenewals === undefined) {
      resetFailedRenewals = true
    }
    console.log('Clearing auth info')
    localStorage.setItem('jwt', '')
    localStorage.setItem('userName', '')
    localStorage.setItem('roles', [])
    if (resetFailedRenewals) {
      localStorage.setItem('failedRenewals', 0)
    }
  },

  /**
   * Checks if the token in current storage has expired. If true, clears if
   * from the storage..
   *
   * Return true if the token was cleared, false otherwise.
   */
  clearExpiredToken: function () {
    const jwt = this.get_token()
    if (jwt === '' || this.token_expired(jwt)) {
      this.clearToken()
      return true
    }
    return false
  }
}
