import type { RouteRecordRaw } from 'vue-router'
import EnterpriseModulePage from '@/components/module/EnterpriseModulePage.vue'
import type { EnterpriseFilterField, EnterpriseFormField, EnterpriseRowAction } from './enterprise.types'

type ModuleScreen = {
  path: string
  dataEndpoint: string
  title: string
  module: string
  subtitle: string
  workflow: string[]
  actions: { title: string; description: string }[]
  rows?: { id: string; subject: string; owner: string; status: string }[]
}

type ScreenConfig = {
  mutationEndpoint: string
  exportEndpoint: string
  mutationLabel: string
  requiresAuditReason?: boolean
  formFields: EnterpriseFormField[]
  filterFields: EnterpriseFilterField[]
  rowActions: EnterpriseRowAction[]
}

const statusFilter = (options = ['Open', 'Pending', 'Approved', 'Posted', 'Closed']): EnterpriseFilterField => ({
  key: 'status',
  label: 'Status',
  type: 'select',
  options,
})

const dateFilters: EnterpriseFilterField[] = [
  { key: 'from', label: 'From', type: 'date' },
  { key: 'to', label: 'To', type: 'date' },
]

const commonFilters: EnterpriseFilterField[] = [
  statusFilter(),
  { key: 'facilityId', label: 'Facility', type: 'lookup', lookupKind: 'facility' },
  ...dateFilters,
]

const field = (key: string, label: string, type: EnterpriseFormField['type'], extra: Partial<EnterpriseFormField> = {}): EnterpriseFormField => ({
  key,
  label,
  type,
  ...extra,
})

const patientField = field('patientId', 'Patient', 'text', { required: true, placeholder: 'Patient MRN or ID' })
const doctorField = field('doctorId', 'Doctor', 'lookup', { lookupKind: 'doctor' })
const amountField = field('amount', 'Amount', 'number')
const reasonField = field('reason', 'Reason', 'textarea', { required: true })
const notesField = field('notes', 'Notes', 'textarea')

const workflowAction = (
  key: string,
  label: string,
  endpointSuffix = key,
  extra: Partial<EnterpriseRowAction> = {},
): EnterpriseRowAction => ({
  key,
  label,
  endpointSuffix,
  requiresAuditReason: true,
  idempotent: true,
  ...extra,
})

const approveAction = workflowAction('approve', 'Approve')
const cancelAction = workflowAction('cancel', 'Cancel')
const collectAction = workflowAction('collect', 'Collect Sample', 'collect')
const dispenseAction = workflowAction('dispense', 'Dispense')
const dischargeAction = workflowAction('discharge', 'Discharge')
const postAction = workflowAction('post', 'Post')
const reverseAction = workflowAction('reverse', 'Reverse')
const retryAction = workflowAction('retry', 'Retry')
const resolveAction = workflowAction('resolve', 'Resolve')
const verifyAction = workflowAction('verify', 'Verify')
const transferAction = workflowAction('transfer', 'Transfer')
const administerAction = workflowAction('administer', 'Administer')

const rowActionsFor = (screen: ModuleScreen): EnterpriseRowAction[] => {
  if (screen.path.startsWith('/pharmacy')) {
    return screen.path.includes('reports') ? [] : [dispenseAction, cancelAction]
  }

  if (screen.path.startsWith('/finance')) {
    if (screen.path.includes('leakage')) return [resolveAction, approveAction]
    if (screen.path.includes('claims')) return [approveAction, postAction, reverseAction]
    return [approveAction, postAction, reverseAction]
  }

  if (screen.path.includes('sample-collection')) return [collectAction, cancelAction]

  if (
    screen.path.startsWith('/diagnostics') ||
    screen.path.startsWith('/radiology')
  ) {
    if (screen.path.includes('orders')) return [approveAction, cancelAction]
    return [verifyAction, approveAction]
  }

  if (screen.path.startsWith('/ipd')) {
    if (screen.path.includes('bed-board')) return [transferAction, resolveAction]
    if (screen.path.includes('mar')) return [administerAction, cancelAction]
    if (screen.path.includes('discharge')) return [approveAction, dischargeAction]
    return [approveAction, cancelAction]
  }

  if (screen.path.startsWith('/inventory')) {
    return screen.path.includes('reports') ? [] : [approveAction, postAction, reverseAction]
  }

  if (screen.path.startsWith('/interoperability')) {
    return [retryAction, resolveAction]
  }

  return []
}

const pharmacyForm = (mode: string): EnterpriseFormField[] => [
  patientField,
  field('medicineId', 'Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
  field('batchNo', 'Batch No', 'text'),
  field('quantity', 'Quantity', 'number', { required: true }),
  field('saleUnit', 'Sale Unit', 'select', { options: ['Unit', 'Strip', 'Pack', 'Box'] }),
  field('paymentMode', 'Payment Mode', 'lookup', { lookupKind: 'paymentMode' }),
  field('workflowType', 'Workflow Type', 'select', { options: [mode] }),
  reasonField,
]

const financeForm = (type: string): EnterpriseFormField[] => [
  field('referenceNo', 'Reference No', 'text', { required: true }),
  patientField,
  doctorField,
  amountField,
  field('paymentAccountId', 'Payment Account', 'lookup', { lookupKind: 'paymentAccount' }),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  reasonField,
]

const diagnosticsForm = (type: 'Lab' | 'Radiology' | 'Approval'): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('orderType', 'Order Type', 'select', { options: [type] }),
  field('labTestId', 'Lab Test', 'lookup', { lookupKind: 'labTest' }),
  field('radiologyStudyId', 'Radiology Study', 'lookup', { lookupKind: 'radiologyStudy' }),
  field('priority', 'Priority', 'select', { options: ['Routine', 'Urgent', 'STAT'] }),
  notesField,
]

const ipdForm = (type: string): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('wardId', 'Ward', 'lookup', { lookupKind: 'ward' }),
  field('bedId', 'Bed', 'lookup', { lookupKind: 'bed' }),
  field('effectiveDate', 'Effective Date', 'date'),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  notesField,
]

const inventoryForm = (type: string): EnterpriseFormField[] => [
  field('storeId', 'Store', 'lookup', { lookupKind: 'store', required: true }),
  field('medicineId', 'Item / Medicine', 'lookup', { lookupKind: 'medicine' }),
  field('quantity', 'Quantity', 'number', { required: true }),
  field('movementType', 'Movement Type', 'select', { options: [type, 'Issue', 'Transfer', 'Adjustment', 'Receive'] }),
  reasonField,
]

const analyticsForm: EnterpriseFormField[] = [
  field('reportName', 'Report Name', 'text', { required: true }),
  field('from', 'From', 'date'),
  field('to', 'To', 'date'),
  field('facilityId', 'Facility', 'lookup', { lookupKind: 'facility' }),
  field('departmentId', 'Department', 'lookup', { lookupKind: 'department' }),
  notesField,
]

const interoperabilityForm = (type: string): EnterpriseFormField[] => [
  field('partnerName', 'Partner Name', 'text', { required: true }),
  field('endpoint', 'Endpoint', 'text'),
  field('messageType', 'Message Type', 'select', { options: ['HL7', 'FHIR', 'Webhook', 'Outbox'] }),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  notesField,
]

const getScreenConfig = (screen: ModuleScreen): ScreenConfig => {
  const createEndpoint = `${screen.dataEndpoint}/commands`
  const baseConfig = {
    exportEndpoint: `${screen.dataEndpoint}/export`,
    rowActions: rowActionsFor(screen),
  }

  if (screen.path.startsWith('/pharmacy')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: pharmacyForm(screen.title),
      filterFields: [
        statusFilter(['Pending', 'Dispensed', 'Cancelled', 'Expired']),
        { key: 'medicineId', label: 'Medicine', type: 'lookup', lookupKind: 'medicine' },
        { key: 'storeId', label: 'Store', type: 'lookup', lookupKind: 'store' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/finance')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: financeForm(screen.title),
      filterFields: [
        statusFilter(['Draft', 'Pending', 'Approved', 'Posted', 'Rejected']),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        { key: 'paymentAccountId', label: 'Account', type: 'lookup', lookupKind: 'paymentAccount' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/diagnostics') || screen.path.startsWith('/radiology')) {
    const type = screen.path.startsWith('/radiology') ? 'Radiology' : screen.path.includes('approvals') ? 'Approval' : 'Lab'
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: screen.path.includes('results') || screen.path.includes('approvals') || screen.path.includes('report'),
      formFields: diagnosticsForm(type),
      filterFields: [
        statusFilter(['Ordered', 'Collected', 'Resulted', 'Verified', 'Approved']),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['Routine', 'Urgent', 'STAT'] },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/ipd')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: screen.path.includes('discharge') || screen.path.includes('mar'),
      formFields: ipdForm(screen.title),
      filterFields: [
        statusFilter(['Admitted', 'Occupied', 'Pending', 'Ready', 'Discharged']),
        { key: 'wardId', label: 'Ward', type: 'lookup', lookupKind: 'ward' },
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/inventory')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: inventoryForm(screen.title),
      filterFields: [
        statusFilter(['Draft', 'Pending', 'Approved', 'Posted']),
        { key: 'storeId', label: 'Store', type: 'lookup', lookupKind: 'store' },
        { key: 'medicineId', label: 'Item', type: 'lookup', lookupKind: 'medicine' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/analytics')) {
    return {
      ...baseConfig,
      mutationEndpoint: `${screen.dataEndpoint}/exports`,
      mutationLabel: `${screen.title} Report`,
      formFields: analyticsForm,
      filterFields: [
        { key: 'facilityId', label: 'Facility', type: 'lookup', lookupKind: 'facility' },
        { key: 'departmentId', label: 'Department', type: 'lookup', lookupKind: 'department' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/interoperability')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: interoperabilityForm(screen.title),
      filterFields: [
        statusFilter(['Pending', 'Sent', 'Failed', 'Retrying', 'Resolved']),
        { key: 'messageType', label: 'Message Type', type: 'select', options: ['HL7', 'FHIR', 'Webhook', 'Outbox'] },
        ...dateFilters,
      ],
    }
  }

  return {
    ...baseConfig,
    mutationEndpoint: createEndpoint,
    mutationLabel: screen.title,
    formFields: [notesField],
    filterFields: commonFilters,
  }
}

const makeRoute = (screen: ModuleScreen): RouteRecordRaw => ({
  path: screen.path,
  component: EnterpriseModulePage,
  props: {
    module: screen.module,
    title: screen.title,
    subtitle: screen.subtitle,
    dataEndpoint: screen.dataEndpoint,
    ...getScreenConfig(screen),
    workflow: screen.workflow,
    actions: screen.actions,
    rows: screen.rows,
  },
  meta: {
    title: screen.title,
    requiresAuth: true,
    layout: 'MainLayout',
  },
})

const pharmacyActions = [
  { title: 'Dispense safely', description: 'Validate prescription, stock, batch, expiry, and payment mode before save.' },
  { title: 'Control inventory', description: 'Track unit and box conversion, batch availability, and expiring stock.' },
  { title: 'Report activity', description: 'Review sales, free medicine, stock movement, and dispensing exceptions.' },
]

const financeActions = [
  { title: 'Review transactions', description: 'Search receipts, refunds, claims, and posting exceptions.' },
  { title: 'Post with control', description: 'Use audit reason and idempotency for sensitive finance mutations.' },
  { title: 'Monitor leakage', description: 'Compare services, payments, doctor share, and unposted revenue.' },
]

const diagnosticActions = [
  { title: 'Move orders forward', description: 'Track order, sample, result, report, verification, and approval status.' },
  { title: 'Prioritize exceptions', description: 'Highlight delayed samples, pending results, and unapproved reports.' },
  { title: 'Release reports', description: 'Prepare verified reports for patient portal and billing workflows.' },
]

const ipdActions = [
  { title: 'Coordinate ward work', description: 'Manage admissions, beds, nursing notes, MAR, services, and discharge.' },
  { title: 'Track patient safety', description: 'Monitor medication rounds, nursing tasks, and discharge readiness.' },
  { title: 'Prepare billing', description: 'Keep bed, service, medicine, and procedure charges aligned before discharge.' },
]

const operationsActions = [
  { title: 'Operational visibility', description: 'Give managers an overview of pending work, exceptions, and trends.' },
  { title: 'Integration health', description: 'Track outbox, partner status, and retry queues for connected systems.' },
  { title: 'Executive reporting', description: 'Surface high-level clinical, finance, inventory, and workforce signals.' },
]

const screens: ModuleScreen[] = [
  {
    path: '/pharmacy/dispensing',
    dataEndpoint: '/pharmacy/dispensing/workspace',
    module: 'Pharmacy',
    title: 'Dispensing',
    subtitle: 'Prescription dispensing with payment mode, free medicine, and stock checks.',
    workflow: ['Load prescription', 'Select batch and expiry', 'Confirm unit or box quantity', 'Collect payment or mark free', 'Dispense'],
    actions: pharmacyActions,
  },
  {
    path: '/pharmacy/batches',
    dataEndpoint: '/pharmacy/batches',
    module: 'Pharmacy',
    title: 'Batch And Expiry',
    subtitle: 'Batch-level stock visibility for expiry-aware dispensing and replenishment.',
    workflow: ['Receive stock', 'Assign batch', 'Track expiry', 'Flag near-expiry', 'Move or write off'],
    actions: pharmacyActions,
  },
  {
    path: '/pharmacy/unit-box-sales',
    dataEndpoint: '/pharmacy/sales/unit-box',
    module: 'Pharmacy',
    title: 'Unit And Box Sales',
    subtitle: 'Sell medicines in strips, units, packs, or boxes while preserving inventory conversion rules.',
    workflow: ['Choose product', 'Select sale unit', 'Apply conversion', 'Price item', 'Finalize sale'],
    actions: pharmacyActions,
  },
  {
    path: '/pharmacy/free-medicine',
    dataEndpoint: '/pharmacy/free-medicine',
    module: 'Pharmacy',
    title: 'Free Medicine',
    subtitle: 'Controlled free medicine issue workflow for charitable, package, or approval-based dispensing.',
    workflow: ['Select patient', 'Choose medicine', 'Capture reason', 'Approve issue', 'Dispense and audit'],
    actions: pharmacyActions,
  },
  {
    path: '/pharmacy/payment-modes',
    dataEndpoint: '/pharmacy/payment-modes',
    module: 'Pharmacy',
    title: 'Payment Modes',
    subtitle: 'Cash, card, wallet, account, and free-sale reconciliation for pharmacy counters.',
    workflow: ['Select payment mode', 'Choose counter', 'Capture reference', 'Reconcile', 'Close counter'],
    actions: pharmacyActions,
  },
  {
    path: '/pharmacy/reports',
    dataEndpoint: '/pharmacy/reports/summary',
    module: 'Pharmacy',
    title: 'Pharmacy Reports',
    subtitle: 'Sales, dispensing, expiry, stock, free issue, and payment reports.',
    workflow: ['Choose report', 'Filter context', 'Preview', 'Export', 'Review audit'],
    actions: pharmacyActions,
  },
  {
    path: '/finance/refunds',
    dataEndpoint: '/finance/refunds',
    module: 'Billing And Finance',
    title: 'Refunds',
    subtitle: 'Refund workflow with audit reason, payment reversal, and receipt traceability.',
    workflow: ['Find receipt', 'Validate refundable amount', 'Capture audit reason', 'Approve refund', 'Post reversal'],
    actions: financeActions,
  },
  {
    path: '/finance/claims',
    dataEndpoint: '/finance/claims',
    module: 'Billing And Finance',
    title: 'Insurance Claims',
    subtitle: 'Claim preparation, submission, tracking, denial, and resubmission workspace.',
    workflow: ['Prepare claim', 'Validate coverage', 'Submit', 'Track adjudication', 'Settle or resubmit'],
    actions: financeActions,
  },
  {
    path: '/finance/posting-dashboard',
    dataEndpoint: '/finance/posting-dashboard',
    module: 'Billing And Finance',
    title: 'Posting Dashboard',
    subtitle: 'Revenue, voucher, refund, and claim posting status across facilities and counters.',
    workflow: ['Review drafts', 'Validate totals', 'Post vouchers', 'Resolve failures', 'Export batch'],
    actions: financeActions,
  },
  {
    path: '/finance/doctor-share',
    dataEndpoint: '/finance/doctor-share',
    module: 'Billing And Finance',
    title: 'Doctor Share',
    subtitle: 'Doctor commission/share calculation, approval, posting, and payout tracking.',
    workflow: ['Load services', 'Calculate share', 'Review exceptions', 'Approve payout', 'Post payable'],
    actions: financeActions,
  },
  {
    path: '/finance/leakage-dashboard',
    dataEndpoint: '/finance/leakage-dashboard',
    module: 'Billing And Finance',
    title: 'Revenue Leakage',
    subtitle: 'Detect missed billing, unposted encounters, unpaid services, and discount anomalies.',
    workflow: ['Compare encounters', 'Find unbilled items', 'Review discounts', 'Assign owner', 'Resolve leakage'],
    actions: financeActions,
  },
  {
    path: '/diagnostics/orders',
    dataEndpoint: '/diagnostics/orders',
    module: 'Lab And Radiology',
    title: 'Diagnostic Orders',
    subtitle: 'Unified order lifecycle for laboratory and radiology requests.',
    workflow: ['Order placed', 'Authorize', 'Collect sample or schedule study', 'Result/report', 'Approve'],
    actions: diagnosticActions,
  },
  {
    path: '/diagnostics/sample-collection',
    dataEndpoint: '/diagnostics/samples',
    module: 'Laboratory',
    title: 'Sample Collection',
    subtitle: 'Sample queue with barcode, collection, rejection, and handoff tracking.',
    workflow: ['Call patient', 'Collect sample', 'Label barcode', 'Receive in lab', 'Reject or process'],
    actions: diagnosticActions,
  },
  {
    path: '/diagnostics/results',
    dataEndpoint: '/diagnostics/results',
    module: 'Laboratory',
    title: 'Result Entry',
    subtitle: 'Result entry, abnormal flagging, verification, and release preparation.',
    workflow: ['Enter values', 'Flag abnormal', 'Technical verify', 'Clinical approve', 'Release'],
    actions: diagnosticActions,
  },
  {
    path: '/diagnostics/reports',
    dataEndpoint: '/diagnostics/reports',
    module: 'Lab And Radiology',
    title: 'Reports',
    subtitle: 'Report preview, amendment, approval, and delivery screen.',
    workflow: ['Draft report', 'Attach findings', 'Verify', 'Approve', 'Deliver'],
    actions: diagnosticActions,
  },
  {
    path: '/diagnostics/approvals',
    dataEndpoint: '/diagnostics/approvals',
    module: 'Lab And Radiology',
    title: 'Approvals',
    subtitle: 'Approver queue for verified lab results and radiology reports.',
    workflow: ['Review report', 'Check critical values', 'Approve', 'Hold', 'Notify'],
    actions: diagnosticActions,
  },
  {
    path: '/radiology/worklist',
    dataEndpoint: '/radiology/worklist',
    module: 'Radiology',
    title: 'Radiology Worklist',
    subtitle: 'Study scheduling, modality queue, reporting, and approval pipeline.',
    workflow: ['Schedule study', 'Perform scan', 'Draft report', 'Verify', 'Approve'],
    actions: diagnosticActions,
  },
  {
    path: '/radiology/reporting',
    dataEndpoint: '/radiology/reports',
    module: 'Radiology',
    title: 'Radiology Reporting',
    subtitle: 'Structured reporting workspace for findings, impressions, and release.',
    workflow: ['Open study', 'Write findings', 'Add impression', 'Verify report', 'Release'],
    actions: diagnosticActions,
  },
  {
    path: '/ipd/admissions',
    dataEndpoint: '/ipd/admissions',
    module: 'IPD',
    title: 'Admissions',
    subtitle: 'Inpatient admission, consultant, ward, bed, package, and payer setup.',
    workflow: ['Select patient', 'Assign consultant', 'Choose ward and bed', 'Capture payer', 'Admit'],
    actions: ipdActions,
  },
  {
    path: '/ipd/bed-board',
    dataEndpoint: '/ipd/beds',
    module: 'IPD',
    title: 'Bed Board',
    subtitle: 'Live ward and bed occupancy, transfers, holds, cleaning, and discharge readiness.',
    workflow: ['View ward', 'Assign bed', 'Transfer', 'Mark cleaning', 'Release bed'],
    actions: ipdActions,
  },
  {
    path: '/ipd/nursing',
    dataEndpoint: '/ipd/nursing',
    module: 'IPD',
    title: 'Nursing',
    subtitle: 'Nursing notes, task handover, vitals, intake/output, and care plan tracking.',
    workflow: ['Receive patient', 'Record vitals', 'Add nursing note', 'Complete tasks', 'Handover'],
    actions: ipdActions,
  },
  {
    path: '/ipd/mar',
    dataEndpoint: '/ipd/mar',
    module: 'IPD',
    title: 'Medication Administration Record',
    subtitle: 'MAR schedule, dose administration, hold/skip reasons, and pharmacy handoff.',
    workflow: ['Load medication chart', 'Verify dose', 'Administer', 'Hold with reason', 'Sign MAR'],
    actions: ipdActions,
  },
  {
    path: '/ipd/discharge',
    dataEndpoint: '/ipd/discharges',
    module: 'IPD',
    title: 'Discharge',
    subtitle: 'Discharge planning, summary, medicine reconciliation, clearance, and final bill.',
    workflow: ['Prepare summary', 'Reconcile medicines', 'Clear departments', 'Finalize bill', 'Discharge'],
    actions: ipdActions,
  },
  {
    path: '/inventory/procurement',
    dataEndpoint: '/inventory/procurement',
    module: 'Inventory And Procurement',
    title: 'Procurement',
    subtitle: 'Purchase requisitions, approvals, purchase orders, receiving, and supplier performance.',
    workflow: ['Create requisition', 'Approve', 'Issue PO', 'Receive goods', 'Match invoice'],
    actions: operationsActions,
  },
  {
    path: '/inventory/stock-movements',
    dataEndpoint: '/inventory/stock-movements',
    module: 'Inventory And Procurement',
    title: 'Stock Movements',
    subtitle: 'Store issue, transfer, adjustment, wastage, and expiry movement screen.',
    workflow: ['Select store', 'Choose movement', 'Add items', 'Approve', 'Post stock'],
    actions: operationsActions,
  },
  {
    path: '/inventory/reports',
    dataEndpoint: '/inventory/reports/summary',
    module: 'Inventory And Procurement',
    title: 'Inventory Reports',
    subtitle: 'Stock ledger, reorder, consumption, expiry, supplier, and valuation reporting.',
    workflow: ['Choose report', 'Apply filters', 'Preview', 'Export', 'Share'],
    actions: operationsActions,
  },
  {
    path: '/analytics/executive',
    dataEndpoint: '/analytics/executive',
    module: 'Analytics',
    title: 'Executive Analytics',
    subtitle: 'Enterprise overview for census, revenue, services, workforce, and operational KPIs.',
    workflow: ['Load KPIs', 'Compare trends', 'Find exceptions', 'Drill down', 'Export'],
    actions: operationsActions,
  },
  {
    path: '/analytics/clinical',
    dataEndpoint: '/analytics/clinical',
    module: 'Analytics',
    title: 'Clinical Analytics',
    subtitle: 'Clinical volume, diagnosis, order, result, admission, and care quality indicators.',
    workflow: ['Select domain', 'Filter cohort', 'Review trend', 'Investigate variance', 'Export'],
    actions: operationsActions,
  },
  {
    path: '/analytics/finance',
    dataEndpoint: '/analytics/finance',
    module: 'Analytics',
    title: 'Finance Analytics',
    subtitle: 'Revenue, claims, refunds, leakage, doctor share, and posting analytics.',
    workflow: ['Select period', 'Review revenue', 'Analyze leakage', 'Track posting', 'Export'],
    actions: operationsActions,
  },
  {
    path: '/interoperability/outbox',
    dataEndpoint: '/interoperability/outbox',
    module: 'Interoperability',
    title: 'Outbox And Retries',
    subtitle: 'Integration outbox, retry queue, failure triage, and message replay.',
    workflow: ['Inspect outbox', 'Review failure', 'Retry', 'Replay', 'Resolve'],
    actions: operationsActions,
  },
  {
    path: '/interoperability/hl7-fhir',
    dataEndpoint: '/interoperability/hl7-fhir',
    module: 'Interoperability',
    title: 'HL7 And FHIR',
    subtitle: 'HL7/FHIR mapping, messages, bundles, validation, and partner exchange status.',
    workflow: ['Receive message', 'Validate', 'Map payload', 'Send bundle', 'Audit exchange'],
    actions: operationsActions,
  },
  {
    path: '/interoperability/partners',
    dataEndpoint: '/interoperability/partners',
    module: 'Interoperability',
    title: 'Integration Partners',
    subtitle: 'Partner endpoints, credentials, queues, event subscriptions, and health checks.',
    workflow: ['Configure partner', 'Map events', 'Test connection', 'Monitor health', 'Rotate credentials'],
    actions: operationsActions,
  },
]

export default screens.map(makeRoute)
