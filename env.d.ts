/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_PAGE_TITLE: string
  readonly VITE_GOOGLE_PUBLIC_KEY: string
  readonly VITE_FACEBOOK_PUBLIC_KEY: string
  readonly VITE_BASE_URL?: string
  readonly VITE_DASHBOARD_REFRESH?: string
  /** Canonical name of the service operator (data controller). */
  readonly VITE_SITE_NAME: string
  /** Canonical URL of the service (e.g. https://tracker.example.com). */
  readonly VITE_SITE_URL: string
  /** Data-controller contact e-mail shown in legal documents. */
  readonly VITE_CONTACT_EMAIL: string
  /** Git commit SHA baked in at Docker build time (VITE_COMMIT_SHA). */
  readonly VITE_COMMIT_SHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
declare const __COMMIT_SHA__: string
