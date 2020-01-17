import hello from 'hellojs'
import {LostTrackerAPI} from '@/lost_tracker_api.js'


function getAuthInfo() {
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
      username = ''
      password = ''
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

export {
  getAuthInfo,
  localLogin,
  socialLogin,
  logoutUser,
}
