import axios from 'axios'
import router from '@/router'
import { clearStoredAuth, getStoredAuthToken } from '@/security/auth-session'
import { createContextHeaders, type PlatformContextInput } from '@/services/systemContext'
import { createCorrelationId, createIdempotencyKey, enrichApiError } from '@/services/api-response'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN
const API_VERSION = import.meta.env.VITE_API_VERSION ?? 'v1'

export type ApiRequestMeta = {
  auditReason?: string
  context?: PlatformContextInput
  idempotencyKey?: string | true
  skipContext?: boolean
}

declare module 'axios' {
  interface AxiosRequestConfig {
    meta?: ApiRequestMeta
  }
}

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getStoredAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  config.headers['X-Correlation-ID'] = createCorrelationId()

  if (!config.meta?.skipContext) {
    Object.assign(config.headers, createContextHeaders(config.meta?.context))
  }

  if (config.meta?.auditReason) {
    config.headers['X-Audit-Reason'] = config.meta.auditReason
  }

  if (config.meta?.idempotencyKey) {
    config.headers['Idempotency-Key'] =
      config.meta.idempotencyKey === true
        ? createIdempotencyKey()
        : config.meta.idempotencyKey
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth()
      router.replace('/login')
    }

    return Promise.reject(enrichApiError(error))
  },
)
