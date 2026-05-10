/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ORIGIN: string
  readonly VITE_API_VERSION?: string
  readonly VITE_AUTH_TOKEN_STORAGE?: 'session' | 'local' | 'memory'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
