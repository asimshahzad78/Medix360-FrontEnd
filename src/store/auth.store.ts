import { defineStore } from 'pinia'

export interface AuthUser {
  Id: string
  Email: string
  JobRoleId: number
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  permissions: string[]
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: readJson<AuthUser | null>('user', null),
    permissions: readJson<string[]>('permissions', []),
  }),

  getters: {
    isLoggedIn: (state) =>
      !!state.token && state.token !== 'null' && state.token !== 'undefined',

    hasPerm: (state) => (perm: string) => state.permissions.includes(perm),
  },

  actions: {
    setAuth(token: string, user: AuthUser, permissions: string[]) {
      this.token = token
      this.user = user
      this.permissions = permissions

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('permissions', JSON.stringify(permissions))
    },

    logout() {
      this.token = null
      this.user = null
      this.permissions = []

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
    },
  },
})
