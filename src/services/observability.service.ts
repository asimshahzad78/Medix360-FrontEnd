import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN

export type HealthCheckItem = {
  name: string
  status: string
  description?: string
  duration?: string
}

export type RuntimeObservability = {
  status?: string
  environment?: string
  version?: string
  uptime?: string
  machineName?: string
  processId?: string | number
  runtime?: string
  memory?: string
  raw?: unknown
}

export type BackgroundJobStatus = {
  name: string
  status: string
  lastRun?: string
  nextRun?: string
  failures?: number
}

export type OutboxRetryStatus = {
  queue: string
  status: string
  pending?: number
  failed?: number
  lastProcessedAt?: string
}

export type ObservabilitySnapshot = {
  health: HealthCheckItem[]
  runtime: RuntimeObservability
  jobs: BackgroundJobStatus[]
  outbox: OutboxRetryStatus[]
}

type LooseRecord = Record<string, unknown>

const rootUrl = (path: string): string => `${API_ORIGIN}${path}`

export const metricsUrl = rootUrl('/metrics')

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === 'object' && value !== null

const text = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

const numberValue = (value: unknown): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const pick = (record: LooseRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) return record[key]
  }

  return undefined
}

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const getCollection = (payload: unknown, keys: string[]): unknown[] => {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  return toArray(pick(payload, keys))
}

const normalizeHealth = (payload: unknown): HealthCheckItem[] => {
  const unwrapped = unwrapApiData<unknown>(payload, payload)

  if (isRecord(unwrapped) && isRecord(unwrapped.entries)) {
    return Object.entries(unwrapped.entries).map(([name, value]) => {
      const entry = isRecord(value) ? value : {}
      return {
        name,
        status: text(pick(entry, ['status', 'Status']), text(unwrapped.status, 'Unknown')),
        description: text(pick(entry, ['description', 'Description']), ''),
        duration: text(pick(entry, ['duration', 'Duration']), ''),
      }
    })
  }

  return getCollection(unwrapped, ['checks', 'Checks', 'items', 'Items', 'results', 'Results']).map((item, index) => {
    const record = isRecord(item) ? item : {}
    return {
      name: text(pick(record, ['name', 'Name', 'check', 'Check']), `Check ${index + 1}`),
      status: text(pick(record, ['status', 'Status']), 'Unknown'),
      description: text(pick(record, ['description', 'Description']), ''),
      duration: text(pick(record, ['duration', 'Duration']), ''),
    }
  })
}

const normalizeRuntime = (payload: unknown): RuntimeObservability => {
  const runtime = unwrapApiData<unknown>(payload, payload)
  const record = isRecord(runtime) ? runtime : {}

  return {
    status: text(pick(record, ['status', 'Status']), ''),
    environment: text(pick(record, ['environment', 'Environment']), ''),
    version: text(pick(record, ['version', 'Version']), ''),
    uptime: text(pick(record, ['uptime', 'Uptime', 'uptimeSeconds', 'UptimeSeconds']), ''),
    machineName: text(pick(record, ['machineName', 'MachineName', 'host', 'Host']), ''),
    processId: text(pick(record, ['processId', 'ProcessId']), ''),
    runtime: text(pick(record, ['runtime', 'Runtime', 'framework', 'Framework']), ''),
    memory: text(pick(record, ['memory', 'Memory', 'workingSet', 'WorkingSet']), ''),
    raw: runtime,
  }
}

const normalizeJobs = (payload: unknown): BackgroundJobStatus[] =>
  getCollection(unwrapApiData<unknown>(payload, payload), ['jobs', 'Jobs', 'items', 'Items']).map((item, index) => {
    const record = isRecord(item) ? item : {}
    return {
      name: text(pick(record, ['name', 'Name', 'jobName', 'JobName']), `Job ${index + 1}`),
      status: text(pick(record, ['status', 'Status', 'state', 'State']), 'Unknown'),
      lastRun: text(pick(record, ['lastRun', 'LastRun', 'lastRunAt', 'LastRunAt']), ''),
      nextRun: text(pick(record, ['nextRun', 'NextRun', 'nextRunAt', 'NextRunAt']), ''),
      failures: numberValue(pick(record, ['failures', 'Failures', 'failedCount', 'FailedCount'])),
    }
  })

const normalizeOutbox = (payload: unknown): OutboxRetryStatus[] =>
  getCollection(unwrapApiData<unknown>(payload, payload), ['queues', 'Queues', 'items', 'Items', 'outbox', 'Outbox']).map(
    (item, index) => {
      const record = isRecord(item) ? item : {}
      return {
        queue: text(pick(record, ['queue', 'Queue', 'name', 'Name', 'partner', 'Partner']), `Queue ${index + 1}`),
        status: text(pick(record, ['status', 'Status', 'state', 'State']), 'Unknown'),
        pending: numberValue(pick(record, ['pending', 'Pending', 'pendingCount', 'PendingCount'])),
        failed: numberValue(pick(record, ['failed', 'Failed', 'failedCount', 'FailedCount'])),
        lastProcessedAt: text(pick(record, ['lastProcessedAt', 'LastProcessedAt', 'lastRunAt', 'LastRunAt']), ''),
      }
    },
  )

export const observabilityService = {
  metricsUrl,

  async getHealth(): Promise<HealthCheckItem[]> {
    const { data } = await api.get(rootUrl('/health'))
    return normalizeHealth(data)
  },

  async getRuntime(): Promise<RuntimeObservability> {
    const { data } = await api.get('/observability/runtime')
    return normalizeRuntime(data)
  },

  async getBackgroundJobs(): Promise<BackgroundJobStatus[]> {
    const { data } = await api.get('/observability/background-jobs')
    return normalizeJobs(data)
  },

  async getOutboxStatus(): Promise<OutboxRetryStatus[]> {
    const { data } = await api.get('/observability/outbox-retries')
    return normalizeOutbox(data)
  },

  async getSnapshot(): Promise<ObservabilitySnapshot> {
    const [health, runtime, jobs, outbox] = await Promise.all([
      this.getHealth(),
      this.getRuntime(),
      this.getBackgroundJobs(),
      this.getOutboxStatus(),
    ])

    return { health, runtime, jobs, outbox }
  },
}
