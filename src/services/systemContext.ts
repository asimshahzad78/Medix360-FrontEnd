export type PlatformContext = {
  tenantId: string
  facilityId: string
  propertyId: string
  departmentId: string
  doctorId: string
  wardId: string
  storeId: string
  counterId: string
  shiftId: string
}

export type PlatformContextInput = Partial<PlatformContext>

const STORAGE_KEY = 'platformContext'

const defaultContext: PlatformContext = {
  tenantId: '11111111-1111-1111-1111-111111111111',
  facilityId: '22222222-2222-2222-2222-222222222222',
  propertyId: '22222222-2222-2222-2222-222222222222',
  departmentId: '',
  doctorId: '',
  wardId: '',
  storeId: '',
  counterId: '',
  shiftId: '',
}

const readStoredContext = (): PlatformContextInput => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PlatformContextInput) : {}
  } catch {
    return {}
  }
}

export const getPlatformContext = (): PlatformContext => ({
  ...defaultContext,
  ...readStoredContext(),
})

export const writePlatformContext = (context: PlatformContextInput): PlatformContext => {
  const next = {
    ...getPlatformContext(),
    ...context,
  }

  if (next.facilityId && !next.propertyId) {
    next.propertyId = next.facilityId
  }

  if (next.propertyId && !next.facilityId) {
    next.facilityId = next.propertyId
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  Object.assign(systemContext, next)

  return next
}

export const clearPlatformContext = (): void => {
  localStorage.removeItem(STORAGE_KEY)
  Object.assign(systemContext, defaultContext)
}

export const createContextHeaders = (context: PlatformContextInput = getPlatformContext()) => {
  const headers: Record<string, string> = {}

  const addHeader = (name: string, value?: string) => {
    if (value) headers[name] = value
  }

  addHeader('X-Tenant-ID', context.tenantId)
  addHeader('X-Facility-ID', context.facilityId ?? context.propertyId)
  addHeader('X-Department-ID', context.departmentId)
  addHeader('X-Doctor-ID', context.doctorId)
  addHeader('X-Ward-ID', context.wardId)
  addHeader('X-Store-ID', context.storeId)
  addHeader('X-Counter-ID', context.counterId)
  addHeader('X-Shift-ID', context.shiftId)

  return headers
}

export const systemContext = getPlatformContext()
