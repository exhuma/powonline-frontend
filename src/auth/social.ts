/**
 * Social (OAuth2 PKCE) login helpers.
 *
 * Starting a social login is a simple redirect: the frontend tells the backend
 * which provider to use and what callback URL to use, and the backend handles
 * the rest (PKCE, cookie, redirect to IdP).
 *
 * After the IdP redirects back to the backend callback URL the backend sets
 * auth cookies and redirects the browser to the frontend's /auth/callback
 * route, where AuthCallback.vue calls store.dispatch('checkSession').
 */

/**
 * Redirect the browser to begin an OAuth2 PKCE flow for the given provider.
 *
 * @param provider    Provider name as returned by GET /auth/providers (e.g. "google")
 * @param backendUrl  The resolved backend base URL (from runtime config, not build-time env).
 *                    Pass `api.baseUrl` from the ApiClient instance created in main.ts.
 */
export function startSocialLogin(provider: string, backendUrl: string): void {
  // The backend callback URL — the IdP will redirect here with the code.
  const backendCallbackUrl = `${backendUrl}/auth/callback/${provider}`

  // The frontend URL the backend should redirect to after successful login.
  const frontendCallbackUrl = `${window.location.origin}/auth/callback`

  const params = new URLSearchParams({
    redirect_uri: backendCallbackUrl,
    frontend_url: frontendCallbackUrl
  })

  window.location.href = `${backendUrl}/auth/social/${provider}?${params}`
}

export default { startSocialLogin }
