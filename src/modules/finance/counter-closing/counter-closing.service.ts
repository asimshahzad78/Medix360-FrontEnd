// src/modules/finance/counter-closing/counter-closing.service.ts
import { api } from '@/services/api'
import { systemContext } from '@/services/systemContext'
import type { CounterClosingReportDto } from './counter-closing.types'

const BASE = '/CounterClosing'

function scope() {
  return {
    tenantId: systemContext.tenantId,
    propertyId: systemContext.propertyId,
  }
}

export const counterClosingService = {
  async getReport(dateIso: string, cashAccountId: string): Promise<CounterClosingReportDto> {
    const { data } = await api.get<CounterClosingReportDto>(`${BASE}/report`, {
      params: { ...scope(), date: dateIso, cashAccountId },
    })
    return data
  },
}
