import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'

export interface DoctorApiDto {
  Id?: number
  id?: number
  DocId?: number
  docId?: number
  DoctorsID?: string
  doctorsID?: string
  FirstName?: string
  firstName?: string
  LastName?: string
  lastName?: string
  DesignationDisplay?: string
  designationDisplay?: string
  DoctorFee?: number | null
  doctorFee?: number | null
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

const normalizeDoctor = (doctor: DoctorApiDto): DoctorApiDto => {
  const id = doctor.Id ?? doctor.id ?? 0
  const docId = doctor.DocId ?? doctor.docId ?? id
  const firstName = doctor.FirstName ?? doctor.firstName ?? ''
  const lastName = doctor.LastName ?? doctor.lastName ?? ''
  const designationDisplay = doctor.DesignationDisplay ?? doctor.designationDisplay ?? ''
  const doctorFee = doctor.DoctorFee ?? doctor.doctorFee ?? null
  const doctorsID = doctor.DoctorsID ?? doctor.doctorsID ?? ''

  return {
    ...doctor,
    Id: id,
    id,
    DocId: docId,
    docId,
    DoctorsID: doctorsID,
    doctorsID,
    FirstName: firstName,
    firstName,
    LastName: lastName,
    lastName,
    DesignationDisplay: designationDisplay,
    designationDisplay,
    DoctorFee: doctorFee,
    doctorFee,
  }
}

export const doctorService = {
  async getAll(): Promise<PagedResult<DoctorApiDto>> {
    const { data } = await api.get('/doctors')
    const result = unwrapApiData<PagedResult<DoctorApiDto>>(data, {
      items: [],
      totalCount: 0,
    })

    return {
      items: (result.items ?? []).map(normalizeDoctor),
      totalCount: result.totalCount ?? 0,
    }
  },
}
