// src/modules/user-management/user-management.service.ts

import { api } from '@/services/api'
import type {
  PagedResult,
  UserRowDto,
  UserPermissionsResponse,
  UpdateUserPermissionsRequest,
  UpdateUserStatusRequest,
  UpdateUserJobRoleRequest,
  JobRoleDto,
  PermissionDto,
} from './user-management.types'

export type ResetPasswordDto = { newPassword: string }

// ---------- safe helpers (NO any) ----------
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const pickModelObject = (data: unknown): unknown => {
  if (!isRecord(data)) return data
  const mo = data.ModelObject ?? data.modelObject ?? data.Model ?? data.model
  return mo ?? data
}

const asString = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)

const asNullableString = (v: unknown): string | null => (typeof v === 'string' ? v : null)

const asBool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback)

const asNumber = (v: unknown, fallback = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback

const asArray = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

export const userManagementService = {
  // ✅ Paged users list
  async getUsers(page: number, pageSize: number, search?: string | null): Promise<PagedResult<UserRowDto>> {
    const { data } = await api.get('/admin/users', {
      params: { page, pageSize, search: search ?? undefined },
    })

    const obj = pickModelObject(data)

    // expected: { items, totalCount } (Pascal or camel)
    if (!isRecord(obj)) return { items: [], totalCount: 0 }

    const itemsRaw = asArray<unknown>(obj.items ?? obj.Items)
    const totalCount = asNumber(obj.totalCount ?? obj.TotalCount, 0)

    const items: UserRowDto[] = []

    for (const r of itemsRaw) {
      if (!isRecord(r)) continue

      const id = asString(r.id ?? r.Id, '')
      const email = asString(r.email ?? r.Email, '')
      if (!id || !email) continue

      const isActive = asBool(r.isActive ?? r.IsActive, true)

      const jobRoleIdRaw = r.jobRoleId ?? r.JobRoleId
      const jobRoleId =
        typeof jobRoleIdRaw === 'number' && Number.isFinite(jobRoleIdRaw) ? jobRoleIdRaw : null

      const jobRoleNameRaw = r.jobRoleName ?? r.JobRoleName
      const jobRoleName = typeof jobRoleNameRaw === 'string' ? jobRoleNameRaw : null

      items.push({ id, email, isActive, jobRoleId, jobRoleName })
    }

    return { items, totalCount }
  },

  // ✅ Enable/Disable
  async updateStatus(userId: string, dto: UpdateUserStatusRequest): Promise<void> {
    await api.put(`/admin/users/${encodeURIComponent(userId)}/status`, dto)
  },

  // ✅ Assign Job Role (ManageUserRoles)
  async updateJobRole(userId: string, dto: UpdateUserJobRoleRequest): Promise<void> {
    await api.put(`/admin/users/${encodeURIComponent(userId)}/job-role`, dto)
  },

  // ✅ Job Roles dropdown (ManageUserRoles)
  async getJobRoles(): Promise<JobRoleDto[]> {
    const { data } = await api.get('/admin/job-roles')
    const obj = pickModelObject(data)

    const rows = asArray<unknown>(obj)
    const out: JobRoleDto[] = []

    for (const r of rows) {
      if (!isRecord(r)) continue

      const id = asNumber(r.id ?? r.Id, 0)
      const name = asString(r.name ?? r.Name, '')
      if (!id || !name) continue

      const desc = asNullableString(r.description ?? r.Description)

      out.push({
        id,
        name,
        ...(desc !== null ? { description: desc } : {}),
      })
    }

    return out
  },

  // ✅ Load permissions for a user
  async getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    const { data } = await api.get(`/admin/users/${encodeURIComponent(userId)}/permissions`)
    const obj = pickModelObject(data)

    if (!isRecord(obj)) return { all: [], assigned: [] }

    const allRaw = asArray<unknown>(obj.all ?? obj.All)
    const assignedRaw = asArray<unknown>(obj.assigned ?? obj.Assigned)

    const all: PermissionDto[] = []

    for (const p of allRaw) {
      if (!isRecord(p)) continue

      const code = asString(p.code ?? p.Code, '')
      const name = asString(p.name ?? p.Name, '')
      const group = asString(p.group ?? p.Group, '')
      const isActive = asBool(p.isActive ?? p.IsActive, true)

      if (!code || !name || !group) continue

      const desc = asNullableString(p.description ?? p.Description)

      all.push({
        code,
        name,
        group,
        isActive,
        ...(desc !== null ? { description: desc } : {}),
      })
    }

    const assigned = assignedRaw
      .map((x) => asString(x, ''))
      .filter((s) => s.length > 0)

    return { all, assigned }
  },

  // ✅ Save permissions (assign/unassign)
  async updateUserPermissions(userId: string, dto: UpdateUserPermissionsRequest): Promise<void> {
    await api.put(`/admin/users/${encodeURIComponent(userId)}/permissions`, dto)
  },



async resetPassword(userId: string, dto: ResetPasswordDto): Promise<void> {
  await api.put(`/admin/users/${userId}/reset-password`, dto)
}
}
