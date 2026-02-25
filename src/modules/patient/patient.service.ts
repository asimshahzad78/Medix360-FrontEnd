import { api } from '@/services/api'

/**
 * API → Patient (GET by id / list)
 */
export interface PatientApiDto {
  Id: number
  Title: string
  FirstName: string
  LastName: string
  Gender: string
  MaritalStatus: string
  Phone: string
  Age?: number
  Email?: string
  BloodGroup?: string
  FatherName?: string
  MotherName?: string
  DateOfBirth?: string | null
  RegistrationFee?: number | null
  Address?: string
  Country?: string
  Remarks?: string
}

/**
 * Generic paged result
 */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

const mapToApiPayload = (payload: PatientSaveDto) => ({
  Title: payload.title,
  FirstName: payload.firstName,
  LastName: payload.lastName,
  Phone: payload.phone,
  Age: payload.age,
  Email: payload.email,
  Gender: payload.gender,
  MaritalStatus: payload.maritalStatus,
  BloodGroup: payload.bloodGroup,
  FatherName: payload.fatherName,
  MotherName: payload.motherName,
  DateOfBirth: payload.dateOfBirth,
  RegistrationFee: payload.registrationFee,
  Address: payload.address,
  Country: payload.country,
  Remarks: payload.remarks,
  PasswordHash: payload.passwordHash,
})

/**
 * Payload used for Create / Update
 * (frontend → backend)
 */
export interface PatientSaveDto {
  title?: string
  firstName: string
  lastName: string
  phone: string
  age?: number | null
  email?: string
  gender: string
  maritalStatus?: string
  bloodGroup?: string
  fatherName?: string
  motherName?: string
  dateOfBirth?: string | null
  registrationFee?: number | null
  address?: string
  country?: string
  remarks?: string
  passwordHash?: string
}

/**
 * PATIENT SERVICE
 */
export const patientService = {
  // 🔹 PAGED LIST
  async getPaged(page: number, pageSize: number, search?: string): Promise<PagedResult<PatientApiDto>> {
  const { data } = await api.get('/patients', {
    params: { page, pageSize, search: search?.trim() || undefined },
  })
  return data
},

  // 🔹 GET BY ID (FOR EDIT MODAL) ✅
  async getById(id: number): Promise<PatientApiDto> {
    const { data } = await api.get(`/patients/${id}`)
    return data
  },

  // 🔹 CREATE
  async create(payload: PatientSaveDto): Promise<void> {
    await api.post('/patients', mapToApiPayload(payload))
  },

  async update(id: number, payload: PatientSaveDto): Promise<void> {
    await api.put(`/patients/${id}`, {
      Id: id,
      ...mapToApiPayload(payload),
    })
  },

  // 🔹 SOFT DELETE
  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`)
  },

  // 🔹 AUTOCOMPLETE SEARCH
  async search(term: string): Promise<PatientApiDto[]> {
    const { data } = await api.get('/patients/search', {
      params: { term },
    })
    return data
  },
}
