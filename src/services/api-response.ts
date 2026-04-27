export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
  correlationId?: string
}

export type PagedResult<T> = {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}

export type ProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Record<string, string[]>
  correlationId?: string
  traceId?: string
}

type ApiErrorData = ProblemDetails & {
  message?: string
  alertMessage?: string
  AlertMessage?: string
}

export type ApiErrorLike = {
  message?: string
  normalizedMessage?: string
  correlationId?: string
  response?: {
    status?: number
    data?: ApiErrorData
    headers?: Record<string, string>
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const unwrapApiData = <T>(payload: unknown, fallback: T): T => {
  if (!isRecord(payload)) return fallback

  if ('data' in payload) return payload.data as T
  if ('Data' in payload) return payload.Data as T
  if ('modelObject' in payload) return payload.modelObject as T
  if ('ModelObject' in payload) return payload.ModelObject as T

  return payload as T
}

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  const err = error as ApiErrorLike
  const data = err.response?.data

  const validationErrors = data?.errors ? Object.values(data.errors).flat() : []
  return (
    data?.alertMessage ||
    data?.AlertMessage ||
    data?.message ||
    data?.detail ||
    data?.title ||
    validationErrors[0] ||
    err.normalizedMessage ||
    err.message ||
    fallback
  )
}

export const getProblemDetails = (error: unknown): ProblemDetails | null => {
  const err = error as ApiErrorLike
  const data = err.response?.data

  if (!data) return null

  return {
    type: data.type,
    title: data.title ?? data.message ?? data.alertMessage ?? data.AlertMessage,
    status: data.status ?? err.response?.status,
    detail: data.detail,
    instance: data.instance,
    errors: data.errors,
    correlationId: data.correlationId ?? data.traceId ?? err.correlationId,
    traceId: data.traceId,
  }
}

export const getValidationErrors = (error: unknown): Record<string, string[]> => {
  const problem = getProblemDetails(error)
  return problem?.errors ?? {}
}

export const enrichApiError = (error: unknown): unknown => {
  if (!isRecord(error)) return error

  const err = error as ApiErrorLike
  err.normalizedMessage = getApiErrorMessage(error)
  err.correlationId =
    err.response?.data?.correlationId ??
    err.response?.data?.traceId ??
    err.response?.headers?.['x-correlation-id'] ??
    err.response?.headers?.['X-Correlation-ID']

  return err
}

export const createCorrelationId = (): string => {
  if ('crypto' in globalThis && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const createIdempotencyKey = (): string => {
  if ('crypto' in globalThis && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
