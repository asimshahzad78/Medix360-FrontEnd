import { api } from '@/services/api'

export interface DoctorApiDto {
  Id: number
  DocId: number
  FirstName: string
  LastName: string
  DoctorFee?: number | null
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

export const doctorService = {
  async getAll(): Promise<PagedResult<DoctorApiDto>> {
    const { data } = await api.get('/doctors')
    return data
  },
}
