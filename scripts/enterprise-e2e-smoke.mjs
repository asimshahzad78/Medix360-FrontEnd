import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.resolve(root, file), 'utf8')

const routes = read('src/modules/enterprise/enterprise.routes.ts')
const permissions = read('src/security/permissions.ts')
const sidebar = read('src/components/AppSidebar.vue')
const page = read('src/components/module/EnterpriseModulePage.vue')
const backendProgram = read('../JSK/HMS/Program.cs')
const permissionCatalog = read('../JSK/HMS.Modules.Common/Security/PermissionCatalog.cs')
const aiNotes = read('../ai_notes.md')

const screens = [
  {
    name: 'Sehat Card / SSP / Health Insurance Claims',
    path: '/finance/sehat-card-claims',
    endpoint: '/finance/sehat-card-claims',
    api: '/api/v1/finance/sehat-card-claims',
    permission: 'Finance.SehatCardClaims.View',
    seed: 'Billing.SehatCardClaims.Manage',
    fields: ['CNIC', 'Package Code', 'Pre-Authorization No', 'Claim No', 'Fraud / Audit Flag'],
    workflow: ['Check CNIC eligibility', 'Select package', 'Request pre-authorization', 'Reconcile payment'],
  },
  {
    name: 'Panel / Corporate / TPA Billing',
    path: '/finance/panel-billing',
    endpoint: '/finance/panel-billing',
    api: '/api/v1/finance/panel-billing',
    permission: 'Finance.PanelBilling.View',
    seed: 'Billing.PanelBilling.Manage',
    fields: ['Panel / Corporate / TPA', 'Employee No', 'Authorization Letter No', 'Receivable Amount', 'Aging Bucket'],
    workflow: ['Verify employee or dependent', 'Validate authorization', 'Track aging'],
  },
  {
    name: 'Emergency / ER Module',
    path: '/emergency/er-workflow',
    endpoint: '/emergency/er-workflow',
    api: '/api/v1/emergency/er-workflow',
    permission: 'Emergency.ER.View',
    seed: 'Emergency.ER.Manage',
    fields: ['Acuity Level', 'Emergency Reason', 'Vital Signs', 'Disposition'],
    workflow: ['Quick register', 'Triage and tag MLC if needed', 'Document casualty notes'],
  },
  {
    name: 'MLC / Police Case / Legal Register',
    path: '/emergency/mlc-register',
    endpoint: '/emergency/mlc-register',
    api: '/api/v1/emergency/mlc-register',
    permission: 'Emergency.MLC.View',
    seed: 'Emergency.MLC.Manage',
    fields: ['MLC No', 'Police Station', 'Police Intimation No', 'Evidence / Chain Of Custody'],
    workflow: ['Open MLC', 'Inform police', 'Prepare legal report'],
  },
  {
    name: 'OT / Surgery Management',
    path: '/ot/surgery-management',
    endpoint: '/ot/surgery-management',
    api: '/api/v1/ot/surgery-management',
    permission: 'Operations.Surgery.View',
    seed: 'Operations.Surgery.Manage',
    fields: ['Procedure Name', 'Surgeon', 'Anesthetist', 'OT / ICU Room'],
    workflow: ['Schedule surgery', 'Assign OT team', 'Map package for claim'],
  },
  {
    name: 'Blood Bank',
    path: '/blood-bank/donors',
    endpoint: '/blood-bank/donors',
    api: '/api/v1/blood-bank/donors',
    permission: 'BloodBank.Manage',
    seed: 'BloodBank.Manage',
    note: 'Blood bank',
    fields: ['Donor Registry', 'Blood Units', 'Cross Matching', 'Issue & Return'],
    workflow: ['Register donor', 'Screen eligibility', 'Collect donation'],
  },
  {
    name: 'Maternity / Labor Room / Newborn',
    path: '/maternity/labor-room',
    endpoint: '/maternity/labor-room',
    api: '/api/v1/maternity/labor-room',
    permission: 'Maternity.View',
    seed: 'Maternity.LaborRoom.Manage',
    fields: ['ANC No', 'Labor Stage', 'Delivery Mode', 'APGAR', 'Vaccination At Birth'],
    workflow: ['Track ANC', 'Monitor labor', 'Register newborn'],
  },
  {
    name: 'Government / Regulatory Reporting',
    path: '/regulatory/government-reports',
    endpoint: '/regulatory/government-reports',
    api: '/api/v1/regulatory/government-reports',
    permission: 'Regulatory.Reports.View',
    seed: 'Regulatory.GovernmentReports.Manage',
    fields: ['Report Name', 'DHIS', 'DiseaseSurveillance', 'BirthRegister', 'DeathRegister'],
    workflow: ['Select reporting period', 'Submit report', 'Track acceptance or return'],
  },
  {
    name: 'Charity / Zakat / Bait-ul-Mal / Welfare Desk',
    path: '/welfare/charity-zakat',
    endpoint: '/welfare/charity-zakat',
    api: '/api/v1/welfare/charity-zakat',
    permission: 'Welfare.Desk.View',
    seed: 'Welfare.CharityZakat.Manage',
    fields: ['Charity', 'Zakat', 'Bait-ul-Mal', 'Fund Source', 'Eligibility Notes'],
    workflow: ['Assess eligibility', 'Choose fund source', 'Audit utilization'],
  },
  {
    name: 'Complaint / Patient Facilitation Desk',
    path: '/patient-facilitation/complaints',
    endpoint: '/patient-facilitation/complaints',
    api: '/api/v1/patient-facilitation/complaints',
    permission: 'PatientFacilitation.View',
    seed: 'PatientFacilitation.Complaints.Manage',
    fields: ['Complaint No', 'SehatCardFacilitator', 'SLA Due', 'Resolution'],
    workflow: ['Register complaint', 'Track SLA', 'Capture satisfaction'],
  },
  {
    name: 'Plug & Play FBR E-Invoicing / POS Integration',
    path: '/integrations/fbr-e-invoicing',
    endpoint: '/integrations/fbr-e-invoicing',
    api: '/api/v1/integrations/fbr-e-invoicing',
    permission: 'FBR.EInvoicing.View',
    seed: 'FBR.EInvoicing.Manage',
    note: 'FBR e-invoicing',
    fields: ['POS / Branch ID', 'IRN', 'QR Code Payload', 'CreditNote', 'RetryQueued'],
    workflow: ['Configure credentials', 'Map branch/POS', 'Capture IRN and QR'],
  },
  {
    name: 'Provincial Tax Integrations',
    path: '/integrations/provincial-tax',
    endpoint: '/integrations/provincial-tax',
    api: '/api/v1/integrations/provincial-tax',
    permission: 'Tax.Provincial.View',
    seed: 'Tax.Provincial.Manage',
    note: 'Provincial tax',
    fields: ['PRA', 'SRB', 'KPRA', 'BRA', 'Tax Rate'],
    workflow: ['Choose authority', 'Configure adapter', 'Resolve exceptions'],
  },
  {
    name: 'Plug & Play AI Agent Marketplace',
    path: '/ai/agent-marketplace',
    endpoint: '/ai/agent-marketplace',
    api: '/api/v1/ai/agent-marketplace',
    permission: 'AI.AgentMarketplace.View',
    seed: 'AI.AgentMarketplace.Manage',
    note: 'AI agent marketplace',
    fields: ['Billing Claim Checker', 'Sehat Card Document Auditor', 'DraftOnly', 'Facility Scope'],
    workflow: ['Review agent', 'Install in draft mode', 'Scope facility'],
  },
  {
    name: 'Connector / Integration Hub',
    path: '/integrations/hub',
    endpoint: '/integrations/hub',
    api: '/api/v1/integrations/hub',
    permission: 'IntegrationHub.View',
    seed: 'IntegrationHub.Connectors.Manage',
    fields: ['Connector Type', 'FBR', 'NADRA', 'PaymentGateway'],
    workflow: ['Register connector', 'Test connection', 'Monitor health'],
  },
  {
    name: 'Offline / Downtime Mode',
    path: '/downtime/offline-queue',
    endpoint: '/downtime/offline-queue',
    api: '/api/v1/downtime/offline-queue',
    permission: 'Downtime.Mode.View',
    seed: 'Downtime.Mode.Manage',
    fields: ['Receipt', 'PharmacySale', 'EmergencyRegistration', 'FBRInvoice', 'Sync Status'],
    workflow: ['Capture locally', 'Sync when online', 'Review conflicts'],
  },
  {
    name: 'Document Management / Scanning',
    path: '/documents/management',
    endpoint: '/documents/management',
    api: '/api/v1/documents/management',
    permission: 'Documents.Management.View',
    seed: 'Documents.Management.Manage',
    note: 'Document management',
    fields: ['CNIC', 'ClaimDocument', 'PoliceLetter', 'DischargeBundle', 'OCR Status'],
    workflow: ['Scan document', 'Run OCR', 'Audit access'],
  },
  {
    name: 'Biometric / CNIC Verification Layer',
    path: '/identity/biometric-cnic',
    endpoint: '/identity/biometric-cnic',
    api: '/api/v1/identity/biometric-cnic',
    permission: 'Identity.BiometricCNIC.View',
    seed: 'Identity.BiometricCNIC.Manage',
    fields: ['CNIC', 'StaffAttendance', 'ControlledDrugs', 'Verification Status'],
    workflow: ['Capture CNIC', 'Verify through device/channel', 'Audit access'],
  },
  {
    name: 'Multi-Branch / Franchise Hospital Group Controls',
    path: '/enterprise/multi-branch',
    endpoint: '/enterprise/multi-branch',
    api: '/api/v1/enterprise/multi-branch',
    permission: 'Enterprise.MultiBranch.View',
    seed: 'Enterprise.MultiBranch.Manage',
    note: 'Multi-branch',
    fields: ['Branch Name', 'Pricing Profile', 'Inventory Transfer Policy', 'Tax Credential Profile'],
    workflow: ['Register branch', 'Set inventory policy', 'Centralize claims'],
  },
  {
    name: 'Payment Gateway / Wallet Integrations',
    path: '/payments/gateways',
    endpoint: '/payments/gateways',
    api: '/api/v1/payments/gateways',
    permission: 'Payments.Gateway.View',
    seed: 'Payments.Gateway.Manage',
    note: 'Payment gateway',
    fields: ['JazzCash', 'Easypaisa', 'CardTerminal', 'QRPayment', 'Settlement Account'],
    workflow: ['Configure gateway', 'Activate live', 'Reconcile settlement'],
  },
  {
    name: 'AI Governance Center',
    path: '/ai/governance',
    endpoint: '/ai/governance',
    api: '/api/v1/ai/governance',
    permission: 'AI.Governance.View',
    seed: 'AI.Governance.Manage',
    note: 'AI governance',
    fields: ['PHI Redaction', 'HumanApprovalRequired', 'Blocked Actions', 'Monthly Budget'],
    workflow: ['Define policy', 'Set redaction', 'Audit outcomes'],
  },
]

const checks = []
const assert = (name, condition) => checks.push({ name, passed: Boolean(condition) })
const contains = (source, value) => source.includes(value)

for (const screen of screens) {
  assert(`${screen.name}: route exists`, contains(routes, `path: '${screen.path}'`))
  assert(`${screen.name}: data endpoint exists`, contains(routes, `dataEndpoint: '${screen.endpoint}'`))
  assert(`${screen.name}: frontend permission exists`, contains(permissions, screen.permission))
  assert(`${screen.name}: route permission mapping exists`, contains(permissions, `'${screen.path}'`))
  assert(`${screen.name}: sidebar link exists`, contains(sidebar, `to="${screen.path}"`))
  assert(`${screen.name}: backend fallback API exists`, contains(backendProgram, `"${screen.api}"`))
  assert(`${screen.name}: backend permission seed exists`, contains(backendProgram, screen.seed) || contains(permissionCatalog, screen.seed))
  assert(`${screen.name}: product notes mention module`, contains(aiNotes, screen.note ?? screen.name.split('/')[0].trim()) || contains(aiNotes, screen.name))

  for (const field of screen.fields) {
    assert(`${screen.name}: field/business token ${field}`, contains(routes, field) || contains(sidebar, field))
  }

  for (const step of screen.workflow) {
    assert(`${screen.name}: workflow step ${step}`, contains(routes, step))
  }
}

for (const token of [
  '@click="refresh"',
  '@click="applyFilters"',
  '@click="openForm"',
  '@click="exportData"',
  '@submit.prevent="submitForm"',
  '@click="startRowAction(row, action)"',
  '@submit.prevent="submitRowAction"',
  '@keyup.enter="applyFilters"',
  'requiresAuditReason',
  'idempotencyKey: true',
  'enterpriseService.runWorkspaceAction',
  'enterpriseService.exportWorkspaceData',
  'validateForm',
  'expiry < today',
  'Quantity and stock values must be greater than zero',
  'Price and amount fields cannot be negative',
]) {
  assert(`EnterpriseModulePage event/business contract includes ${token}`, contains(page, token))
}

for (const token of [
  'sehatCardClaimForm',
  'panelBillingForm',
  'mlcForm',
  'maternityForm',
  'fbrEinvoicingForm',
  'provincialTaxForm',
  'aiAgentMarketplaceForm',
  'aiGovernanceForm',
  'downtimeQueueForm',
  'documentManagementForm',
  'biometricCnicForm',
  'multiBranchForm',
  'paymentGatewayForm',
]) {
  assert(`screen-specific business form exists: ${token}`, contains(routes, `const ${token}`))
}

const failed = checks.filter((check) => !check.passed)

for (const check of checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}`)
}

if (failed.length > 0) {
  console.error(`\nEnterprise E2E smoke failed: ${failed.length} check(s) failed.`)
  process.exit(1)
}

console.log(`\nEnterprise E2E smoke passed: ${checks.length} checks across ${screens.length} screens.`)
