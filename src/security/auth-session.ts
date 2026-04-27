const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const PERMISSIONS_KEY = 'permissions'
const SAVED_AT_KEY = 'authSavedAt'
const EXPIRES_AT_KEY = 'authExpiresAt'

export type StoredAuthSession<TUser> = {
  token: string | null
  user: TUser | null
  permissions: string[]
  savedAt: number | null
  expiresAt: number | null
}

const emptySession = <TUser>(): StoredAuthSession<TUser> => ({
  token: null,
  user: null,
  permissions: [],
  savedAt: null,
  expiresAt: null,
})

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const readNumber = (key: string): number | null => {
  const raw = localStorage.getItem(key)
  if (!raw) return null

  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return atob(padded)
}

export const getJwtExpiryMs = (token: string | null): number | null => {
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const parsed = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown }
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null
  } catch {
    return null
  }
}

export const isTokenUsable = (token: string | null, now = Date.now()): boolean => {
  if (!token || token === 'null' || token === 'undefined') return false

  const expiresAt = getJwtExpiryMs(token)
  if (!expiresAt) return true

  return expiresAt > now + 30_000
}

export const clearStoredAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
  localStorage.removeItem(SAVED_AT_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

export const readStoredAuth = <TUser>(): StoredAuthSession<TUser> => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!isTokenUsable(token)) {
    clearStoredAuth()
    return emptySession<TUser>()
  }

  return {
    token,
    user: readJson<TUser | null>(USER_KEY, null),
    permissions: readJson<string[]>(PERMISSIONS_KEY, []),
    savedAt: readNumber(SAVED_AT_KEY),
    expiresAt: readNumber(EXPIRES_AT_KEY) ?? getJwtExpiryMs(token),
  }
}

export const writeStoredAuth = <TUser>(
  token: string,
  user: TUser,
  permissions: string[],
): void => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
  localStorage.setItem(SAVED_AT_KEY, String(Date.now()))

  const expiresAt = getJwtExpiryMs(token)
  if (expiresAt) {
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt))
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY)
  }
}

export const getStoredAuthToken = (): string | null => readStoredAuth<unknown>().token

