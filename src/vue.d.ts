// src/vue.d.ts
// $remoteProxy has been removed — all API calls go through ApiClient (injected via provide/inject)

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
