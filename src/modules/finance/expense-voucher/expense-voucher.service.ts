import { api } from '@/services/api'
import { systemContext } from '@/services/systemContext'
import type { ExpenseVoucherApiDto, ExpenseVoucherSaveDto } from './expense-voucher.types'

const BASE = '/ExpenseVoucher' // controller: [Route("api/[controller]")] => /api/ExpenseVoucher

function getFinanceScope() {
  return {
    tenantId: systemContext.tenantId,
    propertyId: systemContext.propertyId,
  }
}

export const expenseVoucherService = {
  async getAll(): Promise<ExpenseVoucherApiDto[]> {
    const scope = getFinanceScope()
    const { data } = await api.get<ExpenseVoucherApiDto[]>(BASE, { params: scope })
    return data
  },

  async getById(id: string): Promise<ExpenseVoucherApiDto> {
    const scope = getFinanceScope()
    const { data } = await api.get<ExpenseVoucherApiDto>(`${BASE}/${id}`, { params: scope })
    return data
  },

  async create(payload: ExpenseVoucherSaveDto): Promise<ExpenseVoucherApiDto> {
    const scope = getFinanceScope()

    const dto: ExpenseVoucherApiDto = {
      Date: payload.date,
      Description: payload.description,
      Amount: payload.amount,
      ExpenseAccountId: payload.expenseAccountId,
      BankAccountId: payload.paymentAccountId, // UI paymentAccountId -> API BankAccountId
    }

    const { data } = await api.post<ExpenseVoucherApiDto>(BASE, dto, { params: scope })
    return data
  },

  async update(id: string, payload: ExpenseVoucherSaveDto): Promise<ExpenseVoucherApiDto> {
    const scope = getFinanceScope()

    const dto: ExpenseVoucherApiDto = {
      Id: id,
      Date: payload.date,
      Description: payload.description,
      Amount: payload.amount,
      ExpenseAccountId: payload.expenseAccountId,
      BankAccountId: payload.paymentAccountId,
    }

    const { data } = await api.put<ExpenseVoucherApiDto>(`${BASE}/${id}`, dto, { params: scope })
    return data
  },

  async delete(id: string): Promise<void> {
    const scope = getFinanceScope()
    await api.delete(`${BASE}/${id}`, { params: scope })
  },

  async post(id: string): Promise<void> {
    const scope = getFinanceScope()
    await api.post(`${BASE}/${id}/post`, null, { params: scope })
  },

  async reverse(id: string): Promise<void> {
    const scope = getFinanceScope()
    await api.post(`${BASE}/${id}/reverse`, null, { params: scope })
  },
}
