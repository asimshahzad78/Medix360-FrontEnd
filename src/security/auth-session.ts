import { authTokenStorageMode } from '@/security/frontend-hardening'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const PERMISSIONS_KEY = 'permissions'
const SAVED_AT_KEY = 'authSavedAt'
const EXPIRES_AT_KEY = 'authExpiresAt'

const authStorage = (): Storage | null => {
  if (authTokenStorageMode === 'memory') return null
  return authTokenStorageMode === 'local' ? localStorage : sessionStorage
}

const fallbackStorage = (): Storage => (authTokenStorageMode === 'local' ? sessionStorage : localStorage)

const memoryAuth = new Map<string, string>()

const readItem = (key: string): string | null => {
  const storage = authStorage()
  return storage?.getItem(key) ?? memoryAuth.get(key) ?? null
}

const writeItem = (key: string, value: string): void => {
  const storage = authStorage()
  if (storage) {
    storage.setItem(key, value)
    memoryAuth.delete(key)
  } else {
    memoryAuth.set(key, value)
  }

  fallbackStorage().removeItem(key)
}

const removeItem = (key: string): void => {
  authStorage()?.removeItem(key)
  fallbackStorage().removeItem(key)
  memoryAuth.delete(key)
}

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
    const raw = readItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

const readNumber = (key: string): number | null => {
  const raw = readItem(key)
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
  removeItem(TOKEN_KEY)
  removeItem(USER_KEY)
  removeItem(PERMISSIONS_KEY)
  removeItem(SAVED_AT_KEY)
  removeItem(EXPIRES_AT_KEY)
}

export const readStoredAuth = <TUser>(): StoredAuthSession<TUser> => {
  const token = readItem(TOKEN_KEY)

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
  writeItem(TOKEN_KEY, token)
  writeItem(USER_KEY, JSON.stringify(user))
  writeItem(PERMISSIONS_KEY, JSON.stringify(permissions))
  writeItem(SAVED_AT_KEY, String(Date.now()))

  const expiresAt = getJwtExpiryMs(token)
  if (expiresAt) {
    writeItem(EXPIRES_AT_KEY, String(expiresAt))
  } else {
    removeItem(EXPIRES_AT_KEY)
  }
}

export const getStoredAuthToken = (): string | null => readStoredAuth<unknown>().token
