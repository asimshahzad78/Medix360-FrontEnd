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

const patientField = field('patientId', 'Patient', 'lookup', { lookupKind: 'patient', required: true, placeholder: 'Search patient' })
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
const admitAction = workflowAction('admit', 'Admit')
const inProgressAction = workflowAction('in-progress', 'In Progress', 'in-progress')
const markOrderedAction = workflowAction('ordered', 'Mark Ordered', 'ordered')
const dispositionAction = workflowAction('disposition', 'Set Disposition')
const postAction = workflowAction('post', 'Post')
const releaseAction = workflowAction('release', 'Release')
const scheduleAction = workflowAction('schedule', 'Schedule')
const startAction = workflowAction('start', 'Start')
const completeAction = workflowAction('complete', 'Complete')
const sendAction = workflowAction('send', 'Send')
const signAction = workflowAction('sign', 'Sign')
const reverseAction = workflowAction('reverse', 'Reverse')
const retryAction = workflowAction('retry', 'Retry')
const resolveAction = workflowAction('resolve', 'Resolve')
const verifyAction = workflowAction('verify', 'Verify')
const transferAction = workflowAction('transfer', 'Transfer')
const administerAction = workflowAction('administer', 'Administer')

const rowActionsFor = (screen: ModuleScreen): EnterpriseRowAction[] => {
  if (screen.path.startsWith('/pharmacy')) {
    return screen.path.includes('reports') ? [] : [verifyAction, dispenseAction, cancelAction]
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
    if (screen.path.includes('orders')) return [markOrderedAction, inProgressAction, approveAction, cancelAction]
    return [inProgressAction, verifyAction, approveAction, releaseAction]
  }

  if (screen.path.startsWith('/ipd')) {
    if (screen.path.includes('admissions')) return [admitAction, transferAction, dischargeAction, cancelAction]
    if (screen.path.includes('bed-board')) return [transferAction, resolveAction]
    if (screen.path.includes('mar')) return [administerAction, cancelAction]
    if (screen.path.includes('discharge')) return [approveAction, dischargeAction]
    return [approveAction, cancelAction]
  }

  if (screen.path.startsWith('/emergency')) {
    if (screen.path.includes('triage')) return [inProgressAction, admitAction, dispositionAction, cancelAction]
    return [inProgressAction, dispositionAction, transferAction, dischargeAction]
  }

  if (screen.path.startsWith('/ot') || screen.path.startsWith('/icu')) {
    return [scheduleAction, startAction, completeAction, verifyAction, cancelAction]
  }

  if (screen.path.startsWith('/inventory')) {
    return screen.path.includes('reports') ? [] : [approveAction, postAction, reverseAction]
  }

  if (screen.path.startsWith('/interoperability')) {
    if (screen.path.includes('partners')) return [verifyAction, retryAction, resolveAction]
    return [sendAction, retryAction, resolveAction]
  }

  if (screen.path.startsWith('/patient-engagement')) {
    if (screen.path.includes('consents')) return [signAction, verifyAction, cancelAction]
    if (screen.path.includes('notifications') || screen.path.includes('messages')) return [sendAction, retryAction, resolveAction]
    return [verifyAction, approveAction, cancelAction]
  }

  return []
}

const pharmacyForm = (mode: string): EnterpriseFormField[] => {
  if (mode === 'Payment Modes') {
    return [
      field('paymentMode', 'Payment Mode', 'lookup', { lookupKind: 'paymentMode', required: true }),
      field('counterId', 'Counter', 'lookup', { lookupKind: 'counter' }),
      field('paymentAccountId', 'Payment Account', 'lookup', { lookupKind: 'paymentAccount' }),
      field('referenceNo', 'Reference No', 'text'),
      field('status', 'Status', 'select', { options: ['Active', 'Inactive'] }),
      notesField,
    ]
  }

  return [
    patientField,
    field('prescriptionId', 'Prescription', 'text', { placeholder: 'Prescription ID / number' }),
    field('encounterId', 'Encounter', 'text', { placeholder: 'Visit or encounter ID' }),
    field('storeId', 'Store', 'lookup', { lookupKind: 'store', required: true }),
    field('medicineId', 'Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
    field('batchNo', 'Batch No', 'text', { required: true }),
    field('expiryDate', 'Expiry Date', 'date', { required: true }),
    field('quantity', 'Quantity', 'number', { required: true }),
    field('saleUnit', 'Sale Unit', 'select', { options: ['Unit', 'Strip', 'Pack', 'Box'] }),
    field('unitPrice', 'Unit Price', 'number'),
    field('totalAmount', 'Total Amount', 'number'),
    field('paymentMode', 'Payment Mode', 'lookup', { lookupKind: 'paymentMode' }),
    field('paymentAccountId', 'Payment Account', 'lookup', { lookupKind: 'paymentAccount' }),
    field('status', 'Status', 'select', { options: ['Pending', 'Verified', 'Dispensed', 'Cancelled', 'Expired'] }),
    field('workflowType', 'Workflow Type', 'select', { options: [mode] }),
    reasonField,
  ]
}

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
  field('encounterId', 'Encounter', 'text', { placeholder: 'Visit or encounter ID' }),
  field('orderId', 'Order ID', 'text'),
  field('accessionNo', 'Accession No', 'text'),
  field('orderType', 'Order Type', 'select', { options: [type] }),
  field('labTestId', 'Lab Test', 'lookup', { lookupKind: 'labTest' }),
  field('radiologyStudyId', 'Radiology Study', 'lookup', { lookupKind: 'radiologyStudy' }),
  field('priority', 'Priority', 'select', { options: ['Routine', 'Urgent', 'STAT'] }),
  field('status', 'Status', 'select', { options: ['Ordered', 'InProgress', 'Collected', 'Resulted', 'Verified', 'Approved', 'Released', 'Cancelled'] }),
  field('sampleNo', 'Sample / Barcode No', 'text'),
  field('resultValue', 'Result Value', 'text'),
  field('resultUnit', 'Result Unit', 'text'),
  field('referenceRange', 'Reference Range', 'text'),
  field('criticalFlag', 'Critical Flag', 'select', { options: ['None', 'Low', 'High', 'Critical'] }),
  field('qualityControlStatus', 'Quality Control', 'select', { options: ['NotRequired', 'Pending', 'Passed', 'Failed'] }),
  field('reportText', 'Report Text', 'textarea'),
  field('findings', 'Findings', 'textarea'),
  field('impression', 'Impression', 'textarea'),
  field('reportFileUri', 'Report File / Upload URI', 'text'),
  notesField,
]

const ipdForm = (type: string): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('encounterId', 'Encounter', 'text'),
  field('encounterNumber', 'Encounter Number', 'text'),
  field('encounterType', 'Encounter Type', 'select', { options: ['IPD', 'Emergency', 'ICU', 'OT'] }),
  field('admissionNumber', 'Admission Number', 'text'),
  field('admissionAt', 'Admission Date', 'date'),
  field('wardId', 'Ward', 'lookup', { lookupKind: 'ward' }),
  field('bedId', 'Bed', 'lookup', { lookupKind: 'bed' }),
  field('bedCode', 'Bed Code', 'text'),
  field('status', 'Status', 'select', { options: ['Pending', 'Admitted', 'Occupied', 'Transferred', 'Ready', 'Discharged', 'Cancelled'] }),
  field('disposition', 'Disposition', 'select', { options: ['Admit', 'Transfer', 'Discharge', 'Observation', 'Referral', 'Death'] }),
  field('effectiveDate', 'Effective Date', 'date'),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  notesField,
]

const emergencyForm = (type: string): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('triageRecordId', 'Triage Record ID', 'text'),
  field('triageNumber', 'Triage Number', 'text'),
  field('encounterNumber', 'Encounter Number', 'text', { required: true }),
  field('encounterAt', 'Encounter Date', 'date'),
  field('acuityLevel', 'Acuity Level', 'select', { options: ['Resuscitation', 'Emergent', 'Urgent', 'LessUrgent', 'NonUrgent'] }),
  field('emergencyReason', 'Emergency Reason', 'textarea', { required: true }),
  field('vitalSigns', 'Vital Signs', 'textarea'),
  field('proceduresSummary', 'Procedures Summary', 'textarea'),
  field('observationBedId', 'Observation Bed', 'text'),
  field('bedCode', 'Bed Code', 'text'),
  field('status', 'Status', 'select', { options: ['Registered', 'Triaged', 'InTreatment', 'Observation', 'Admitted', 'Transferred', 'Discharged', 'Cancelled'] }),
  field('disposition', 'Disposition', 'select', { required: true, options: ['TreatAndRelease', 'Admit', 'Transfer', 'LeftWithoutBeingSeen', 'Death'] }),
  field('dispositionAt', 'Disposition Date', 'date'),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  notesField,
]

const otIcuForm = (type: string): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('encounterId', 'Encounter', 'text'),
  field('procedureId', 'Procedure ID', 'text'),
  field('procedureName', 'Procedure Name', 'text', { required: true }),
  field('procedureType', 'Procedure Type', 'select', { options: ['Surgery', 'Procedure', 'ICUProcedure', 'Anesthesia', 'PostOpCare'] }),
  field('wardId', 'Ward', 'lookup', { lookupKind: 'ward' }),
  field('bedId', 'Bed', 'lookup', { lookupKind: 'bed' }),
  field('otRoom', 'OT / ICU Room', 'text'),
  field('scheduledAt', 'Scheduled Date', 'date'),
  field('startedAt', 'Started Date', 'date'),
  field('completedAt', 'Completed Date', 'date'),
  field('surgeonId', 'Surgeon', 'lookup', { lookupKind: 'doctor' }),
  field('anesthetistId', 'Anesthetist', 'lookup', { lookupKind: 'doctor' }),
  field('status', 'Status', 'select', { options: ['Planned', 'Scheduled', 'InProgress', 'Completed', 'Verified', 'Cancelled'] }),
  field('disposition', 'Disposition', 'select', { options: ['Ward', 'ICU', 'Recovery', 'Discharge', 'Transfer'] }),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  notesField,
]

const inventoryForm = (type: string): EnterpriseFormField[] => {
  if (type === 'Suppliers') {
    return [
      field('supplierCode', 'Supplier Code', 'text'),
      field('supplierName', 'Supplier Name', 'text', { required: true }),
      field('contactPerson', 'Contact Person', 'text'),
      field('phone', 'Phone', 'text'),
      field('email', 'Email', 'text'),
      field('taxNumber', 'Tax Number', 'text'),
      field('address', 'Address', 'textarea'),
      field('status', 'Status', 'select', { options: ['Active', 'Inactive', 'Blocked'] }),
      notesField,
    ]
  }

  if (type === 'Requisitions') {
    return [
      field('requisitionNo', 'Requisition No', 'text', { required: true }),
      field('storeId', 'Requesting Store', 'lookup', { lookupKind: 'store', required: true }),
      field('medicineId', 'Item / Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
      field('quantity', 'Requested Quantity', 'number', { required: true }),
      field('requiredByDate', 'Required By', 'date'),
      field('status', 'Status', 'select', { options: ['Draft', 'Pending', 'Approved', 'Rejected', 'Closed'] }),
      reasonField,
    ]
  }

  if (type === 'Purchase Orders') {
    return [
      field('purchaseOrderNo', 'Purchase Order No', 'text', { required: true }),
      field('supplierId', 'Supplier', 'lookup', { lookupKind: 'supplier', required: true }),
      field('storeId', 'Receiving Store', 'lookup', { lookupKind: 'store', required: true }),
      field('medicineId', 'Item / Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
      field('quantity', 'Ordered Quantity', 'number', { required: true }),
      field('unitPrice', 'Unit Price', 'number', { required: true }),
      field('expectedDeliveryDate', 'Expected Delivery', 'date'),
      field('status', 'Status', 'select', { options: ['Draft', 'Submitted', 'Approved', 'PartReceived', 'Received', 'Cancelled'] }),
      notesField,
    ]
  }

  if (type === 'Receiving') {
    return [
      field('receivingNo', 'Receiving No', 'text', { required: true }),
      field('purchaseOrderNo', 'Purchase Order No', 'text'),
      field('supplierId', 'Supplier', 'lookup', { lookupKind: 'supplier' }),
      field('storeId', 'Store', 'lookup', { lookupKind: 'store', required: true }),
      field('medicineId', 'Item / Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
      field('batchNo', 'Batch No', 'text', { required: true }),
      field('expiryDate', 'Expiry Date', 'date', { required: true }),
      field('quantity', 'Received Quantity', 'number', { required: true }),
      field('unitPrice', 'Unit Price', 'number'),
      field('status', 'Status', 'select', { options: ['Received', 'Quarantined', 'Rejected', 'Posted'] }),
      notesField,
    ]
  }

  if (type === 'Stock Lots' || type === 'Expiry Management') {
    return [
      field('storeId', 'Store', 'lookup', { lookupKind: 'store', required: true }),
      field('medicineId', 'Item / Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
      field('batchNo', 'Batch No', 'text', { required: true }),
      field('expiryDate', 'Expiry Date', 'date', { required: true }),
      field('quantity', 'Stock Quantity', 'number', { required: true }),
      field('unitPrice', 'Unit Cost', 'number'),
      field('status', 'Status', 'select', { options: ['Available', 'NearExpiry', 'Expired', 'Blocked', 'WrittenOff'] }),
      reasonField,
    ]
  }

  return [
    field('storeId', 'Store', 'lookup', { lookupKind: 'store', required: true }),
    field('medicineId', 'Item / Medicine', 'lookup', { lookupKind: 'medicine', required: true }),
    field('batchNo', 'Batch No', 'text'),
    field('expiryDate', 'Expiry Date', 'date'),
    field('quantity', 'Quantity', 'number', { required: true }),
    field('movementType', 'Movement Type', 'select', { options: [type, 'Issue', 'Transfer', 'Adjustment', 'Receive'] }),
    field('status', 'Status', 'select', { options: ['Draft', 'Pending', 'Approved', 'Posted', 'Reversed'] }),
    reasonField,
  ]
}

const analyticsForm: EnterpriseFormField[] = [
  field('reportName', 'Report Name', 'text', { required: true }),
  field('from', 'From', 'date'),
  field('to', 'To', 'date'),
  field('facilityId', 'Facility', 'lookup', { lookupKind: 'facility' }),
  field('departmentId', 'Department', 'lookup', { lookupKind: 'department' }),
  field('tenantId', 'Tenant ID', 'text'),
  field('propertyId', 'Property ID', 'text'),
  field('reportType', 'Report Type', 'select', { options: ['Dashboard', 'Clinical', 'Finance', 'Inventory', 'Operational', 'Export'] }),
  field('exportFormat', 'Export Format', 'select', { options: ['CSV', 'XLSX', 'PDF'] }),
  field('exportLimit', 'Export Limit', 'number'),
  notesField,
]

const interoperabilityForm = (type: string): EnterpriseFormField[] => [
  field('partnerName', 'Partner Name', 'text', { required: true }),
  field('endpoint', 'Endpoint', 'text'),
  field('messageType', 'Message Type', 'select', { options: ['HL7', 'FHIR', 'Webhook', 'Outbox', 'PACS', 'DICOM'] }),
  field('resourceType', 'Resource Type', 'text'),
  field('externalReference', 'External Reference', 'text'),
  field('payloadReference', 'Payload Reference / URI', 'text'),
  field('status', 'Status', 'select', { options: ['Pending', 'Queued', 'Sent', 'Failed', 'Retrying', 'Resolved', 'Active', 'Inactive'] }),
  field('retryCount', 'Retry Count', 'number'),
  field('workflowType', 'Workflow Type', 'select', { options: [type] }),
  notesField,
]

const patientEngagementForm = (type: string): EnterpriseFormField[] => {
  if (type === 'Portal Accounts') {
    return [
      patientField,
      field('email', 'Email', 'text', { required: true }),
      field('phone', 'Phone', 'text'),
      field('username', 'Username', 'text'),
      field('status', 'Status', 'select', { options: ['Active', 'PendingVerification', 'Locked', 'Disabled'] }),
      field('portalVisible', 'Portal Visible', 'select', { options: ['true', 'false'] }),
      notesField,
    ]
  }

  if (type === 'Prescription Access') {
    return [
      patientField,
      field('prescriptionId', 'Prescription ID', 'text', { required: true }),
      field('accessCode', 'Access Code', 'text'),
      field('portalVisible', 'Portal Visible', 'select', { options: ['true', 'false'] }),
      field('expiresAt', 'Expires At', 'date'),
      field('status', 'Status', 'select', { options: ['Pending', 'Active', 'Expired', 'Revoked'] }),
      notesField,
    ]
  }

  if (type === 'Consents') {
    return [
      patientField,
      field('consentType', 'Consent Type', 'select', { required: true, options: ['Treatment', 'Surgery', 'Telemedicine', 'DataSharing', 'Insurance'] }),
      field('consentText', 'Consent Text', 'textarea'),
      field('signedBy', 'Signed By', 'text'),
      field('signedAt', 'Signed At', 'date'),
      field('status', 'Status', 'select', { options: ['Draft', 'PendingSignature', 'Signed', 'Revoked', 'Expired'] }),
      notesField,
    ]
  }

  if (type === 'Notifications') {
    return [
      patientField,
      field('notificationType', 'Notification Type', 'select', { required: true, options: ['Appointment', 'Result', 'Prescription', 'Billing', 'Reminder', 'General'] }),
      field('notificationChannels', 'Channels', 'select', { options: ['SMS', 'Email', 'Push', 'WhatsApp'] }),
      field('subject', 'Subject', 'text'),
      field('messageBody', 'Message Body', 'textarea', { required: true }),
      field('scheduledAt', 'Scheduled At', 'date'),
      field('status', 'Status', 'select', { options: ['Draft', 'Queued', 'Sent', 'Failed', 'Read'] }),
      notesField,
    ]
  }

  return [
    patientField,
    field('telemedicineSessionId', 'Session ID', 'text'),
    field('messageType', 'Message Type', 'select', { options: ['Text', 'Image', 'Document', 'System'] }),
    field('messageBody', 'Message Body', 'textarea', { required: true }),
    field('senderType', 'Sender Type', 'select', { options: ['Patient', 'Provider', 'System'] }),
    field('status', 'Status', 'select', { options: ['Draft', 'Queued', 'Sent', 'Delivered', 'Read', 'Failed'] }),
    notesField,
  ]
}

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
      requiresAuditReason: true,
      formFields: ipdForm(screen.title),
      filterFields: [
        statusFilter(['Admitted', 'Occupied', 'Pending', 'Ready', 'Discharged']),
        { key: 'wardId', label: 'Ward', type: 'lookup', lookupKind: 'ward' },
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/emergency')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: emergencyForm(screen.title),
      filterFields: [
        statusFilter(['Registered', 'Triaged', 'InTreatment', 'Observation', 'Admitted', 'Transferred', 'Discharged']),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        { key: 'acuityLevel', label: 'Acuity', type: 'select', options: ['Resuscitation', 'Emergent', 'Urgent', 'LessUrgent', 'NonUrgent'] },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/ot') || screen.path.startsWith('/icu')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: otIcuForm(screen.title),
      filterFields: [
        statusFilter(['Planned', 'Scheduled', 'InProgress', 'Completed', 'Verified', 'Cancelled']),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        { key: 'wardId', label: 'Ward', type: 'lookup', lookupKind: 'ward' },
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
        statusFilter(['Ready', 'Queued', 'Running', 'Completed', 'Failed']),
        { key: 'facilityId', label: 'Facility', type: 'lookup', lookupKind: 'facility' },
        { key: 'departmentId', label: 'Department', type: 'lookup', lookupKind: 'department' },
        { key: 'reportType', label: 'Report Type', type: 'select', options: ['Dashboard', 'Clinical', 'Finance', 'Inventory', 'Operational', 'Export'] },
        { key: 'exportFormat', label: 'Export Format', type: 'select', options: ['CSV', 'XLSX', 'PDF'] },
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

  if (screen.path.startsWith('/patient-engagement')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: screen.path.includes('consents') || screen.path.includes('prescription-access'),
      formFields: patientEngagementForm(screen.title),
      filterFields: [
        statusFilter(['Pending', 'Active', 'Queued', 'Sent', 'Failed', 'Signed', 'Revoked', 'Expired']),
        { key: 'patientId', label: 'Patient', type: 'lookup', lookupKind: 'patient', placeholder: 'Search patient' },
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
    path: '/emergency/triage',
    dataEndpoint: '/emergency/triage',
    module: 'Emergency',
    title: 'Triage',
    subtitle: 'Emergency triage with acuity, vitals, reason, status, and disposition workflow.',
    workflow: ['Register arrival', 'Capture acuity', 'Record vitals', 'Assign disposition', 'Move to treatment'],
    actions: ipdActions,
  },
  {
    path: '/emergency/encounters',
    dataEndpoint: '/emergency/encounters',
    module: 'Emergency',
    title: 'Emergency Encounters',
    subtitle: 'Emergency encounter creation and update with procedures, observation, and discharge disposition.',
    workflow: ['Open encounter', 'Treat patient', 'Add procedures', 'Set disposition', 'Close encounter'],
    actions: ipdActions,
  },
  {
    path: '/emergency/observation-beds',
    dataEndpoint: '/emergency/observation-beds',
    module: 'Emergency',
    title: 'Observation Beds',
    subtitle: 'Observation-bed assignment with bed code, linked encounter, status, and transfer/discharge actions.',
    workflow: ['Assign bed', 'Observe patient', 'Review status', 'Transfer or discharge', 'Release bed'],
    actions: ipdActions,
  },
  {
    path: '/ot/procedures',
    dataEndpoint: '/ot/procedures',
    module: 'OT / ICU',
    title: 'OT Procedures',
    subtitle: 'Operating theatre procedures with schedule, surgeon, anesthetist, status, and post-op disposition.',
    workflow: ['Plan procedure', 'Schedule OT', 'Start case', 'Complete case', 'Verify notes'],
    actions: ipdActions,
  },
  {
    path: '/icu/workflows',
    dataEndpoint: '/icu/workflows',
    module: 'OT / ICU',
    title: 'ICU Workflows',
    subtitle: 'ICU procedure and care workflow with bed, ward, doctor, status, and disposition tracking.',
    workflow: ['Admit to ICU', 'Start workflow', 'Track procedure', 'Verify care', 'Dispose patient'],
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
    path: '/inventory/suppliers',
    dataEndpoint: '/inventory/suppliers',
    module: 'Inventory And Procurement',
    title: 'Suppliers',
    subtitle: 'Supplier master data with contact, tax, status, and procurement notes.',
    workflow: ['Create supplier', 'Validate contacts', 'Approve supplier', 'Use on PO', 'Review performance'],
    actions: operationsActions,
  },
  {
    path: '/inventory/requisitions',
    dataEndpoint: '/inventory/requisitions',
    module: 'Inventory And Procurement',
    title: 'Requisitions',
    subtitle: 'Store purchase requests with item, quantity, needed date, approval, and closure status.',
    workflow: ['Draft request', 'Submit', 'Approve', 'Convert to PO', 'Close request'],
    actions: operationsActions,
  },
  {
    path: '/inventory/purchase-orders',
    dataEndpoint: '/inventory/purchase-orders',
    module: 'Inventory And Procurement',
    title: 'Purchase Orders',
    subtitle: 'Supplier purchase orders with store, item, quantity, price, delivery, and receipt tracking.',
    workflow: ['Create PO', 'Submit', 'Approve', 'Receive items', 'Close PO'],
    actions: operationsActions,
  },
  {
    path: '/inventory/receiving',
    dataEndpoint: '/inventory/receiving',
    module: 'Inventory And Procurement',
    title: 'Receiving',
    subtitle: 'Goods receiving with PO link, supplier, batch number, expiry date, and posting status.',
    workflow: ['Find PO', 'Receive goods', 'Capture batch', 'Validate expiry', 'Post stock'],
    actions: operationsActions,
  },
  {
    path: '/inventory/stock-lots',
    dataEndpoint: '/inventory/stock-lots',
    module: 'Inventory And Procurement',
    title: 'Stock Lots',
    subtitle: 'Batch-level stock lots with store, medicine, quantity, unit cost, expiry, and availability status.',
    workflow: ['Create lot', 'Validate batch', 'Track expiry', 'Block exceptions', 'Post adjustment'],
    actions: operationsActions,
  },
  {
    path: '/inventory/expiry',
    dataEndpoint: '/inventory/expiry',
    module: 'Inventory And Procurement',
    title: 'Expiry Management',
    subtitle: 'Near-expiry and expired stock review with batch, quantity, write-off, and transfer workflow.',
    workflow: ['Find expiring stock', 'Review batch', 'Transfer or block', 'Approve write-off', 'Post movement'],
    actions: operationsActions,
  },
  {
    path: '/inventory/adjustments',
    dataEndpoint: '/inventory/adjustments',
    module: 'Inventory And Procurement',
    title: 'Adjustments',
    subtitle: 'Stock increase, decrease, wastage, and correction workflow with audit reason.',
    workflow: ['Select store', 'Choose item', 'Capture batch', 'Enter adjustment', 'Post stock'],
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
    path: '/analytics/exports',
    dataEndpoint: '/analytics/export-jobs',
    module: 'Analytics',
    title: 'Analytics Exports',
    subtitle: 'Queue report/export jobs with date range, tenant/property, report type, format, and limit controls.',
    workflow: ['Choose report', 'Set context', 'Queue export', 'Monitor status', 'Download'],
    actions: operationsActions,
  },
  {
    path: '/patient-engagement/portal-accounts',
    dataEndpoint: '/patient-engagement/portal-accounts',
    module: 'Patient Engagement',
    title: 'Portal Accounts',
    subtitle: 'Patient portal account setup with contact, verification, status, and visibility controls.',
    workflow: ['Create account', 'Verify contact', 'Activate portal', 'Monitor access', 'Audit changes'],
    actions: operationsActions,
  },
  {
    path: '/patient-engagement/prescription-access',
    dataEndpoint: '/patient-engagement/prescription-access',
    module: 'Patient Engagement',
    title: 'Prescription Access',
    subtitle: 'Prescription access control for portal visibility, expiry, revocation, and audit.',
    workflow: ['Select prescription', 'Create access', 'Notify patient', 'Track expiry', 'Revoke if needed'],
    actions: operationsActions,
  },
  {
    path: '/patient-engagement/notifications',
    dataEndpoint: '/patient-engagement/notifications',
    module: 'Patient Engagement',
    title: 'Notifications',
    subtitle: 'Patient notifications across SMS, email, push, or messaging channels with retry status.',
    workflow: ['Draft message', 'Choose channel', 'Queue send', 'Track delivery', 'Resolve failures'],
    actions: operationsActions,
  },
  {
    path: '/patient-engagement/consents',
    dataEndpoint: '/patient-administration/consents',
    module: 'Patient Engagement',
    title: 'Consents',
    subtitle: 'Patient consent capture, signature, revocation, and verification workflow.',
    workflow: ['Prepare consent', 'Review with patient', 'Sign', 'Verify', 'Audit trail'],
    actions: operationsActions,
  },
  {
    path: '/patient-engagement/messages',
    dataEndpoint: '/patient-engagement/telemedicine-messages',
    module: 'Patient Engagement',
    title: 'Messages',
    subtitle: 'Patient/provider messages for telemedicine and portal communication workflows.',
    workflow: ['Compose', 'Queue', 'Send', 'Track read status', 'Resolve delivery exceptions'],
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
  {
    path: '/interoperability/exchange',
    dataEndpoint: '/interoperability/exchange',
    module: 'Interoperability',
    title: 'External Exchange',
    subtitle: 'FHIR, HL7, PACS/DICOM, webhook, and partner exchange workflow with status and retry controls.',
    workflow: ['Prepare payload', 'Validate mapping', 'Send exchange', 'Track response', 'Resolve failures'],
    actions: operationsActions,
  },
  {
    path: '/interoperability/webhooks',
    dataEndpoint: '/interoperability/webhook-deliveries',
    module: 'Interoperability',
    title: 'Webhook Deliveries',
    subtitle: 'Webhook subscription and delivery queue with retry, failure reason, and audit visibility.',
    workflow: ['Queue delivery', 'Send webhook', 'Capture result', 'Retry failures', 'Resolve'],
    actions: operationsActions,
  },
  {
    path: '/interoperability/pacs-dicom',
    dataEndpoint: '/interoperability/dicom-study-links',
    module: 'Interoperability',
    title: 'PACS / DICOM Links',
    subtitle: 'Radiology external image links with PACS URL, DICOM study references, status, and audit trail.',
    workflow: ['Link study', 'Validate PACS URL', 'Exchange metadata', 'Verify visibility', 'Resolve failures'],
    actions: operationsActions,
  },
]

export default screens.map(makeRoute)
