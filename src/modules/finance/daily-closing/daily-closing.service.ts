import { api } from '@/services/api'
import { systemContext } from '@/services/systemContext'
import type { DailyClosingReportDto } from './daily-closing.types'

const BASE = '/DailyClosing'

function scope() {
  return {
    tenantId: systemContext.tenantId,
    propertyId: systemContext.propertyId,
  }
}

export const dailyClosingService = {
  async getReport(dateIso: string, cashAccountId: string): Promise<DailyClosingReportDto> {
    const { data } = await api.get<DailyClosingReportDto>(`${BASE}/report`, {
      params: { ...scope(), date: dateIso, cashAccountId },
    })
    return data
  },
}
