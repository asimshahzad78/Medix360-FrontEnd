import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.resolve(root, file), 'utf8')

const router = read('src/router/index.ts')
const permissions = read('src/security/permissions.ts')
const sidebar = read('src/components/AppSidebar.vue')

const corePermissionRoutes = [
  '/dashboard',
  '/patients',
  '/patients/queue',
  '/checkups',
  '/opd/workflow',
  '/opd/prescriptions',
  '/opd/diagnosis',
  '/opd/vital-signs',
  '/opd/procedures',
  '/opd/follow-ups',
  '/payments',
  '/finance/counter-closing',
  '/finance/chartofaccounts',
  '/finance/expense-vouchers',
  '/finance/daily-closing',
  '/employees',
  '/hr/departments',
  '/hr/designations',
  '/hr/attendance-logs',
  '/hr/leave-requests',
  '/admin/audit',
  '/admin/observability',
]

const advancedRoutes = [
  '/pharmacy/dispensing',
  '/diagnostics/orders',
  '/ipd/admissions',
  '/inventory/procurement',
  '/analytics/executive',
  '/interoperability/outbox',
  '/patient-engagement/portal-accounts',
]

const failures = []

for (const route of corePermissionRoutes) {
  if (!permissions.includes(`'${route}'`) && !permissions.includes(`"${route}"`)) {
    failures.push(`Missing permission mapping for ${route}`)
  }
}

if (!router.includes('...authRoutes')) failures.push('Router does not mount authRoutes')

for (const routeModule of [
  'dashboardRoutes',
  'patientRoutes',
  'checkupRoutes',
  'paymentRoutes',
  'hrRoutes',
  'employeeRoutes',
  'auditRoutes',
  'observabilityRoutes',
  'enterpriseRoutes',
]) {
  if (!router.includes(`...${routeModule}`)) failures.push(`Router does not mount ${routeModule}`)
}

for (const route of advancedRoutes) {
  if (!permissions.includes(`'${route}'`) && !permissions.includes(`"${route}"`)) {
    failures.push(`Missing advanced permission mapping for ${route}`)
  }

  if (!sidebar.includes(route)) failures.push(`Sidebar does not expose advanced route ${route}`)
}

if (sidebar.includes('VITE_SHOW_ADVANCED_DEMO_MODULES')) {
  failures.push('Sidebar still hides advanced modules behind the demo flag')
}

if (/[Ãâ�]/.test(sidebar)) {
  failures.push('Sidebar contains mojibake/broken characters')
}

if (failures.length > 0) {
  console.error('Route smoke failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Route smoke passed for ${corePermissionRoutes.length} core routes and ${advancedRoutes.length} advanced routes.`)
