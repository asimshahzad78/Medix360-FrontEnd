import { defineStore } from 'pinia'
import {
  clearStoredAuth,
  isTokenUsable,
  readStoredAuth,
  writeStoredAuth,
} from '@/security/auth-session'
import { clearPlatformContext } from '@/services/systemContext'
import { hasAllPermissions, hasAnyPermission, type PermissionRule } from '@/security/permissions'

export interface AuthUser {
  Id: string
  Email: string
  JobRoleId: number
  TenantId?: string
  FacilityId?: string
  PropertyId?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  permissions: string[]
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const session = readStoredAuth<AuthUser>()

    return {
      token: session.token,
      user: session.user,
      permissions: session.permissions,
    }
  },

  getters: {
    isLoggedIn: (state) => isTokenUsable(state.token),

    hasPerm: (state) => (perm: string) => state.permissions.includes(perm),
    canAny: (state) => (permissions: PermissionRule) =>
      hasAnyPermission(state.permissions, permissions),
    canAll: (state) => (permissions: PermissionRule) =>
      hasAllPermissions(state.permissions, permissions),
  },

  actions: {
    setAuth(token: string, user: AuthUser, permissions: string[]) {
      this.token = token
      this.user = user
      this.permissions = permissions

      writeStoredAuth(token, user, permissions)
    },

    logout() {
      this.token = null
      this.user = null
      this.permissions = []

      clearStoredAuth()
      clearPlatformContext()
    },
  },
})
