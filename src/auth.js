import hello from 'hellojs'
import {LostTrackerAPI} from '@/lost_tracker_api.js'
import jwt_decode from 'jwt-decode' // eslint-disable-line camelcase


const LOG = window.console


/**
 * Performs a local login against the system back-end
 *
 * @param username The login name for the user
 * @param password The password name for the user
 * @param backend An optional injection point for back-end communications
 */
function localLogin(username, password, backend) {
  backend = backend || LostTrackerAPI
  const prm = new Promise((resolve, reject) => {
    backend.loginUser(username, password).then(data => {
      if (data.status === 200) {
        resolve(data)
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


function socialLogin (backend, provider) {
  backend = backend || hello
  const prm = new Promise((resolve) => {
    backend(provider).login({
      'scope': 'basic, email'
    })
    resolve()
  })
  return prm
}


function logoutUser (social) {
  const prm = new Promise((resolve) => {
    window.console.debug('Logging out user')
    social.logout('facebook')
    social.logout('google')
    resolve()
    // TODO this.$store.commit('clearUserData')
    // TODO this.$router.push('/')
    // TODO this.username = ''
    // TODO this.password = ''
  })
  return prm
}


function getAuthInfo () {
  const roles = []
  // TODO const roles = this.$store.state.roles
  // TODO return this.$store.state.userName
  // TODO this.$store.state.jwt
  if (process.env.NODE_ENV === "development") {
    roles.push('admin')
  }
  return {
    jwtToken: 'abc',
    roles: roles,
    userName: 'jdoe',  // TODO Use real value
  }
}

export default {

  localLogin: localLogin,
  socialLogin: socialLogin,
  logoutUser: logoutUser,
  getAuthInfo: getAuthInfo,

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
    LOG.debug('Checking if current token has expired')
    if (token === '') {
      LOG.debug('Empty token (always counts as expired)')
      return true
    }
    const now = Math.floor(Date.now() / 1000)
    let decoded = null
    try {
      decoded = jwt_decode(token)
    } catch (err) {
      LOG.error('Invalid token detected, clearing auth info!')
      return true
    }
    LOG.debug('Token will expire in ' + (decoded['exp'] - now) + 's')
    if (decoded['exp'] <= now) {
      LOG.debug('Security token has expired!')
      return true
    } else {
      LOG.debug('Security token is still fresh')
      return false
    }
  },

  /**
   * Renews the current token. Note that this will only work for tokens that
   * have not expired yet!
   */
  renewToken: function (remote, token) {
    if (token === '') {
      return ''
    }
    const failedRenewals = parseInt(localStorage.getItem(
      'failedRenewals', 0), 10)
    if (failedRenewals > 5) {
      LOG.error('Too many retries!')
      return ''
    }
    this.clearToken(false)
    LOG.debug('Renewing token')
    remote.renewToken(token).then(data => {
      if (data.status < 300) {
        localStorage.setItem('jwt', data.token)
        localStorage.setItem('failedRenewals', 0)
      } else {
        LOG.error('Unable to renew the token!')
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
    LOG.debug('Clearing auth info')
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
