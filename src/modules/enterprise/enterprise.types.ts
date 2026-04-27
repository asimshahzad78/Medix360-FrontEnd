import type { LookupKind } from '@/services/lookup.service'

export type EnterpriseFormField = {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'textarea' | 'select' | 'lookup'
  required?: boolean
  lookupKind?: LookupKind
  options?: string[]
  placeholder?: string
}

export type EnterpriseFilterField = {
  key: string
  label: string
  type: 'text' | 'date' | 'select' | 'lookup'
  lookupKind?: LookupKind
  options?: string[]
  placeholder?: string
}

export type EnterpriseRowAction = {
  key: string
  label: string
  endpointSuffix: string
  method?: 'post' | 'put'
  requiresAuditReason?: boolean
  idempotent?: boolean
}
