export type AuditMeta = {
  createdBy?: string | null
  createdAt?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
  rowVersion?: string | null
}

export type AuditLogEntry = AuditMeta & {
  id: string
  entityType?: string | null
  entityId?: string | null
  module?: string | null
  tenantId?: string | null
  facilityId?: string | null
  action?: string | null
  actorUserId?: string | null
  actorEmail?: string | null
  beforeJson?: string | null
  afterJson?: string | null
  beforeValues?: unknown
  afterValues?: unknown
  reason?: string | null
  correlationId?: string | null
  occurredAt?: string | null
}

export type AuditSearchFilters = {
  user?: string
  tenantId?: string
  facilityId?: string
  module?: string
  action?: string
  from?: string
  to?: string
  correlationId?: string
  page?: number
  pageSize?: number
}

export type AuditSearchResult = {
  items: AuditLogEntry[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
