import { defineStore } from 'pinia'
import {
  clearStoredAuth,
  isTokenUsable,
  readStoredAuth,
  writeStoredAuth,
} from '@/security/auth-session'
import { clearPlatformContext } from '@/services/systemContext'
import {
  FRONTEND_PERMISSION_CODES,
  hasAllPermissions,
  hasAnyPermission,
  type PermissionRule,
} from '@/security/permissions'

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

const isAdminUser = (user: AuthUser): boolean =>
  user.JobRoleId === 1 || user.Email.trim().toLowerCase() === 'admin@gmail.com'

const normalizePermissions = (user: AuthUser, permissions: string[]): string[] => {
  const normalized = new Set(permissions)

  if (isAdminUser(user)) {
    FRONTEND_PERMISSION_CODES.forEach((permission) => normalized.add(permission))
  }

  return [...normalized]
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const session = readStoredAuth<AuthUser>()
    const permissions = session.user
      ? normalizePermissions(session.user, session.permissions)
      : session.permissions

    return {
      token: session.token,
      user: session.user,
      permissions,
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
      const normalizedPermissions = normalizePermissions(user, permissions)

      this.token = token
      this.user = user
      this.permissions = normalizedPermissions

      writeStoredAuth(token, user, normalizedPermissions)
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
