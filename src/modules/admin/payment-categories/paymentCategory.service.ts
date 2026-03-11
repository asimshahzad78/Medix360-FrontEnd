import { api } from '@/services/api'

/* =========================
   API DTO (Backend -> Frontend)
========================= */
export interface PaymentCategoryApiDto {
  Id: number
  PaymentItemCode: string
  Name: string
  UnitPrice: number
  Description?: string
  RevenueAccountId: string
  RevenueAccountName?: string
  IncludeInCounterClosing?: boolean
}

/* =========================
   SAVE DTO (Frontend -> Backend)
========================= */
export interface PaymentCategorySaveDto {
  paymentItemCode: string
  name: string
  unitPrice: number
  description?: string
  revenueAccountId: string
  includeInCounterClosing: boolean // ✅ camelCase (matches your modal payload)
}

/* =========================
   HELPERS
========================= */
const mapToApiPayload = (p: PaymentCategorySaveDto) => ({
  PaymentItemCode: p.paymentItemCode,
  Name: p.name,
  UnitPrice: p.unitPrice,
  Description: p.description,
  RevenueAccountId: p.revenueAccountId,

  // ✅ This is the key fix
  IncludeInCounterClosing: p.includeInCounterClosing,
})

/* =========================
   SERVICE
========================= */
export const paymentCategoryService = {
  async getAll(): Promise<PaymentCategoryApiDto[]> {
    const { data } = await api.get<PaymentCategoryApiDto[]>('/payment-categories')
    return data
  },

  async getById(id: number): Promise<PaymentCategoryApiDto> {
    const { data } = await api.get<PaymentCategoryApiDto>(`/payment-categories/${id}`)
    return data
  },

  async create(payload: PaymentCategorySaveDto): Promise<void> {
    await api.post('/payment-categories', mapToApiPayload(payload))
  },

  async update(id: number, payload: PaymentCategorySaveDto): Promise<void> {
    await api.put(`/payment-categories/${id}`, {
      Id: id,
      ...mapToApiPayload(payload),
    })
  },

  async cancel(id: number): Promise<void> {
    await api.post(`/payment-categories/${id}/cancel`)
  },

  async setCounterClosing(id: number, include: boolean): Promise<void> {
    await api.put(`/payment-categories/${id}/counter-closing`, {
      IncludeInCounterClosing: include,
    })
  },

  async getRevenueAccounts(): Promise<{ id: string; name: string }[]> {
    const { data } = await api.get<{ id: string; name: string }[]>('/chart-of-accounts/revenue')
    return data
  },
}
