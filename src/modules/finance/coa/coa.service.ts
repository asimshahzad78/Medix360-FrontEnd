import { api } from '@/services/api'
import type {
  ChartOfAccountApiDto,
  ChartOfAccountCreateDto,
  ChartOfAccountUpdateDto,
  ChartOfAccountUiDto,
  CoaTypeLabel,
} from './coa.types'

function mapTypeLabel(t: number): CoaTypeLabel {
  if (t === 0) return 'Asset'
  if (t === 1) return 'Liability'
  if (t === 2) return 'Equity'
  if (t === 3) return 'Expense'
  if (t === 4) return 'Income'
  return 'Other'
}

function toUi(raw: ChartOfAccountApiDto[]): ChartOfAccountUiDto[] {
  const parentSet = new Set<string>()
  for (const a of raw) {
    if (a.ParentId) parentSet.add(a.ParentId)
  }

  return raw.map((a) => ({
    id: a.Id,
    code: a.Code,
    name: a.Name,
    type: a.Type,
    parentId: a.ParentId ?? null,
    isActive: a.IsActive,
    isMaster: a.IsMaster, // ✅ FIX: required by ChartOfAccountUiDto

    isLeaf: !parentSet.has(a.Id),
    typeLabel: mapTypeLabel(a.Type),
  }))
}

export const coaService = {
  async getAll(): Promise<ChartOfAccountApiDto[]> {
    const { data } = await api.get<ChartOfAccountApiDto[]>('/ChartOfAccount')
    return data
  },

  async getById(id: string): Promise<ChartOfAccountApiDto> {
    const { data } = await api.get<ChartOfAccountApiDto>(`/ChartOfAccount/${id}`)
    return data
  },

  // ✅ UI ENRICHED
  async getAllUi(): Promise<ChartOfAccountUiDto[]> {
    const raw = await this.getAll()
    return toUi(raw)
  },

  // ✅ UI HELPERS (no any, no casting)
  async getLeafAccountsUi(): Promise<ChartOfAccountUiDto[]> {
    const all = await this.getAllUi()
    return all.filter((a) => a.isActive && a.isLeaf)
  },

  async getExpenseHeadsUi(): Promise<ChartOfAccountUiDto[]> {
    const leaf = await this.getLeafAccountsUi()
    return leaf.filter((a) => a.typeLabel === 'Expense')
  },

  async getPaymentAccountsUi(): Promise<ChartOfAccountUiDto[]> {
    // Payment accounts = leaf Asset accounts (Cash/Bank/Wallet)
    const leaf = await this.getLeafAccountsUi()
    return leaf.filter((a) => a.typeLabel === 'Asset')
  },

  // CREATE → CreateDto
  async create(payload: ChartOfAccountCreateDto): Promise<void> {
    await api.post('/ChartOfAccount', payload)
  },

  // UPDATE → UpdateDto ✅
  async update(id: string, payload: ChartOfAccountUpdateDto): Promise<void> {
    await api.put(`/ChartOfAccount/${id}`, payload)
  },
}
