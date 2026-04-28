import fs from 'node:fs'
import path from 'node:path'

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return

  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!match || process.env[match[1]]) continue

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env'))
loadEnvFile(path.resolve(process.cwd(), '.env.local'))

const origin = process.env.VITE_API_ORIGIN || process.env.HMIS_API_ORIGIN || 'http://localhost:5000'
const version = process.env.VITE_API_VERSION || 'v1'
const token = process.env.HMIS_SMOKE_TOKEN || ''
const tenantId = process.env.HMIS_SMOKE_TENANT_ID || ''
const facilityId = process.env.HMIS_SMOKE_FACILITY_ID || ''

const apiBase = `${origin.replace(/\/$/, '')}/api/${version}`
const correlationId = `smoke-${Date.now()}`

const checks = [
  { name: 'health', url: `${origin.replace(/\/$/, '')}/health` },
  { name: 'metrics', url: `${origin.replace(/\/$/, '')}/metrics` },
  { name: 'runtime observability', path: '/observability/runtime' },
  { name: 'audit logs', path: '/audit-logs?page=1&pageSize=1' },
  { name: 'pharmacy dispensing', path: '/pharmacy/dispensing/workspace' },
  { name: 'pharmacy batches', path: '/pharmacy/batches' },
  { name: 'finance refunds', path: '/finance/refunds' },
  { name: 'finance claims', path: '/finance/claims' },
  { name: 'diagnostic orders', path: '/diagnostics/orders' },
  { name: 'lab samples', path: '/diagnostics/samples' },
  { name: 'lab results', path: '/diagnostics/results' },
  { name: 'radiology worklist', path: '/radiology/worklist' },
  { name: 'ipd admissions', path: '/ipd/admissions' },
  { name: 'ipd beds', path: '/ipd/beds' },
  { name: 'inventory procurement', path: '/inventory/procurement' },
  { name: 'inventory stock movements', path: '/inventory/stock-movements' },
  { name: 'analytics executive', path: '/analytics/executive' },
  { name: 'interoperability outbox', path: '/interoperability/outbox' },
  { name: 'interoperability partners', path: '/interoperability/partners' },
]

const headers = {
  Accept: 'application/json',
  'X-Correlation-ID': correlationId,
}

if (token) headers.Authorization = `Bearer ${token}`
if (tenantId) {
  headers['X-Tenant-Id'] = tenantId
  headers['X-Tenant-ID'] = tenantId
}
if (facilityId) {
  headers['X-Property-Id'] = facilityId
  headers['X-Property-ID'] = facilityId
  headers['X-Facility-Id'] = facilityId
  headers['X-Facility-ID'] = facilityId
}

let failures = 0

for (const check of checks) {
  const url = check.url || `${apiBase}${check.path}`

  try {
    const response = await fetch(url, { headers })
    const ok = response.status >= 200 && response.status < 400
    const protectedRoute = response.status === 401 || response.status === 403
    const contractMismatch = response.status === 404 || response.status === 405

    if ((!ok && !protectedRoute) || contractMismatch) failures += 1

    console.log(`${ok ? 'OK' : protectedRoute ? 'AUTH' : 'FAIL'} ${response.status} ${check.name} ${url}`)
  } catch (error) {
    failures += 1
    console.log(`FAIL NET ${check.name} ${url}`)
    console.log(`  ${error instanceof Error ? error.message : String(error)}`)
  }
}

if (failures > 0) {
  console.error(`API smoke check found ${failures} failing endpoint(s).`)
  process.exit(1)
}

console.log('API smoke check passed.')
