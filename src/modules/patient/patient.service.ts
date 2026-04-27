import { api } from '@/services/api'
import { unwrapApiData, type PagedResult } from '@/services/api-response'

export interface PatientApiDto {
  Id: number
  Title: string
  FirstName: string
  LastName: string
  Panel?: string
  Gender: string
  MaritalStatus: string
  SpouseName?: string
  Phone: string
  Age?: number
  AgeUnit?: string
  AgeDisplay?: string
  Email?: string
  BloodGroup?: string
  FatherName?: string
  MotherName?: string
  DateOfBirth?: string | null
  RegistrationFee?: number | null
  Address?: string
  Country?: string
  Agreement?: boolean | null
  Remarks?: string
  ProfilePicture?: string
  UserType?: number | null
  RoleId?: number | null
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

const emptyPaged = <T>(page: number, pageSize: number): PagedResult<T> => ({
  items: [],
  pageNumber: page,
  pageSize,
  totalCount: 0,
})

const mapToApiPayload = (payload: PatientSaveDto) => ({
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
  PasswordHash: payload.passwordHash,
  ConfirmPassword: payload.confirmPassword,
})

const normalizePhone = (phone?: string) => phone?.replace(/\D/g, '') ?? ''

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
  async getPaged(page: number, pageSize: number, search?: string): Promise<PagedResult<PatientApiDto>> {
    const { data } = await api.get('/patients', {
      params: { page, pageSize, search: search?.trim() || undefined },
    })

    const result = unwrapApiData<PagedResult<PatientApiDto>>(data, emptyPaged(page, pageSize))

    return {
      ...emptyPaged<PatientApiDto>(page, pageSize),
      ...result,
      items: result.items ?? [],
      totalCount: result.totalCount ?? 0,
    }
  },

  async getById(id: number): Promise<PatientApiDto> {
    const { data } = await api.get(`/patients/${id}`)
    return unwrapApiData<PatientApiDto>(data, data as PatientApiDto)
  },

  async create(payload: PatientSaveDto): Promise<void> {
    await api.post('/patients', toRequestBody(payload), {
      headers: payload.profilePictureDetails ? { 'Content-Type': 'multipart/form-data' } : undefined,
      meta: { idempotencyKey: true },
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
      },
    )
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`)
  },

  async search(term: string): Promise<PatientApiDto[]> {
    const { data } = await api.get('/patients/search', {
      params: { term },
    })

    return unwrapApiData<PatientApiDto[]>(data, [])
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
