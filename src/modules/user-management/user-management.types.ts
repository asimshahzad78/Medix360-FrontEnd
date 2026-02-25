// src/modules/user-management/user-management.types.ts

export type PagedResult<T> = {
  items: T[]
  totalCount: number
}

export type UserRowDto = {
  id: string
  email: string
  isActive: boolean
  jobRoleId: number | null
  jobRoleName: string | null
}

export type PermissionDto = {
  code: string
  name: string
  group: string
  description?: string | null
  isActive: boolean
}

// GET /api/admin/users/{id}/permissions
export type UserPermissionsResponse = {
  all: PermissionDto[]
  assigned: string[] // effective assigned (jobrole + overrides)
}

// PUT /api/admin/users/{id}/permissions
export type UpdateUserPermissionsRequest = {
  permissions: string[]
}

// PUT /api/admin/users/{id}/status
export type UpdateUserStatusRequest = {
  isActive: boolean
}

// PUT /api/admin/users/{id}/job-role
export type UpdateUserJobRoleRequest = {
  jobRoleId: number | null
}

// Job roles list (ManageUserRoles)
export type JobRoleDto = {
  id: number
  name: string
  description?: string | null
}

export type ResetPasswordDto = { newPassword: string }
