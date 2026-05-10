// src/modules/hr/hr-lookups.service.ts
import { api } from '@/services/api'

export type DepartmentDto = {
  Id: number
  Name: string
  Code?: string | null
  Description?: string | null
  IsActive?: boolean
}

export type SubDepartmentDto = {
  Id: number
  DepartmentId: number
  Name: string
  Code?: string | null
  IsActive?: boolean
}

export type DesignationDto = {
  Id: number
  Name: string
  Code?: string | null
  Description?: string | null
  IsActive?: boolean
}

export type AttendanceLogDto = {
  Id: number
  EmployeeId?: number | null
  ShiftId?: number | null
  DutyRosterId?: number | null
  AttendanceDate?: string | null
  CheckInTime?: string | null
  CheckOutTime?: string | null
  Status?: string | null
  LateMinutes?: number | null
  OvertimeMinutes?: number | null
  Notes?: string | null
}

export type CredentialDto = {
  Id: number
  EmployeeId?: number | null
  Code?: string | null
  Name?: string | null
  CredentialNumber?: string | null
  IssuedBy?: string | null
  IssueDate?: string | null
  ExpiryDate?: string | null
  Status?: string | null
  Notes?: string | null
}

export type DisciplinaryIncidentDto = {
  Id: number
  EmployeeId?: number | null
  IncidentDate?: string | null
  IncidentType?: string | null
  Severity?: string | null
  ActionTaken?: string | null
  Status?: string | null
  Notes?: string | null
}

export type DutyRosterDto = {
  Id: number
  EmployeeId?: number | null
  ShiftId?: number | null
  DutyDate?: string | null
  IsOnCall?: boolean | null
  Notes?: string | null
}

export type EmploymentProfileTagDto = {
  Id: number
  Code?: string | null
  Name?: string | null
  Description?: string | null
  IsActive?: boolean | null
}

export type LeaveBalanceDto = {
  Id: number
  EmployeeId?: number | null
  LeaveTypeId?: number | null
  OpeningBalance?: number | null
  Earned?: number | null
  Availed?: number | null
  Balance?: number | null
}

export type LeaveRequestDto = {
  Id: number
  EmployeeId?: number | null
  LeaveTypeId?: number | null
  FromDate?: string | null
  ToDate?: string | null
  Days?: number | null
  Reason?: string | null
  Status?: string | null
  ApprovedByUserId?: string | null
  ApprovedAt?: string | null
}

export type LeaveTypeDto = {
  Id: number
  Code?: string | null
  Name?: string | null
  Description?: string | null
  DefaultDays?: number | null
  IsPaid?: boolean | null
  IsActive?: boolean | null
}

export type OnboardingChecklistItemDto = {
  Id: number
  Code?: string | null
  Name?: string | null
  Description?: string | null
  SequenceNo?: number | null
  IsRequired?: boolean | null
  IsActive?: boolean | null
}

export type PayrollDto = {
  Id: number
  EmployeeId?: number | null
  PayrollMonth?: string | null
  BasicSalary?: number | null
  Allowances?: number | null
  Deductions?: number | null
  NetSalary?: number | null
  Status?: string | null
}

export type PerformanceAppraisalDto = {
  Id: number
  EmployeeId?: number | null
  ReviewPeriodFrom?: string | null
  ReviewPeriodTo?: string | null
  Score?: number | null
  Rating?: string | null
  ReviewerUserId?: string | null
  Notes?: string | null
}

export type PermissionDto = {
  Id: number | string
  Code?: string | null
  Name?: string | null
  Description?: string | null
  GroupName?: string | null
  IsActive?: boolean | null
}

export type ShiftDto = {
  Id: number
  Code?: string | null
  Name?: string | null
  StartTime?: string | null
  EndTime?: string | null
  BreakMinutes?: number | null
  IsNightShift?: boolean | null
  IsActive?: boolean | null
}

export type TrainingEnrollmentDto = {
  Id: number
  EmployeeId?: number | null
  CourseName?: string | null
  Provider?: string | null
  StartDate?: string | null
  EndDate?: string | null
  ExpiryDate?: string | null
  CmeHours?: number | null
  Status?: string | null
  Notes?: string | null
}

export type PagedResult<T> = {
  items: T[]
  totalCount: number
}

async function list<T>(url: string, params?: Record<string, unknown>): Promise<PagedResult<T>> {
  const { data } = await api.get<PagedResult<T>>(url, { params })
  if (!data || typeof data !== 'object') return data

  const rawItems = (data as PagedResult<T>).items ?? (data as PagedResult<T> & { Items?: T[] }).Items
  if (!Array.isArray(rawItems)) return data

  return {
    ...(data as PagedResult<T>),
    items: rawItems.map((item) => pascalizeKeys(item)) as T[],
  }
}

function pascalizeKeys<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => pascalizeKeys(item)) as T
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, itemValue]) => [
      key ? `${key.charAt(0).toUpperCase()}${key.slice(1)}` : key,
      pascalizeKeys(itemValue),
    ]),
  ) as T
}

function toPascalPayload(payload: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key ? `${key.charAt(0).toUpperCase()}${key.slice(1)}` : key,
      value,
    ]),
  )
}

async function create(url: string, payload: Record<string, unknown>): Promise<void> {
  await api.post(url, toPascalPayload(payload), {
    meta: { auditReason: `Create ${hrEntityName(url)}`, idempotencyKey: true },
  })
}

type EntityId = number | string

function idSegment(id: EntityId): string {
  return encodeURIComponent(String(id))
}

async function update(url: string, id: EntityId, payload: Record<string, unknown>): Promise<void> {
  await api.put(`${url}/${idSegment(id)}`, toPascalPayload(payload), {
    meta: { auditReason: `Update ${hrEntityName(url)}`, idempotencyKey: true },
  })
}

async function remove(url: string, id: EntityId): Promise<void> {
  await api.delete(`${url}/${idSegment(id)}`, {
    meta: { auditReason: `Delete ${hrEntityName(url)}`, idempotencyKey: true },
  })
}

function hrEntityName(url: string): string {
  const segments = url.split('/').filter(Boolean)
  const segment = segments[segments.length - 1] ?? 'HR record'
  return segment
    .split('-')
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const hrLookupsService = {
  // ---------------- Departments ----------------
  async getDepartments(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<DepartmentDto>> {
    return list<DepartmentDto>('/hr/departments', params)
  },

  async createDepartment(payload: { name: string; code?: string | null; description?: string | null }): Promise<void> {
    await create('/hr/departments', payload)
  },

  async updateDepartment(
    id: number,
    payload: { name: string; code?: string | null; description?: string | null },
  ): Promise<void> {
    await update('/hr/departments', id, payload)
  },

  async deleteDepartment(id: EntityId): Promise<void> {
    await remove('/hr/departments', id)
  },

  // ---------------- SubDepartments ----------------
  async getSubDepartments(params?: {
    departmentId?: number
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<SubDepartmentDto>> {
    return list<SubDepartmentDto>('/hr/subdepartments', params)
  },

  async createSubDepartment(payload: {
    departmentId: number
    name: string
    code?: string | null
  }): Promise<void> {
    await create('/hr/subdepartments', payload)
  },

  async updateSubDepartment(
    id: number,
    payload: { departmentId: number; name: string; code?: string | null },
  ): Promise<void> {
    await update('/hr/subdepartments', id, payload)
  },

  async deleteSubDepartment(id: EntityId): Promise<void> {
    await remove('/hr/subdepartments', id)
  },

  // ---------------- Designations ----------------
  async getDesignations(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<DesignationDto>> {
    return list<DesignationDto>('/hr/designations', params)
  },

  async createDesignation(payload: { name: string; code?: string | null; description?: string | null }): Promise<void> {
    await create('/hr/designations', payload)
  },

  async updateDesignation(
    id: number,
    payload: { name: string; code?: string | null; description?: string | null },
  ): Promise<void> {
    await update('/hr/designations', id, payload)
  },

  async deleteDesignation(id: EntityId): Promise<void> {
    await remove('/hr/designations', id)
  },

  // ---------------- Attendance Logs ----------------
  async getAttendanceLogs(params?: { page?: number; pageSize?: number }): Promise<PagedResult<AttendanceLogDto>> {
    return list<AttendanceLogDto>('/hr/attendance-logs', params)
  },
  async createAttendanceLog(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/attendance-logs', payload)
  },
  async updateAttendanceLog(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/attendance-logs', id, payload)
  },
  async deleteAttendanceLog(id: EntityId): Promise<void> {
    await remove('/hr/attendance-logs', id)
  },

  // ---------------- Credentials ----------------
  async getCredentials(params?: { page?: number; pageSize?: number }): Promise<PagedResult<CredentialDto>> {
    return list<CredentialDto>('/hr/credentials', params)
  },
  async createCredential(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/credentials', payload)
  },
  async updateCredential(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/credentials', id, payload)
  },
  async deleteCredential(id: EntityId): Promise<void> {
    await remove('/hr/credentials', id)
  },

  // ---------------- Disciplinary Incidents ----------------
  async getDisciplinaryIncidents(params?: { page?: number; pageSize?: number }): Promise<PagedResult<DisciplinaryIncidentDto>> {
    return list<DisciplinaryIncidentDto>('/hr/disciplinary-incidents', params)
  },
  async createDisciplinaryIncident(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/disciplinary-incidents', payload)
  },
  async updateDisciplinaryIncident(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/disciplinary-incidents', id, payload)
  },
  async deleteDisciplinaryIncident(id: EntityId): Promise<void> {
    await remove('/hr/disciplinary-incidents', id)
  },

  // ---------------- Duty Rosters ----------------
  async getDutyRosters(params?: { page?: number; pageSize?: number }): Promise<PagedResult<DutyRosterDto>> {
    return list<DutyRosterDto>('/hr/duty-rosters', params)
  },
  async createDutyRoster(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/duty-rosters', payload)
  },
  async updateDutyRoster(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/duty-rosters', id, payload)
  },
  async deleteDutyRoster(id: EntityId): Promise<void> {
    await remove('/hr/duty-rosters', id)
  },

  // ---------------- Employment Profile Tags ----------------
  async getEmploymentProfileTags(params?: { page?: number; pageSize?: number }): Promise<PagedResult<EmploymentProfileTagDto>> {
    return list<EmploymentProfileTagDto>('/hr/employment-profile-tags', params)
  },
  async createEmploymentProfileTag(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/employment-profile-tags', payload)
  },
  async updateEmploymentProfileTag(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/employment-profile-tags', id, payload)
  },
  async deleteEmploymentProfileTag(id: EntityId): Promise<void> {
    await remove('/hr/employment-profile-tags', id)
  },

  // ---------------- Leave Balances ----------------
  async getLeaveBalances(params?: { page?: number; pageSize?: number }): Promise<PagedResult<LeaveBalanceDto>> {
    return list<LeaveBalanceDto>('/hr/leave-balances', params)
  },
  async createLeaveBalance(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/leave-balances', payload)
  },
  async updateLeaveBalance(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/leave-balances', id, payload)
  },
  async deleteLeaveBalance(id: EntityId): Promise<void> {
    await remove('/hr/leave-balances', id)
  },

  // ---------------- Leave Requests ----------------
  async getLeaveRequests(params?: { page?: number; pageSize?: number }): Promise<PagedResult<LeaveRequestDto>> {
    return list<LeaveRequestDto>('/hr/leave-requests', params)
  },
  async createLeaveRequest(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/leave-requests', payload)
  },
  async updateLeaveRequest(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/leave-requests', id, payload)
  },
  async deleteLeaveRequest(id: EntityId): Promise<void> {
    await remove('/hr/leave-requests', id)
  },

  // ---------------- Leave Types ----------------
  async getLeaveTypes(params?: { page?: number; pageSize?: number }): Promise<PagedResult<LeaveTypeDto>> {
    return list<LeaveTypeDto>('/hr/leave-types', params)
  },
  async createLeaveType(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/leave-types', payload)
  },
  async updateLeaveType(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/leave-types', id, payload)
  },
  async deleteLeaveType(id: EntityId): Promise<void> {
    await remove('/hr/leave-types', id)
  },

  // ---------------- Onboarding Checklist Items ----------------
  async getOnboardingChecklistItems(params?: { page?: number; pageSize?: number }): Promise<PagedResult<OnboardingChecklistItemDto>> {
    return list<OnboardingChecklistItemDto>('/hr/onboarding-checklist-items', params)
  },
  async createOnboardingChecklistItem(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/onboarding-checklist-items', payload)
  },
  async updateOnboardingChecklistItem(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/onboarding-checklist-items', id, payload)
  },
  async deleteOnboardingChecklistItem(id: EntityId): Promise<void> {
    await remove('/hr/onboarding-checklist-items', id)
  },

  // ---------------- Payrolls ----------------
  async getPayrolls(params?: { page?: number; pageSize?: number }): Promise<PagedResult<PayrollDto>> {
    return list<PayrollDto>('/hr/payrolls', params)
  },
  async createPayroll(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/payrolls', payload)
  },
  async updatePayroll(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/payrolls', id, payload)
  },
  async deletePayroll(id: EntityId): Promise<void> {
    await remove('/hr/payrolls', id)
  },

  // ---------------- Performance Appraisals ----------------
  async getPerformanceAppraisals(params?: { page?: number; pageSize?: number }): Promise<PagedResult<PerformanceAppraisalDto>> {
    return list<PerformanceAppraisalDto>('/hr/performance-appraisals', params)
  },
  async createPerformanceAppraisal(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/performance-appraisals', payload)
  },
  async updatePerformanceAppraisal(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/performance-appraisals', id, payload)
  },
  async deletePerformanceAppraisal(id: EntityId): Promise<void> {
    await remove('/hr/performance-appraisals', id)
  },

  // ---------------- Permissions ----------------
  async getPermissions(params?: { page?: number; pageSize?: number }): Promise<PagedResult<PermissionDto>> {
    return list<PermissionDto>('/hr/permissions', params)
  },
  async createPermission(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/permissions', payload)
  },
  async updatePermission(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/permissions', id, payload)
  },
  async deletePermission(id: EntityId): Promise<void> {
    await remove('/hr/permissions', id)
  },

  // ---------------- Shifts ----------------
  async getShifts(params?: { page?: number; pageSize?: number }): Promise<PagedResult<ShiftDto>> {
    return list<ShiftDto>('/hr/shifts', params)
  },
  async createShift(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/shifts', payload)
  },
  async updateShift(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/shifts', id, payload)
  },
  async deleteShift(id: EntityId): Promise<void> {
    await remove('/hr/shifts', id)
  },

  // ---------------- Training Enrollments ----------------
  async getTrainingEnrollments(params?: { page?: number; pageSize?: number }): Promise<PagedResult<TrainingEnrollmentDto>> {
    return list<TrainingEnrollmentDto>('/hr/training-enrollments', params)
  },
  async createTrainingEnrollment(payload: Record<string, unknown>): Promise<void> {
    await create('/hr/training-enrollments', payload)
  },
  async updateTrainingEnrollment(id: EntityId, payload: Record<string, unknown>): Promise<void> {
    await update('/hr/training-enrollments', id, payload)
  },
  async deleteTrainingEnrollment(id: EntityId): Promise<void> {
    await remove('/hr/training-enrollments', id)
  },
}
