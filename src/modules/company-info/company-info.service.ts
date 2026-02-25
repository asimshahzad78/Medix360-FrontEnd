import { api } from '@/services/api'
import type { CompanyInfoApiDto, CompanyInfoSaveDto } from './company-info.types'

const mapToApiPayload = (payload: {
  name: string
  applicationTitle: string
  currency: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  fax: string
  website: string
  companyLogo: File | null
}): CompanyInfoSaveDto => ({
  Name: payload.name,
  ApplicationTitle: payload.applicationTitle,
  Currency: payload.currency,
  Address: payload.address,
  City: payload.city,
  Country: payload.country,
  Phone: payload.phone,
  Email: payload.email,
  Fax: payload.fax,
  Website: payload.website,
  CompanyLogo: payload.companyLogo ?? undefined,
})

export const companyInfoService = {
  // GET
  async get(): Promise<CompanyInfoApiDto> {
    const { data } = await api.get('/company-info')
    return data
  },

  // CREATE (FIRST TIME)
  async create(payload: {
    name: string
    applicationTitle: string
    currency: string
    address: string
    city: string
    country: string
    phone: string
    email: string
    fax: string
    website: string
    companyLogo: File | null
  }): Promise<void> {
    const dto = mapToApiPayload(payload)
    const formData = new FormData()

    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v)
    })

    await api.post('/company-info', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // UPDATE
  async update(
    id: number,
    payload: {
      name: string
      applicationTitle: string
      currency: string
      address: string
      city: string
      country: string
      phone: string
      email: string
      fax: string
      website: string
      companyLogo: File | null
    },
  ): Promise<void> {
    const dto = mapToApiPayload(payload)
    const formData = new FormData()

    formData.append('Id', String(id))
    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, v)
    })

    await api.put(`/company-info/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
