import hello from 'hellojs'
import type { Store } from 'vuex'
import type { Proxy } from '@/remote'

type HelloConfig = {
  google: string
  facebook: string
}

export function init() {
  const helloConfig: HelloConfig = { google: '', facebook: '' }
  if (import.meta.env.GOOGLE_PUBLIC_KEY) {
    helloConfig['google'] = import.meta.env.GOOGLE_PUBLIC_KEY
  } else {
    console.info('No Google Public Key Set. Google Auth will not be available')
  }
  if (import.meta.env.FACEBOOK_PUBLIC_KEY) {
    helloConfig['facebook'] = import.meta.env.FACEBOOK_PUBLIC_KEY
  } else {
    console.info(
      'No Facebook Public Key Set. Facebook Auth will not be available'
    )
  }
  hello.init(helloConfig, { redirect_uri: 'redirect.html' })
  console.log('Social logins initialised.')
}

/**
 * Register callback for social logins
 *
 * After a user successfully logs in using a social identity provider, post
 * that message to the backend to retrieve a corresponding JWT token.
 */
export function connect(remoteProxy: Proxy, store: Store<any>) {
  hello.on('auth.login', async function (ath) {
    // Fetch user details from the selected network
    const userInfo = await hello(ath.network).api('me')
    if (!ath.authResponse) {
      throw new Error('No valid auth response received')
    }
    try {
      const data = await remoteProxy.socialLogin(
        ath.authResponse.network,
        userInfo.id,
        ath.authResponse.access_token
      )
      store.commit('updateUserData', data)
    } catch (error) {
      store.commit('clearUserData')
      // TODO show message as snack-text
    }
  })
}

export default {
  init,
  connect
}
