import { api } from '@/services/api'

/**
 * API → Employee (UserProfile)
 * Mirrors patient.service.ts style
 */

export interface EmployeeApiDto {
  UserProfileId: number
  EmployeeId?: string | null
  FirstName: string
  LastName: string
  Email?: string | null
  PhoneNumber?: string | null

  DateOfBirth?: string | null
  JoiningDate?: string | null
  LeavingDate?: string | null

  Department?: number
  SubDepartment?: number
  Designation?: number

  Address?: string | null
  Country?: string | null

  UserType: number
  RoleId: number
  ApplicationUserId?: string | null
  hasUser?: boolean
}


export type EmployeeHrProfileDto = {
  userProfileId: number
  employeeId?: string | null
  firstName: string
  lastName: string
  phoneNumber?: string | null
  email?: string | null
  dateOfBirth?: string | null
  joiningDate?: string | null
  leavingDate?: string | null
  department?: number | null
  subDepartment?: number | null
  designation?: number | null
  address?: string | null
  country?: string | null
  userType: number
  roleId?: number | null
  applicationUserId?: string | null
}

/**
 * Generic paged result
 */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

type LookupPascal = { Id: number; Name: string }
type LookupCamel = { id: number; name: string }
type LookupItem = LookupPascal | LookupCamel

const isPascalLookup = (x: LookupItem): x is LookupPascal => 'Id' in x
const isCamelLookup = (x: LookupItem): x is LookupCamel => 'id' in x

const toLookup = (x: LookupItem) => {
  if (isPascalLookup(x)) return { id: x.Id, name: x.Name }
  if (isCamelLookup(x)) return { id: x.id, name: x.name }
  // fallback (should never hit if backend is consistent)
  return { id: 0, name: '' }
}

type PagedLookup = {
  Items?: LookupPascal[]
  items?: LookupCamel[]
}

/**
 * Payload used for Create / Update (frontend → backend)
 * NOTE: employee creation does NOT create login by default.
 */
export interface EmployeeSaveDto {
  employeeId?: string | null
  firstName: string
  lastName: string
  email?: string | null
  phoneNumber?: string | null

  dateOfBirth?: string | null
  joiningDate?: string | null
  leavingDate?: string | null

  department?: number | null
  subDepartment?: number | null
  designation?: number | null

  address?: string | null
  country?: string | null

  userType: number
  roleId?: number | null
}

const mapToApiPayload = (payload: EmployeeSaveDto) => ({
  EmployeeId: payload.employeeId,
  FirstName: payload.firstName,
  LastName: payload.lastName,
  Email: payload.email,
  PhoneNumber: payload.phoneNumber,
  DateOfBirth: payload.dateOfBirth,
  JoiningDate: payload.joiningDate,
  LeavingDate: payload.leavingDate,
  Department: payload.department ?? 0,
  SubDepartment: payload.subDepartment ?? 0,
  Designation: payload.designation ?? 0,
  Address: payload.address,
  Country: payload.country,
  UserType: payload.userType,
  RoleId: payload.roleId ?? 0,
})

/**
 * Create login for employee (calls EmployeeUsers API)
 */
export interface CreateUserForEmployeeDto {
  manageRoleId: number
  userType?: number | null
  email?: string | null
  phoneNumber?: string | null
  password: string
  confirmPassword: string
}

export interface CreateUserForEmployeeResult {
  employeeId: number
  applicationUserId: string
  email: string
  manageRoleId: number
  rolesAssigned: string[]
}

export interface ManageRoleDto {
  Id: number
  Name: string
  Description?: string | null
}

/**
 * Doctor info payload (saved only when user exists)
 */
export interface DoctorInfoSaveDto {
  applicationUserId: string
  designationId: number
  doctorsID?: string | null
  doctorFee?: number | null
  doctorPayableAccountId?: string | null // GUID as string
  sharePercentage?: number | null
}

export const employeeService = {
  // 🔹 PAGED LIST
  async getPaged(
    page: number,
    pageSize: number,
    userType?: number | null,
    search?: string | null,
  ): Promise<PagedResult<EmployeeApiDto>> {
    const { data } = await api.get('/employees', {
      params: { page, pageSize, userType: userType ?? undefined, search: search ?? undefined },
    })
    return data
  },

  // 🔹 GET BY ID (FOR EDIT MODAL)
  async getById(id: number): Promise<EmployeeApiDto> {
    const { data } = await api.get(`/employees/${id}`)
    return data
  },

  // 🔹 CREATE employee record only
  async create(payload: EmployeeSaveDto): Promise<{ userProfileId: number; employeeId?: string | null }> {
    const { data } = await api.post('/employees', mapToApiPayload(payload))

    // your backend returns JsonResultViewModel
    const obj = data?.ModelObject ?? data?.modelObject ?? data?.Model ?? data

    return {
      userProfileId: obj?.UserProfileId ?? obj?.userProfileId ?? obj?.userProfileID ?? obj?.id ?? 0,
      employeeId: obj?.EmployeeId ?? obj?.employeeId ?? null,
    }
  },

  async update(id: number, payload: EmployeeSaveDto): Promise<void> {
    await api.put(`/employees/${id}`, {
      UserProfileId: id,
      ...mapToApiPayload(payload),
    })
  },

  // 🔹 SOFT DELETE
  async delete(id: number): Promise<void> {
    await api.delete(`/employees/${id}`)
  },

  // 🔹 Roles dropdown (ManageUserRoles)
  async getManageRoles(): Promise<ManageRoleDto[]> {
    const { data } = await api.get('/roles/manage')
    return data
  },

  // 🔹 Create login user for employee
  async createUser(employeeId: number, dto: CreateUserForEmployeeDto): Promise<CreateUserForEmployeeResult> {
    const { data } = await api.post(`/employees/${employeeId}/create-user`, {
      ManageRoleId: dto.manageRoleId,
      UserType: dto.userType ?? undefined,
      Email: dto.email ?? undefined,
      PhoneNumber: dto.phoneNumber ?? undefined,
      Password: dto.password,
      ConfirmPassword: dto.confirmPassword,
    })

    const obj = data?.ModelObject ?? data?.modelObject ?? data
    return obj as CreateUserForEmployeeResult
  },

  // 🔹 Create doctor info (only when ApplicationUserId exists)
  async createDoctorInfo(dto: DoctorInfoSaveDto): Promise<void> {
    await api.post('/doctors', {
      ApplicationUserId: dto.applicationUserId,
      DesignationId: dto.designationId,
      DoctorsID: dto.doctorsID,
      DoctorFee: dto.doctorFee,
      DoctorPayableAccountId: dto.doctorPayableAccountId,
      SharePercentage: dto.sharePercentage ?? 0,
    })
  },

  // 🔹 Chart of Accounts helper
  async getPaymentAccounts(
    tenantId: string,
    propertyId: string,
  ): Promise<Array<{ id: string; name: string; code: string }>> {
    const { data } = await api.get('/ChartOfAccount/payment-accounts', {
      params: { tenantId, propertyId },
    })
    return data
  },

  // 🔹 HR profile
  async getHrProfile(userProfileId: number) {
    return api.get(`/hr/employees/${userProfileId}/profile`)
  },

  async upsertHrProfile(userProfileId: number, dto: EmployeeHrProfileDto) {
    return api.put(`/hr/employees/${userProfileId}/profile`, dto)
  },

  // ✅ Lookups (HR) — add as NORMAL methods in the object
async getDepartments(): Promise<Array<{ id: number; name: string }>> {
  const { data } = await api.get('/hr/departments')
  const items: LookupItem[] = (data as PagedLookup).Items ?? (data as PagedLookup).items ?? []
  return items.map(toLookup)
},

async getDesignations(): Promise<Array<{ id: number; name: string }>> {
  const { data } = await api.get('/hr/designations')
  const items: LookupItem[] = (data as PagedLookup).Items ?? (data as PagedLookup).items ?? []
  return items.map(toLookup)
},

async getSubDepartments(departmentId: number): Promise<Array<{ id: number; name: string }>> {
  const { data } = await api.get(`/hr/lookups/departments/${departmentId}/subdepartments`)
  return (data ?? []).map((x: { id: number; name: string }) => ({ id: x.id, name: x.name }))
}
}
