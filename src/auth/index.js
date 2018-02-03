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
    console.log('Checking if "' + token + '" has expired')
    if (token === '') {
      console.log('Empty token (always counts as expired)')
      return true
    }
    const now = Math.floor(Date.now() / 1000)
    const decoded = jwt_decode(token)
    console.log('Now: ' + now + ' Exp: ' + decoded['exp'] + ' Diff: ' + (decoded['exp'] - now))
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
    localStorage.setItem('jwt', '')
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
  }
}
