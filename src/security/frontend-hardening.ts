export type AuthTokenStorageMode = 'session' | 'local' | 'memory'

const parseStorageMode = (value: unknown): AuthTokenStorageMode => {
  if (value === 'local' || value === 'memory' || value === 'session') return value
  return 'session'
}

export const authTokenStorageMode: AuthTokenStorageMode = parseStorageMode(
  import.meta.env.VITE_AUTH_TOKEN_STORAGE,
)

export const isSecureApiOrigin = (): boolean => {
  const origin = import.meta.env.VITE_API_ORIGIN ?? ''
  return origin === ''
    || origin.startsWith('https://')
    || origin.startsWith('http://localhost')
    || origin.startsWith('http://127.0.0.1')
}

export const assertFrontendSecurityConfig = (): void => {
  if (import.meta.env.PROD && !isSecureApiOrigin()) {
    throw new Error('VITE_API_ORIGIN must use HTTPS outside localhost.')
  }

  if (import.meta.env.PROD && authTokenStorageMode === 'local') {
    throw new Error('VITE_AUTH_TOKEN_STORAGE=local is not allowed in production builds.')
  }
}
