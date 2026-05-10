import { api } from '@/services/api'
import { unwrapApiData, type PagedResult } from '@/services/api-response'

export interface PatientApiDto {
  Id: number
  id?: number
  Title: string
  title?: string
  FirstName: string
  firstName?: string
  LastName: string
  lastName?: string
  Panel?: string
  panel?: string
  Gender: string
  gender?: string
  MaritalStatus: string
  maritalStatus?: string
  SpouseName?: string
  spouseName?: string
  Phone: string
  phone?: string
  Age?: number
  age?: number
  AgeUnit?: string
  ageUnit?: string
  AgeDisplay?: string
  ageDisplay?: string
  Email?: string
  email?: string
  BloodGroup?: string
  bloodGroup?: string
  FatherName?: string
  fatherName?: string
  MotherName?: string
  motherName?: string
  DateOfBirth?: string | null
  dateOfBirth?: string | null
  RegistrationFee?: number | null
  registrationFee?: number | null
  Address?: string
  address?: string
  Country?: string
  country?: string
  Agreement?: boolean | null
  agreement?: boolean | null
  Remarks?: string
  remarks?: string
  ProfilePicture?: string
  profilePicture?: string
  UserType?: number | null
  userType?: number | null
  RoleId?: number | null
  roleId?: number | null
}

export interface PatientSaveDto {
  title?: string
  firstName: string
  lastName: string
  phone: string
  age?: number | null
  panel?: string
  email?: string
  gender: string
  maritalStatus?: string
  spouseName?: string
  bloodGroup?: string
  fatherName?: string
  motherName?: string
  dateOfBirth?: string | null
  registrationFee?: number | null
  address?: string
  country?: string
  agreement?: boolean | null
  remarks?: string
  profilePictureDetails?: File | null
  userType?: number | null
  roleId?: number | null
  passwordHash?: string
  confirmPassword?: string
}

export interface PatientRoleOption {
  id: number
  name: string
  description?: string | null
}

const emptyPaged = <T>(page: number, pageSize: number): PagedResult<T> => ({
  items: [],
  pageNumber: page,
  pageSize,
  totalCount: 0,
})

const mapToApiPayload = (payload: PatientSaveDto) => {
  const includePassword = Boolean(payload.passwordHash && payload.confirmPassword)

  return {
    Title: payload.title,
    FirstName: payload.firstName,
    LastName: payload.lastName,
    Phone: payload.phone,
    Panel: payload.panel,
    Age: payload.age,
    Email: payload.email,
    Gender: payload.gender,
    MaritalStatus: payload.maritalStatus,
    SpouseName: payload.spouseName,
    BloodGroup: payload.bloodGroup,
    FatherName: payload.fatherName,
    MotherName: payload.motherName,
    DateOfBirth: payload.dateOfBirth,
    RegistrationFee: payload.registrationFee,
    Address: payload.address,
    Country: payload.country,
    Agreement: payload.agreement,
    Remarks: payload.remarks,
    ProfilePictureDetails: payload.profilePictureDetails ?? undefined,
    UserType: payload.userType,
    RoleId: payload.roleId,
    PasswordHash: includePassword ? payload.passwordHash : undefined,
    ConfirmPassword: includePassword ? payload.confirmPassword : undefined,
  }
}

const normalizePhone = (phone?: string) => phone?.replace(/\D/g, '') ?? ''

const normalizeRoleOption = (role: Record<string, unknown>): PatientRoleOption | null => {
  const id = role.id ?? role.Id
  const name = role.name ?? role.Name
  const description = role.description ?? role.Description

  if (typeof id !== 'number' || !Number.isFinite(id) || typeof name !== 'string' || !name.trim()) {
    return null
  }

  return {
    id,
    name,
    description: typeof description === 'string' ? description : null,
  }
}

export const normalizePatient = (patient: PatientApiDto): PatientApiDto => ({
  Id: patient.Id ?? patient.id ?? 0,
  Title: patient.Title ?? patient.title ?? '',
  FirstName: patient.FirstName ?? patient.firstName ?? '',
  LastName: patient.LastName ?? patient.lastName ?? '',
  Panel: patient.Panel ?? patient.panel ?? '',
  Gender: patient.Gender ?? patient.gender ?? '',
  MaritalStatus: patient.MaritalStatus ?? patient.maritalStatus ?? '',
  SpouseName: patient.SpouseName ?? patient.spouseName,
  Phone: patient.Phone ?? patient.phone ?? '',
  Age: patient.Age ?? patient.age,
  AgeUnit: patient.AgeUnit ?? patient.ageUnit,
  AgeDisplay: patient.AgeDisplay ?? patient.ageDisplay,
  Email: patient.Email ?? patient.email,
  BloodGroup: patient.BloodGroup ?? patient.bloodGroup,
  FatherName: patient.FatherName ?? patient.fatherName,
  MotherName: patient.MotherName ?? patient.motherName,
  DateOfBirth: patient.DateOfBirth ?? patient.dateOfBirth,
  RegistrationFee: patient.RegistrationFee ?? patient.registrationFee,
  Address: patient.Address ?? patient.address,
  Country: patient.Country ?? patient.country,
  Agreement: patient.Agreement ?? patient.agreement,
  Remarks: patient.Remarks ?? patient.remarks,
  ProfilePicture: patient.ProfilePicture ?? patient.profilePicture,
  UserType: patient.UserType ?? patient.userType,
  RoleId: patient.RoleId ?? patient.roleId,
})

const toRequestBody = (payload: PatientSaveDto) => {
  const dto = mapToApiPayload(payload)
  if (!payload.profilePictureDetails) return dto

  const formData = new FormData()
  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof File ? value : String(value))
    }
  })

  return formData
}

export const patientService = {
  async getManageRoles(): Promise<PatientRoleOption[]> {
    const { data } = await api.get('/roles/manage')
    const rows: unknown[] = Array.isArray(data) ? data : data?.items ?? data?.Items ?? []

    return rows
      .filter((role: unknown): role is Record<string, unknown> => typeof role === 'object' && role !== null)
      .map(normalizeRoleOption)
      .filter((role): role is PatientRoleOption => role !== null)
  },

  async getPaged(page: number, pageSize: number, search?: string): Promise<PagedResult<PatientApiDto>> {
    const { data } = await api.get('/patients', {
      params: { page, pageSize, search: search?.trim() || undefined },
    })

    const result = unwrapApiData<PagedResult<PatientApiDto>>(data, emptyPaged(page, pageSize))

    return {
      ...emptyPaged<PatientApiDto>(page, pageSize),
      ...result,
      items: (result.items ?? []).map(normalizePatient),
      totalCount: result.totalCount ?? 0,
    }
  },

  async getById(id: number): Promise<PatientApiDto> {
    const { data } = await api.get(`/patients/${id}`)
    return normalizePatient(unwrapApiData<PatientApiDto>(data, data as PatientApiDto))
  },

  async create(payload: PatientSaveDto): Promise<void> {
    await api.post('/patients', toRequestBody(payload), {
      headers: payload.profilePictureDetails ? { 'Content-Type': 'multipart/form-data' } : undefined,
      meta: { auditReason: 'Create patient registration', idempotencyKey: true },
    })
  },

  async update(id: number, payload: PatientSaveDto): Promise<void> {
    const body = toRequestBody(payload)
    if (body instanceof FormData) {
      body.append('Id', String(id))
    }

    await api.put(
      `/patients/${id}`,
      body instanceof FormData
        ? body
        : {
            Id: id,
            ...body,
          },
      {
        headers: body instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        meta: { auditReason: 'Update patient registration', idempotencyKey: true },
      },
    )
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`, {
      meta: { auditReason: 'Delete patient registration', idempotencyKey: true },
    })
  },

  async search(term: string): Promise<PatientApiDto[]> {
    const { data } = await api.get('/patients/search', {
      params: { term },
    })

    return unwrapApiData<PatientApiDto[]>(data, []).map(normalizePatient)
  },

  async findDuplicates(payload: Pick<PatientSaveDto, 'firstName' | 'phone'>): Promise<PatientApiDto[]> {
    const term = payload.phone?.trim() || payload.firstName?.trim()
    if (!term || term.length < 3) return []

    const matches = await this.search(term)
    const phone = normalizePhone(payload.phone)
    const name = payload.firstName?.trim().toLowerCase()

    return matches.filter((patient) => {
      const phoneMatch = phone.length >= 3 && normalizePhone(patient.Phone).includes(phone)
      const patientName = `${patient.FirstName ?? ''} ${patient.LastName ?? ''}`.trim().toLowerCase()
      const nameMatch = Boolean(name && name.length >= 3 && patientName.includes(name))

      return phoneMatch || nameMatch
    })
  },
}
