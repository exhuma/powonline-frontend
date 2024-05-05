import { Result } from '@/util/result'
import * as oauth from 'oauth4webapi'

// const ISSUER = new URL('https://accounts.google.com/')
// GOOG  const CLIENT_ID = ''422704708781-79dj0h2lhnkrosmq50g8280646asairm.apps.googleusercontent.com'

const ISSUER = new URL(
  'https://login.microsoftonline.com/b32ede06-d7e3-48f0-b82c-20fab650f67f/v2.0'
)
const CLIENT_ID = '7228657a-8ca6-4cd0-a70d-1abd281c80aa'

// const ISSUER = new URL('http://localhost:8080/realms/localdev')
// const CLIENT_ID = 'my-dev-app'

export const CLIENT: {
  client_id: string
  token_endpoint_auth_method: oauth.ClientAuthenticationMethod
} = {
  client_id: CLIENT_ID,
  token_endpoint_auth_method: 'none'
}

const REDIRECT_URI = 'http://localhost:5173/oidc-redirect'

export class OAuthError extends Error {
  constructor(public error: oauth.OAuth2Error) {
    super(error.error_description)
    this.name = 'OAuthError'
  }
}

export async function getAs(): Promise<oauth.AuthorizationServer> {
  const as = await oauth
    .discoveryRequest(ISSUER, { algorithm: 'oidc' })
    .then((response) => oauth.processDiscoveryResponse(ISSUER, response))
  return as
}

export async function triggerLogin(as: oauth.AuthorizationServer) {
  const code_challenge_method = 'S256'
  /**
   * The following MUST be generated for every redirect to the authorization_endpoint. You must store
   * the code_verifier and nonce in the end-user session such that it can be recovered as the user
   * gets redirected from the authorization server back to your application.
   */
  const code_verifier = oauth.generateRandomCodeVerifier()
  localStorage.setItem('code_verifier', code_verifier) // TODO: Should I use the session instead?
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier)
  let state: string | undefined

  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint!)
  authorizationUrl.searchParams.set('client_id', CLIENT.client_id)
  authorizationUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  authorizationUrl.searchParams.set('response_type', 'code')
  // TODO authorizationUrl.searchParams.set('scope', 'api:read')
  authorizationUrl.searchParams.set('scope', 'openid')
  authorizationUrl.searchParams.set('code_challenge', code_challenge)
  authorizationUrl.searchParams.set(
    'code_challenge_method',
    code_challenge_method
  )

  /**
   * We cannot be sure the AS supports PKCE so we're going to use state too. Use of PKCE is
   * backwards compatible even if the AS doesn't support it which is why we're using it regardless.
   */
  if (as.code_challenge_methods_supported?.includes('S256') !== true) {
    state = oauth.generateRandomState()
    localStorage.setItem('state', state) // TODO: Should I use the session instead?
    authorizationUrl.searchParams.set('state', state)
  }
  window.location.href = authorizationUrl.toString()
}

export function triggerLogout(as: oauth.AuthorizationServer) {
  const logoutUrl = new URL(as.end_session_endpoint!)
  logoutUrl.searchParams.set('client_id', CLIENT.client_id)
  logoutUrl.searchParams.set('post_logout_redirect_uri', REDIRECT_URI)
  window.location.href = logoutUrl.toString()
}

export async function handleRedirect(
  as: oauth.AuthorizationServer
): Promise<oauth.OpenIDTokenEndpointResponse> {
  // one eternity later, the user lands back on the redirect_uri
  // Authorization Code Grant Request & Response
  const code_verifier = localStorage.getItem('code_verifier') || ''
  const state = localStorage.getItem('state') || undefined
  const currentUrl: URL = new URL(window.location.href)
  const params = oauth.validateAuthResponse(as, CLIENT, currentUrl, state)
  if (oauth.isOAuth2Error(params)) {
    throw new OAuthError(params)
  }

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    CLIENT,
    params,
    REDIRECT_URI,
    code_verifier
  )

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new OAuthError({
      error: 'invalid_request',
      error_description: 'WWW-Authenticate Challenge failed'
    })
  }

  const result = await oauth.processAuthorizationCodeOpenIDResponse(
    as,
    CLIENT,
    response
  )
  if (oauth.isOAuth2Error(result)) {
    throw new OAuthError(result)
  }
  return result
}

export async function protectedRequest(access_token: string, url: URL) {
  const response = await oauth.protectedResourceRequest(
    access_token,
    'GET',
    url
  )

  let challenges: oauth.WWWAuthenticateChallenge[] | undefined
  if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.error('WWW-Authenticate Challenge', challenge)
    }
    throw new OAuthError({
      error: 'invalid_request',
      error_description: 'WWW-Authenticate Challenge failed'
    })
  }

  console.log('Protected Resource Response', await response.json()) // XXX TODO
}

export function setAuthState(
  oauthResponse?: oauth.OAuth2TokenEndpointResponse,
  error?: Error
) {
  if (oauthResponse) {
    localStorage.removeItem('oauth-error')
    localStorage.setItem('oauth-response', JSON.stringify(oauthResponse))
  } else if (error) {
    localStorage.removeItem('oauth-response')
    localStorage.setItem('oauth-error', error.message)
  }
}

export function getAuthState(): Result<oauth.OAuth2TokenEndpointResponse | null> {
  const oauthResponse = localStorage.getItem('oauth-response')
  const oauthError = localStorage.getItem('oauth-error')
  if (oauthResponse) {
    return new Result<oauth.OAuth2TokenEndpointResponse>(
      JSON.parse(oauthResponse) as oauth.OAuth2TokenEndpointResponse
    )
  } else if (oauthError) {
    return new Result(undefined, new Error(oauthError))
  }
  return new Result(null)
}

export function cleanAuthState() {
  localStorage.removeItem('oauth-response')
  localStorage.removeItem('oauth-error')
}
