import { api } from '@/services/api'
import type { RevenueVoucherApiDto } from './revenueVoucher.types'

export const revenueVoucherService = {
  async getAll(tenantId: string, propertyId: string): Promise<RevenueVoucherApiDto[]> {
    const { data } = await api.get<RevenueVoucherApiDto[]>('/RevenueVoucher', {
      params: { tenantId, propertyId },
    })
    return data
  },

  async getById(id: string, tenantId: string, propertyId: string): Promise<RevenueVoucherApiDto> {
    const { data } = await api.get<RevenueVoucherApiDto>(`/RevenueVoucher/${id}`, {
      params: { tenantId, propertyId },
    })
    return data
  },

  async post(
    id: string,
    tenantId: string,
    propertyId: string,
    payload: {
      EntryDate: string
      ReferenceNo: string
      Description?: string
      Lines: {
        AccountId: string
        Debit: number
        Credit: number
        Description?: string
      }[]
    },
  ): Promise<void> {
    await api.post(`/RevenueVoucher/${id}/post`, payload, {
      params: { tenantId, propertyId },
    })
  },

  async reverse(id: string, tenantId: string, propertyId: string, reason?: string): Promise<void> {
    await api.post(`/RevenueVoucher/${id}/reverse`, reason ?? null, {
      params: { tenantId, propertyId },
    })
  },
}
