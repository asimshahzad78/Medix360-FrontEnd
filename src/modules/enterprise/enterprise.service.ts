import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'

export type EnterpriseMetric = {
  label: string
  value: string
  hint: string
}

export type EnterpriseQueueRow = {
  id: string
  subject: string
  owner: string
  status: string
}

export type EnterpriseWorkspaceData = {
  metrics: EnterpriseMetric[]
  rows: EnterpriseQueueRow[]
}

type LooseRecord = Record<string, unknown>

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === 'object' && value !== null

const text = (value: unknown, fallback: string): string => {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

const pick = (record: LooseRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) return record[key]
  }

  return undefined
}

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const getRowsSource = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  return toArray(
    pick(payload, [
      'items',
      'Items',
      'rows',
      'Rows',
      'queue',
      'Queue',
      'records',
      'Records',
      'workItems',
      'WorkItems',
    ]),
  )
}

const getMetricsSource = (payload: unknown): unknown[] => {
  if (!isRecord(payload)) return []

  return toArray(pick(payload, ['metrics', 'Metrics', 'kpis', 'Kpis', 'summary', 'Summary']))
}

const normalizeMetric = (metric: unknown, index: number): EnterpriseMetric => {
  if (!isRecord(metric)) {
    return {
      label: `Metric ${index + 1}`,
      value: text(metric, '0'),
      hint: 'Loaded from backend',
    }
  }

  return {
    label: text(pick(metric, ['label', 'Label', 'name', 'Name', 'title', 'Title']), `Metric ${index + 1}`),
    value: text(pick(metric, ['value', 'Value', 'count', 'Count', 'amount', 'Amount']), '0'),
    hint: text(pick(metric, ['hint', 'Hint', 'description', 'Description', 'period', 'Period']), 'Loaded from backend'),
  }
}

const normalizeRow = (row: unknown, index: number): EnterpriseQueueRow => {
  if (!isRecord(row)) {
    return {
      id: `ROW-${index + 1}`,
      subject: text(row, 'Backend record'),
      owner: 'Unassigned',
      status: 'Open',
    }
  }

  return {
    id: text(
      pick(row, ['id', 'Id', 'code', 'Code', 'number', 'Number', 'referenceNo', 'ReferenceNo', 'reference', 'Reference']),
      `ROW-${index + 1}`,
    ),
    subject: text(
      pick(row, [
        'subject',
        'Subject',
        'patientName',
        'PatientName',
        'name',
        'Name',
        'title',
        'Title',
        'description',
        'Description',
      ]),
      'Backend record',
    ),
    owner: text(
      pick(row, [
        'owner',
        'Owner',
        'doctorName',
        'DoctorName',
        'assignedTo',
        'AssignedTo',
        'department',
        'Department',
        'storeName',
        'StoreName',
      ]),
      'Unassigned',
    ),
    status: text(pick(row, ['status', 'Status', 'stage', 'Stage', 'state', 'State']), 'Open'),
  }
}

export const enterpriseService = {
  async getWorkspaceData(endpoint: string): Promise<EnterpriseWorkspaceData> {
    const response = await api.get(endpoint)
    const payload = unwrapApiData<unknown>(response.data, response.data)

    return {
      metrics: getMetricsSource(payload).map(normalizeMetric),
      rows: getRowsSource(payload).map(normalizeRow),
    }
  },

  async searchWorkspaceData(endpoint: string, params: Record<string, unknown>): Promise<EnterpriseWorkspaceData> {
    const response = await api.get(endpoint, { params })
    const payload = unwrapApiData<unknown>(response.data, response.data)

    return {
      metrics: getMetricsSource(payload).map(normalizeMetric),
      rows: getRowsSource(payload).map(normalizeRow),
    }
  },

  async runWorkspaceAction(
    endpoint: string,
    payload: unknown = null,
    options: { auditReason?: string; idempotencyKey?: string | true; method?: 'post' | 'put' } = {},
  ): Promise<unknown> {
    const config = {
      meta: {
        auditReason: options.auditReason,
        idempotencyKey: options.idempotencyKey ?? true,
      },
    }

    const response =
      options.method === 'put'
        ? await api.put(endpoint, payload, config)
        : await api.post(endpoint, payload, config)

    return unwrapApiData<unknown>(response.data, response.data)
  },

  async exportWorkspaceData(endpoint: string, params: Record<string, unknown>): Promise<Blob> {
    const response = await api.get(endpoint, {
      params,
      responseType: 'blob',
    })

    return response.data
  },
}
