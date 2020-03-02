/**
 * This module contaons helpers for social logins
 */
import hello from 'hellojs'


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
  })
  return prm
}


export default {
  socialLogin: socialLogin,
  logoutUser: logoutUser,
}
