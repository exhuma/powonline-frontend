// src/vue.d.ts
// $remoteProxy has been removed — all API calls go through ApiClient (injected via provide/inject)

declare module '*.md' {
  const html: string
  export default html
}
