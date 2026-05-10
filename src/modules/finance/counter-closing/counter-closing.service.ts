// src/modules/finance/counter-closing/counter-closing.service.ts
import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'
import { systemContext } from '@/services/systemContext'
import type { CounterClosingReportDto } from './counter-closing.types'

const BASE = '/CounterClosing'

export interface CounterClosingCashAccount {
  id: string
  name: string
  code: string
}

function scope() {
  return {
    tenantId: systemContext.tenantId,
    propertyId: systemContext.propertyId,
  }
}

export const counterClosingService = {
  async getCashAccounts(): Promise<CounterClosingCashAccount[]> {
    const { data } = await api.get('/ChartOfAccount/payment-accounts')
    const rows = unwrapApiData<CounterClosingCashAccount[]>(data, [])

    return rows.map((x) => ({
      id: String(x.id ?? ''),
      name: String(x.name ?? ''),
      code: String(x.code ?? ''),
    })).filter((x) => x.id)
  },

  async getReport(dateIso: string, cashAccountId: string): Promise<CounterClosingReportDto> {
    const { data } = await api.get<CounterClosingReportDto>(`${BASE}/report`, {
      params: { ...scope(), date: dateIso, cashAccountId },
    })
    return unwrapApiData<CounterClosingReportDto>(data, data)
  },
}
