import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'
import type { AuditLogEntry, AuditSearchFilters, AuditSearchResult } from '@/types/audit'

const cleanFilters = (filters: AuditSearchFilters): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )

const normalizeSearchResult = (payload: unknown, filters: AuditSearchFilters): AuditSearchResult => {
  const unwrapped = unwrapApiData<unknown>(payload, payload)

  if (Array.isArray(unwrapped)) {
    return {
      items: unwrapped as AuditLogEntry[],
      totalCount: unwrapped.length,
      pageNumber: filters.page ?? 1,
      pageSize: filters.pageSize ?? unwrapped.length,
    }
  }

  const result = unwrapped as Partial<AuditSearchResult> & {
    Items?: AuditLogEntry[]
    TotalCount?: number
    PageNumber?: number
    PageSize?: number
  }

  return {
    items: result.items ?? result.Items ?? [],
    totalCount: result.totalCount ?? result.TotalCount ?? 0,
    pageNumber: result.pageNumber ?? result.PageNumber ?? filters.page ?? 1,
    pageSize: result.pageSize ?? result.PageSize ?? filters.pageSize ?? 25,
  }
}

export const auditService = {
  async list(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    const { data } = await api.get('/audit-logs', {
      params: { entityType, entityId },
    })

    return unwrapApiData<AuditLogEntry[]>(data, [])
  },

  async search(filters: AuditSearchFilters): Promise<AuditSearchResult> {
    const { data } = await api.get('/audit-logs', {
      params: cleanFilters(filters),
    })

    return normalizeSearchResult(data, filters)
  },

  async export(filters: AuditSearchFilters): Promise<Blob> {
    const { data } = await api.get('/audit-logs/export', {
      params: cleanFilters(filters),
      responseType: 'blob',
    })

    return data
  },
}
