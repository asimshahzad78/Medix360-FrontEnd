export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense'

export interface ChartOfAccountApiDto {
  Id: string
  Code: string
  Name: string
  Type: number // ✅ matches backend "Type"
  ParentId?: string | null
  IsActive: boolean
  TenantId?: string | null
  IsMaster: boolean
}

export interface ChartOfAccountSaveDto {
  Code: string
  Name: string
  Type: AccountType
  ParentId?: string | null
  IsActive: boolean
}

export interface ChartOfAccountCreateDto {
  Name: string
  ParentId: string
  IsActive: boolean
}

export interface ChartOfAccountUpdateDto {
  Name: string
  IsActive: boolean
}

// =====================================================
// UI ONLY (DO NOT SEND TO BACKEND)
// =====================================================

export type CoaTypeLabel = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense' | 'Other'

export interface ChartOfAccountUiDto {
  id: string
  code: string
  name: string
  type: number
  parentId: string | null
  isActive: boolean
  isMaster: boolean

  // UI derived fields
  isLeaf: boolean
  typeLabel: CoaTypeLabel
}
