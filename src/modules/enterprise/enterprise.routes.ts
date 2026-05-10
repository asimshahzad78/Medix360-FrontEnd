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
  canCreate?: boolean
  canExport?: boolean
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
    if (screen.path.includes('sehat-card')) {
      return [
        workflowAction('eligibility-check', 'Check Eligibility'),
        workflowAction('pre-authorization', 'Pre-Auth', 'pre-authorization', {
          payloadFields: [field('referenceNumber', 'Pre-Authorization No', 'text'), notesField],
        }),
        workflowAction('admission-approval', 'Approve Admission', 'admission-approval', {
          payloadFields: [field('referenceNumber', 'Admission Approval No', 'text', { required: true }), notesField],
        }),
        workflowAction('claim', 'Submit Claim'),
        workflowAction('objection', 'Record Objection', 'objection', {
          payloadFields: [field('reason', 'Objection Reason', 'textarea', { required: true })],
        }),
        workflowAction('resubmission', 'Resubmit', 'resubmission', { payloadFields: [notesField] }),
        workflowAction('payment-reconciliation', 'Reconcile Payment', 'payment-reconciliation', {
          payloadFields: [
            field('referenceNumber', 'Payment Reference', 'text', { required: true }),
            field('amount', 'Reconciled Amount', 'number', { required: true }),
          ],
        }),
        workflowAction('audit-flag', 'Audit Flag', 'audit-flag', {
          payloadFields: [field('reason', 'Audit / Fraud Reason', 'textarea', { required: true })],
        }),
      ]
    }
    if (screen.path.includes('leakage')) return [resolveAction, approveAction]
    if (screen.path.includes('claims') || screen.path.includes('panel-billing')) {
      return [verifyAction, approveAction, postAction, reverseAction]
    }
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
    if (screen.path.includes('mlc')) return [verifyAction, sendAction, resolveAction]
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

  if (screen.path.startsWith('/quality')) {
    return []
  }

  if (
    screen.path.startsWith('/maternity') ||
    screen.path.startsWith('/regulatory') ||
    screen.path.startsWith('/welfare') ||
    screen.path.startsWith('/patient-facilitation') ||
    screen.path.startsWith('/integrations') ||
    screen.path.startsWith('/ai') ||
    screen.path.startsWith('/downtime') ||
    screen.path.startsWith('/documents') ||
    screen.path.startsWith('/identity') ||
    screen.path.startsWith('/enterprise/multi-branch') ||
    screen.path.startsWith('/payments/gateways')
  ) {
    if (screen.path.includes('fbr-e-invoicing')) {
      return [
        workflowAction('validate', 'Validate'),
        workflowAction('submit', 'Submit', 'submit', {
          payloadFields: [
            field('irn', 'IRN', 'text'),
            field('qrPayload', 'QR Payload', 'textarea'),
            field('responsePayloadUri', 'Response Payload URI', 'text'),
          ],
        }),
        workflowAction('fail', 'Mark Failed', 'fail', {
          payloadFields: [
            field('failureReason', 'Failure Reason', 'textarea', { required: true }),
            field('responsePayloadUri', 'Response Payload URI', 'text'),
          ],
        }),
        workflowAction('retry', 'Queue Retry', 'retry', {
          payloadFields: [field('failureReason', 'Retry Reason', 'textarea')],
        }),
      ]
    }
    return [verifyAction, approveAction, resolveAction]
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

const sehatCardClaimForm = (): EnterpriseFormField[] => [
  field('claimNumber', 'Claim No', 'text'),
  field('cnic', 'CNIC', 'text', { required: true, placeholder: '35202-1234567-1' }),
  field('patientName', 'Patient Name', 'text', { required: true }),
  field('eligibilityReference', 'Eligibility Reference', 'text'),
  field('entitlementPlan', 'Entitlement / Family No', 'text'),
  field('packageCode', 'Package Code', 'text', { required: true }),
  field('packageName', 'Package Name', 'text'),
  field('preAuthorizationNumber', 'Pre-Authorization No', 'text'),
  field('admissionApprovalNumber', 'Admission Approval No', 'text'),
  field('admissionNumber', 'Admission No', 'text'),
  field('documentBundleUri', 'Claim Document Bundle URI', 'text'),
  field('dischargePackageUri', 'Discharge Package URI', 'text'),
  field('claimAmount', 'Claim Amount', 'number'),
  field('approvedAmount', 'Approved Amount', 'number'),
  field('reconciledAmount', 'Reconciled Amount', 'number'),
  field('paymentReference', 'Payment Reference', 'text'),
  field('status', 'Status', 'select', { options: ['Draft', 'Eligible', 'PreAuthorizationPending', 'AdmissionApproved', 'ClaimSubmitted', 'Objected', 'Rejected', 'Resubmitted', 'Paid', 'ManualReview'] }),
  field('objectionReason', 'Objection / Rejection Reason', 'textarea'),
  field('fraudFlag', 'Fraud / Audit Flag', 'select', { options: ['false', 'true'] }),
  field('auditFlags', 'Audit Flags', 'textarea'),
  notesField,
]

const panelBillingForm = (): EnterpriseFormField[] => [
  field('panelName', 'Panel / Corporate / TPA', 'text', { required: true }),
  patientField,
  field('employeeNo', 'Employee No', 'text'),
  field('dependentName', 'Dependent Name', 'text'),
  field('authorizationLetterNo', 'Authorization Letter No', 'text'),
  field('priceList', 'Price List', 'text'),
  field('creditLimit', 'Credit Limit', 'number'),
  field('invoiceNo', 'Invoice No', 'text'),
  field('receivableAmount', 'Receivable Amount', 'number'),
  field('agingBucket', 'Aging Bucket', 'select', { options: ['Current', '1-30', '31-60', '61-90', '90+'] }),
  field('status', 'Status', 'select', { options: ['Draft', 'Authorized', 'Billed', 'Submitted', 'PartPaid', 'Paid', 'Disputed'] }),
  notesField,
]

const diagnosticsForm = (type: 'Lab' | 'Radiology' | 'Approval'): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('encounterId', 'Visit ID', 'lookup', {
    lookupKind: 'encounter',
    lookupParamsFrom: { patientId: 'patientId' },
    placeholder: 'Select latest visit',
  }),
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

const labTestForm = (): EnterpriseFormField[] => [
  field('testName', 'Lab Test Name', 'text', { required: true }),
  field('category', 'Category', 'text', { placeholder: 'Biochemistry, Hematology, Microbiology' }),
  field('specimenType', 'Specimen Type', 'select', {
    options: ['Blood', 'Urine', 'Serum', 'Plasma', 'Swab', 'Tissue', 'Stool', 'Sputum'],
  }),
  field('unit', 'Unit', 'text', { placeholder: 'mg/dL, mmol/L, IU/L' }),
  field('referenceRange', 'Reference Range', 'text'),
  field('turnaroundTime', 'TAT', 'text', { placeholder: 'Same day, 24 hours' }),
  field('price', 'Price', 'number'),
  field('status', 'Status', 'select', { options: ['Active', 'Inactive'] }),
  notesField,
]

const labCategoryForm = (): EnterpriseFormField[] => [
  field('name', 'Category Name', 'text', { required: true }),
  field('department', 'Department', 'select', {
    options: ['Biochemistry', 'Hematology', 'Microbiology', 'Serology', 'Histopathology', 'Molecular'],
  }),
  field('code', 'Code', 'text'),
  field('description', 'Description', 'textarea'),
  field('status', 'Status', 'select', { options: ['Active', 'Inactive'] }),
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

const mlcForm = (): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('mlcNo', 'MLC No', 'text', { required: true }),
  field('caseType', 'Case Type', 'select', { options: ['RoadTrafficAccident', 'Assault', 'Poisoning', 'Gunshot', 'Burn', 'WorkplaceInjury', 'SexualAssault', 'Other'] }),
  field('policeStation', 'Police Station', 'text'),
  field('policeIntimationNo', 'Police Intimation No', 'text'),
  field('broughtBy', 'Brought By', 'text'),
  field('injurySummary', 'Injury Summary', 'textarea', { required: true }),
  field('evidenceChain', 'Evidence / Chain Of Custody', 'textarea'),
  field('legalStatus', 'Legal Status', 'select', { options: ['Open', 'PoliceInformed', 'ReportPrepared', 'CourtRequested', 'Closed'] }),
  reasonField,
]

const maternityForm = (): EnterpriseFormField[] => [
  patientField,
  doctorField,
  field('ancNo', 'ANC No', 'text'),
  field('gravidaPara', 'Gravida / Para', 'text'),
  field('laborStage', 'Labor Stage', 'select', { options: ['ANC', 'Latent', 'Active', 'SecondStage', 'ThirdStage', 'Postpartum'] }),
  field('deliveryMode', 'Delivery Mode', 'select', { options: ['Normal', 'Assisted', 'CSection', 'VBAC'] }),
  field('partographSummary', 'Partograph Summary', 'textarea'),
  field('newbornName', 'Newborn Name', 'text'),
  field('apgarScore', 'APGAR', 'text'),
  field('birthWeight', 'Birth Weight', 'number'),
  field('vaccinationAtBirth', 'Vaccination At Birth', 'select', { options: ['Pending', 'BCG', 'OPV0', 'HepB', 'Completed'] }),
  field('maternalComplications', 'Maternal Complications', 'textarea'),
  field('status', 'Status', 'select', { options: ['ANC', 'InLabor', 'Delivered', 'Postpartum', 'Referred', 'Closed'] }),
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

const regulatoryReportForm = (): EnterpriseFormField[] => [
  field('reportName', 'Report Name', 'text', { required: true }),
  field('reportType', 'Report Type', 'select', { options: ['DHIS', 'DiseaseSurveillance', 'BirthRegister', 'DeathRegister', 'NotifiableDisease', 'FacilityStatistics'] }),
  field('facilityId', 'Facility', 'lookup', { lookupKind: 'facility' }),
  field('periodFrom', 'Period From', 'date'),
  field('periodTo', 'Period To', 'date'),
  field('submissionNo', 'Submission No', 'text'),
  field('status', 'Status', 'select', { options: ['Draft', 'Validated', 'Submitted', 'Accepted', 'Returned'] }),
  notesField,
]

const welfareForm = (): EnterpriseFormField[] => [
  patientField,
  field('program', 'Program', 'select', { options: ['Charity', 'Zakat', 'Bait-ul-Mal', 'DonorFund', 'WelfareDiscount'] }),
  field('assessmentNo', 'Assessment No', 'text'),
  field('requestedAmount', 'Requested Amount', 'number'),
  field('approvedAmount', 'Approved Amount', 'number'),
  field('fundSource', 'Fund Source', 'text'),
  field('eligibilityNotes', 'Eligibility Notes', 'textarea'),
  field('status', 'Status', 'select', { options: ['Requested', 'UnderAssessment', 'Approved', 'Rejected', 'Posted', 'Reversed'] }),
  reasonField,
]

const complaintForm = (): EnterpriseFormField[] => [
  patientField,
  field('complaintNo', 'Complaint No', 'text', { required: true }),
  field('channel', 'Channel', 'select', { options: ['FrontDesk', 'SehatCardFacilitator', 'Phone', 'WhatsApp', 'Portal', 'WalkIn'] }),
  field('category', 'Category', 'select', { options: ['SehatCard', 'Billing', 'ClinicalCare', 'WaitingTime', 'StaffBehavior', 'Pharmacy', 'Lab', 'Facility'] }),
  field('priority', 'Priority', 'select', { options: ['Low', 'Medium', 'High', 'Critical'] }),
  field('slaDueAt', 'SLA Due', 'date'),
  field('assignedTo', 'Assigned To', 'text'),
  field('resolution', 'Resolution', 'textarea'),
  field('status', 'Status', 'select', { options: ['Open', 'Acknowledged', 'Escalated', 'Resolved', 'Closed'] }),
  notesField,
]

const integrationHubForm = (): EnterpriseFormField[] => [
  field('connectorName', 'Connector Name', 'text', { required: true }),
  field('connectorType', 'Connector Type', 'select', { options: ['FBR', 'ProvincialTax', 'SehatCard', 'StateLife', 'NADRA', 'SMS', 'WhatsApp', 'Email', 'Lab', 'PACS', 'Biometric', 'AccountingERP', 'PaymentGateway'] }),
  field('environment', 'Environment', 'select', { options: ['Sandbox', 'Live'] }),
  field('endpointUrl', 'Endpoint URL', 'text'),
  field('credentialReference', 'Credential Reference', 'text'),
  field('facilityId', 'Facility', 'lookup', { lookupKind: 'facility' }),
  field('status', 'Status', 'select', { options: ['Draft', 'Active', 'Paused', 'Failed', 'Retired'] }),
  notesField,
]

const fbrEinvoicingForm = (): EnterpriseFormField[] => [
  field('invoiceNumber', 'Invoice No', 'text', { required: true }),
  field('invoiceType', 'Invoice Type', 'select', { options: ['SaleInvoice', 'CreditNote', 'DebitNote', 'Return'] }),
  field('environment', 'Environment', 'select', { options: ['Sandbox', 'Live'] }),
  field('credentialReference', 'Credential Reference', 'text', { required: true }),
  field('branchCode', 'Branch Code', 'text', { required: true }),
  field('posId', 'POS / Branch ID', 'text', { required: true }),
  field('taxProfileCode', 'Tax Profile', 'text', { required: true }),
  field('provinceAdapter', 'Province Adapter', 'select', { options: ['FBR', 'PRA', 'SRB', 'KPRA', 'BRA'] }),
  field('buyerNtnOrCnic', 'Buyer NTN / CNIC', 'text'),
  field('grossAmount', 'Gross Amount', 'number'),
  field('taxAmount', 'Tax Amount', 'number'),
  field('netAmount', 'Net Amount', 'number'),
  field('originalInvoiceNumber', 'Original Invoice No', 'text'),
  field('irn', 'IRN', 'text'),
  field('qrPayload', 'QR Code Payload', 'textarea'),
  field('requestPayloadUri', 'Request Payload URI', 'text'),
  field('responsePayloadUri', 'Response Payload URI', 'text'),
  field('validationStatus', 'Validation Status', 'select', { options: ['Draft', 'Validated', 'Submitted', 'Accepted', 'Failed', 'RetryQueued'] }),
  field('failureReason', 'Failure Reason', 'textarea'),
]

const provincialTaxForm = (): EnterpriseFormField[] => [
  field('authority', 'Authority', 'select', { options: ['PRA', 'SRB', 'KPRA', 'BRA'] }),
  field('adapterName', 'Adapter Name', 'text', { required: true }),
  field('environment', 'Environment', 'select', { options: ['Sandbox', 'Live'] }),
  field('branchCode', 'Branch Code', 'text'),
  field('serviceCategory', 'Service Category', 'text'),
  field('taxRate', 'Tax Rate', 'number'),
  field('lastSyncStatus', 'Last Sync Status', 'select', { options: ['Ready', 'Pending', 'Accepted', 'Rejected', 'Failed'] }),
  notesField,
]

const aiAgentMarketplaceForm = (): EnterpriseFormField[] => [
  field('agentName', 'Agent Name', 'select', {
    options: [
      'Billing Claim Checker',
      'Sehat Card Document Auditor',
      'OPD Note Summarizer',
      'Lab Result Explanation Draft',
      'Discharge Summary Drafter',
      'Inventory Reorder Assistant',
      'Revenue Leakage Investigator',
      'Complaint Triage Assistant',
    ],
  }),
  field('provider', 'Provider', 'select', { options: ['OpenAI', 'AzureOpenAI', 'LocalModel', 'Other'] }),
  field('permissionCode', 'Permission Code', 'text'),
  field('facilityScope', 'Facility Scope', 'lookup', { lookupKind: 'facility' }),
  field('mode', 'Mode', 'select', { options: ['DraftOnly', 'ReviewRequired', 'ReadOnly'] }),
  field('status', 'Status', 'select', { options: ['Available', 'Installed', 'Paused', 'Disabled'] }),
  notesField,
]

const aiGovernanceForm = (): EnterpriseFormField[] => [
  field('policyName', 'Policy Name', 'text', { required: true }),
  field('modelProvider', 'Model Provider', 'select', { options: ['OpenAI', 'AzureOpenAI', 'LocalModel', 'Other'] }),
  field('phiRedaction', 'PHI Redaction', 'select', { options: ['Required', 'Optional', 'Disabled'] }),
  field('approvalRule', 'Approval Rule', 'select', { options: ['DraftOnly', 'HumanApprovalRequired', 'AutoApproveReadOnly'] }),
  field('blockedActions', 'Blocked Actions', 'textarea'),
  field('monthlyBudget', 'Monthly Budget', 'number'),
  field('status', 'Status', 'select', { options: ['Draft', 'Active', 'Paused', 'Archived'] }),
  reasonField,
]

const downtimeQueueForm = (): EnterpriseFormField[] => [
  field('queueType', 'Queue Type', 'select', { options: ['Receipt', 'PharmacySale', 'EmergencyRegistration', 'FBRInvoice'] }),
  field('localReference', 'Local Reference', 'text', { required: true }),
  field('facilityId', 'Facility', 'lookup', { lookupKind: 'facility' }),
  field('payloadSummary', 'Payload Summary', 'textarea'),
  field('syncStatus', 'Sync Status', 'select', { options: ['Queued', 'Syncing', 'Synced', 'Failed', 'ManualReview'] }),
  field('retryCount', 'Retry Count', 'number'),
  field('lastError', 'Last Error', 'textarea'),
  notesField,
]

const documentManagementForm = (): EnterpriseFormField[] => [
  patientField,
  field('documentType', 'Document Type', 'select', { options: ['CNIC', 'AdmissionForm', 'ClaimDocument', 'ConsentForm', 'PoliceLetter', 'AuthorizationLetter', 'DischargeBundle', 'Other'] }),
  field('sourceModule', 'Source Module', 'select', { options: ['SehatCard', 'MLC', 'PanelBilling', 'Welfare', 'IPD', 'ER', 'Maternity'] }),
  field('documentNo', 'Document No', 'text'),
  field('storageUri', 'Storage URI', 'text'),
  field('ocrStatus', 'OCR Status', 'select', { options: ['Pending', 'Extracted', 'Failed', 'NotRequired'] }),
  field('verificationStatus', 'Verification Status', 'select', { options: ['Pending', 'Verified', 'Rejected', 'Expired'] }),
  notesField,
]

const biometricCnicForm = (): EnterpriseFormField[] => [
  field('cnic', 'CNIC', 'text', { required: true }),
  patientField,
  field('verificationPurpose', 'Purpose', 'select', { options: ['SehatCard', 'PanelBilling', 'StaffAttendance', 'ControlledDrugs', 'HighRiskApproval'] }),
  field('deviceId', 'Device ID', 'text'),
  field('approvedChannel', 'Approved Channel', 'text'),
  field('verificationStatus', 'Verification Status', 'select', { options: ['Pending', 'Verified', 'Failed', 'ManualReview'] }),
  field('failureReason', 'Failure Reason', 'textarea'),
  reasonField,
]

const multiBranchForm = (): EnterpriseFormField[] => [
  field('branchName', 'Branch Name', 'text', { required: true }),
  field('facilityId', 'Facility', 'lookup', { lookupKind: 'facility' }),
  field('pricingProfile', 'Pricing Profile', 'text'),
  field('inventoryTransferPolicy', 'Inventory Transfer Policy', 'select', { options: ['Allowed', 'ApprovalRequired', 'Blocked'] }),
  field('taxCredentialProfile', 'Tax Credential Profile', 'text'),
  field('centralClaims', 'Central Claims', 'select', { options: ['Enabled', 'Disabled'] }),
  field('biScope', 'BI Scope', 'select', { options: ['BranchOnly', 'Region', 'Group'] }),
  field('status', 'Status', 'select', { options: ['Active', 'Paused', 'Closed'] }),
  notesField,
]

const paymentGatewayForm = (): EnterpriseFormField[] => [
  field('gatewayName', 'Gateway', 'select', { options: ['JazzCash', 'Easypaisa', 'BankTransfer', 'CardTerminal', 'QRPayment', 'Other'] }),
  field('merchantId', 'Merchant ID', 'text'),
  field('environment', 'Environment', 'select', { options: ['Sandbox', 'Live'] }),
  field('paymentUseCase', 'Use Case', 'select', { options: ['AppointmentDeposit', 'OPDReceipt', 'IPDBill', 'PharmacySale', 'OnlinePayment'] }),
  field('settlementAccount', 'Settlement Account', 'lookup', { lookupKind: 'paymentAccount' }),
  field('status', 'Status', 'select', { options: ['Draft', 'Active', 'Paused', 'Failed'] }),
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

const qualityStatusOptions = ['Open', 'Pending', 'InProgress', 'UnderReview', 'Approved', 'Completed', 'Closed', 'Cancelled']

const qualityForm = (type: string): EnterpriseFormField[] => {
  if (type === 'Incidents') {
    return [
      field('incidentNumber', 'Incident Number', 'text', { required: true }),
      field('occurredAt', 'Occurred At', 'date', { required: true }),
      field('reportedAt', 'Reported At', 'date', { required: true }),
      field('incidentType', 'Incident Type', 'select', { options: ['Clinical', 'Medication', 'Fall', 'InfectionControl', 'Equipment', 'Security', 'Other'] }),
      field('severity', 'Severity', 'select', { options: ['Low', 'Moderate', 'High', 'Critical'] }),
      patientField,
      field('departmentId', 'Department', 'lookup', { lookupKind: 'department' }),
      field('location', 'Location', 'text'),
      field('description', 'Description', 'textarea', { required: true }),
      field('immediateAction', 'Immediate Action', 'textarea'),
      field('reportedBy', 'Reported By', 'text', { required: true }),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Incident Actions') {
    return [
      field('incidentReportId', 'Incident Report ID', 'number', { required: true }),
      field('actionType', 'Action Type', 'select', { options: ['Containment', 'Investigation', 'Correction', 'FollowUp'] }),
      field('description', 'Description', 'textarea', { required: true }),
      field('ownerUserId', 'Owner User ID', 'text', { required: true }),
      field('dueDate', 'Due Date', 'date', { required: true }),
      field('completedAt', 'Completed At', 'date'),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Audit Checklists') {
    return [
      field('checklistCode', 'Checklist Code', 'text', { required: true }),
      field('name', 'Name', 'text', { required: true }),
      field('department', 'Department', 'text'),
      field('standard', 'Standard', 'text'),
      field('isActive', 'Active', 'select', { options: ['true', 'false'] }),
    ]
  }

  if (type === 'Audit Findings') {
    return [
      field('auditChecklistId', 'Audit Checklist ID', 'number', { required: true }),
      field('departmentId', 'Department', 'lookup', { lookupKind: 'department' }),
      field('auditDate', 'Audit Date', 'date', { required: true }),
      field('auditorUserId', 'Auditor User ID', 'text', { required: true }),
      field('findingType', 'Finding Type', 'select', { options: ['Observation', 'Minor', 'Major', 'Critical'] }),
      field('findingSummary', 'Finding Summary', 'textarea', { required: true }),
      field('scorePercent', 'Score Percent', 'number'),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Compliance Tasks') {
    return [
      field('taskNumber', 'Task Number', 'text', { required: true }),
      field('complianceArea', 'Compliance Area', 'text', { required: true }),
      field('requirement', 'Requirement', 'textarea', { required: true }),
      field('ownerUserId', 'Owner User ID', 'text', { required: true }),
      field('dueDate', 'Due Date', 'date', { required: true }),
      field('completedAt', 'Completed At', 'date'),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Corrective Actions') {
    return [
      field('sourceType', 'Source Type', 'select', { options: ['Incident', 'AuditFinding', 'Risk', 'ComplianceTask'] }),
      field('sourceId', 'Source ID', 'number', { required: true }),
      field('actionDescription', 'Action Description', 'textarea', { required: true }),
      field('ownerUserId', 'Owner User ID', 'text', { required: true }),
      field('dueDate', 'Due Date', 'date', { required: true }),
      field('completedAt', 'Completed At', 'date'),
      field('effectivenessCheck', 'Effectiveness Check', 'textarea'),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Risk Register') {
    return [
      field('riskNumber', 'Risk Number', 'text', { required: true }),
      field('riskCategory', 'Risk Category', 'select', { options: ['Clinical', 'Operational', 'Financial', 'Compliance', 'Security'] }),
      field('description', 'Description', 'textarea', { required: true }),
      field('likelihood', 'Likelihood', 'number', { required: true }),
      field('impact', 'Impact', 'number', { required: true }),
      field('riskScore', 'Risk Score', 'number', { required: true }),
      field('mitigationPlan', 'Mitigation Plan', 'textarea'),
      field('ownerUserId', 'Owner User ID', 'text', { required: true }),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Infection Control') {
    return [
      field('caseNumber', 'Case Number', 'text', { required: true }),
      patientField,
      field('admissionId', 'Admission ID', 'text'),
      field('infectionType', 'Infection Type', 'text', { required: true }),
      field('organism', 'Organism', 'text'),
      field('detectedAt', 'Detected At', 'date', { required: true }),
      field('isolationStatus', 'Isolation Status', 'select', { options: ['NotRequired', 'Required', 'Active', 'Discontinued'] }),
      field('antibioticPlan', 'Antibiotic Plan', 'textarea'),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  if (type === 'Mortality Reviews') {
    return [
      field('reviewNumber', 'Review Number', 'text', { required: true }),
      patientField,
      field('admissionId', 'Admission ID', 'text'),
      field('deathAt', 'Death At', 'date', { required: true }),
      field('reviewDate', 'Review Date', 'date', { required: true }),
      field('primaryCause', 'Primary Cause', 'textarea', { required: true }),
      field('preventability', 'Preventability', 'select', { options: ['NotPreventable', 'PossiblyPreventable', 'Preventable', 'UnderReview'] }),
      field('committeeDecision', 'Committee Decision', 'textarea'),
      field('status', 'Status', 'select', { options: qualityStatusOptions }),
    ]
  }

  return [notesField]
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
    const isSehatCard = screen.path.includes('sehat-card')
    const isPanelBilling = screen.path.includes('panel-billing')

    return {
      ...baseConfig,
      mutationEndpoint: isSehatCard ? screen.dataEndpoint : createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: isSehatCard
        ? sehatCardClaimForm()
        : isPanelBilling
          ? panelBillingForm()
          : financeForm(screen.title),
      filterFields: [
        statusFilter(isSehatCard
          ? ['EligibilityPending', 'Eligible', 'PreAuthPending', 'Approved', 'Submitted', 'Objected', 'Rejected', 'Paid']
          : isPanelBilling
            ? ['Draft', 'Authorized', 'Billed', 'Submitted', 'PartPaid', 'Paid', 'Disputed']
            : ['Draft', 'Pending', 'Approved', 'Posted', 'Rejected']),
        ...(isSehatCard
          ? [{ key: 'scheme', label: 'Scheme', type: 'select' as const, options: ['Sehat Sahulat Program', 'Sehat Card Plus KP', 'Punjab Health Initiative', 'State Life', 'Other'] }]
          : []),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        { key: 'paymentAccountId', label: 'Account', type: 'lookup', lookupKind: 'paymentAccount' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path === '/diagnostics/lab-tests') {
    return {
      ...baseConfig,
      mutationEndpoint: '/diagnostics/lab-tests',
      mutationLabel: 'Lab Test',
      canExport: false,
      requiresAuditReason: true,
      formFields: labTestForm(),
      filterFields: [
        { key: 'search', label: 'Search', type: 'text', placeholder: 'Search lab test' },
        statusFilter(['Active', 'Inactive']),
      ],
      rowActions: [],
    }
  }

  if (screen.path === '/diagnostics/categories') {
    return {
      ...baseConfig,
      mutationEndpoint: '/diagnostics/categories',
      mutationLabel: 'Lab Category',
      canExport: false,
      requiresAuditReason: true,
      formFields: labCategoryForm(),
      filterFields: [
        { key: 'search', label: 'Search', type: 'text', placeholder: 'Search category' },
        statusFilter(['Active', 'Inactive']),
      ],
      rowActions: [],
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
    const isMlc = screen.path.includes('mlc')

    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: isMlc ? mlcForm() : emergencyForm(screen.title),
      filterFields: [
        statusFilter(isMlc
          ? ['Open', 'PoliceInformed', 'ReportPrepared', 'CourtRequested', 'Closed']
          : ['Registered', 'Triaged', 'InTreatment', 'Observation', 'Admitted', 'Transferred', 'Discharged']),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        ...(isMlc
          ? [{ key: 'caseType', label: 'Case Type', type: 'select' as const, options: ['RoadTrafficAccident', 'Assault', 'Poisoning', 'Gunshot', 'Burn', 'WorkplaceInjury', 'Other'] }]
          : [{ key: 'acuityLevel', label: 'Acuity', type: 'select' as const, options: ['Resuscitation', 'Emergent', 'Urgent', 'LessUrgent', 'NonUrgent'] }]),
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

  if (screen.path.startsWith('/maternity')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: maternityForm(),
      filterFields: [
        statusFilter(['ANC', 'InLabor', 'Delivered', 'Postpartum', 'Referred', 'Closed']),
        { key: 'doctorId', label: 'Doctor', type: 'lookup', lookupKind: 'doctor' },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/regulatory')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: regulatoryReportForm(),
      filterFields: [
        statusFilter(['Draft', 'Validated', 'Submitted', 'Accepted', 'Returned']),
        { key: 'facilityId', label: 'Facility', type: 'lookup', lookupKind: 'facility' },
        { key: 'reportType', label: 'Report Type', type: 'select', options: ['DHIS', 'DiseaseSurveillance', 'BirthRegister', 'DeathRegister', 'NotifiableDisease', 'FacilityStatistics'] },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/welfare')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: welfareForm(),
      filterFields: [
        statusFilter(['Requested', 'UnderAssessment', 'Approved', 'Rejected', 'Posted', 'Reversed']),
        { key: 'program', label: 'Program', type: 'select', options: ['Charity', 'Zakat', 'Bait-ul-Mal', 'DonorFund', 'WelfareDiscount'] },
        ...dateFilters,
      ],
    }
  }

  if (screen.path.startsWith('/patient-facilitation')) {
    return {
      ...baseConfig,
      mutationEndpoint: createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields: complaintForm(),
      filterFields: [
        statusFilter(['Open', 'Acknowledged', 'Escalated', 'Resolved', 'Closed']),
        { key: 'category', label: 'Category', type: 'select', options: ['SehatCard', 'Billing', 'ClinicalCare', 'WaitingTime', 'StaffBehavior', 'Pharmacy', 'Lab', 'Facility'] },
        ...dateFilters,
      ],
    }
  }

  if (
    screen.path.startsWith('/integrations') ||
    screen.path.startsWith('/ai') ||
    screen.path.startsWith('/downtime') ||
    screen.path.startsWith('/documents') ||
    screen.path.startsWith('/identity') ||
    screen.path.startsWith('/enterprise/multi-branch') ||
    screen.path.startsWith('/payments/gateways')
  ) {
    const formFields = (() => {
      if (screen.path.includes('fbr-e-invoicing')) return fbrEinvoicingForm()
      if (screen.path.includes('provincial-tax')) return provincialTaxForm()
      if (screen.path.includes('agent-marketplace')) return aiAgentMarketplaceForm()
      if (screen.path.includes('governance')) return aiGovernanceForm()
      if (screen.path.includes('downtime')) return downtimeQueueForm()
      if (screen.path.includes('documents')) return documentManagementForm()
      if (screen.path.includes('biometric-cnic')) return biometricCnicForm()
      if (screen.path.includes('multi-branch')) return multiBranchForm()
      if (screen.path.includes('gateways')) return paymentGatewayForm()
      return integrationHubForm()
    })()

    return {
      ...baseConfig,
      mutationEndpoint: screen.path.includes('fbr-e-invoicing') ? screen.dataEndpoint : createEndpoint,
      mutationLabel: screen.title,
      requiresAuditReason: true,
      formFields,
      filterFields: [
        statusFilter(['Draft', 'Ready', 'Active', 'Pending', 'Failed', 'Paused', 'Accepted', 'Rejected']),
        { key: 'facilityId', label: 'Facility', type: 'lookup', lookupKind: 'facility' },
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

  if (screen.path.startsWith('/quality')) {
    const isReports = screen.path.includes('reports')

    return {
      ...baseConfig,
      mutationEndpoint: screen.dataEndpoint,
      exportEndpoint: isReports ? '/quality/reports/open-actions' : `${screen.dataEndpoint}/export/csv`,
      mutationLabel: screen.title,
      canCreate: !isReports,
      canExport: false,
      requiresAuditReason: !isReports,
      formFields: isReports ? [] : qualityForm(screen.title),
      filterFields: [
        statusFilter(qualityStatusOptions),
        { key: 'departmentId', label: 'Department', type: 'lookup', lookupKind: 'department' },
        ...dateFilters,
      ],
    }
  }

  if (
    screen.path.startsWith('/blood-bank') ||
    screen.path.startsWith('/lis') ||
    screen.path.startsWith('/clinical/ai-voice-scribe') ||
    screen.path.startsWith('/telemedicine') ||
    screen.path.startsWith('/radiology/pacs-viewer') ||
    screen.path.startsWith('/interoperability/abdm-abha')
  ) {
    return {
      ...baseConfig,
      mutationEndpoint: '',
      exportEndpoint: '',
      mutationLabel: screen.title,
      canCreate: false,
      canExport: false,
      rowActions: [],
      formFields: [],
      filterFields: [
        statusFilter(['Ready', 'Pending', 'Active', 'InProgress', 'Flagged', 'Completed']),
        { key: 'facilityId', label: 'Facility', type: 'lookup', lookupKind: 'facility' },
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

const qualityActions = [
  { title: 'Capture events', description: 'Record incidents, infection-control cases, mortality reviews, and audit findings.' },
  { title: 'Track corrective work', description: 'Assign owners, due dates, action status, and effectiveness follow-up.' },
  { title: 'Monitor compliance risk', description: 'Review open actions, risk scores, checklist coverage, and report summaries.' },
]

const bloodBankActions = [
  { title: 'Protect inventory', description: 'Track units by blood group, component, expiry, temperature, and storage location.' },
  { title: 'Verify compatibility', description: 'Manage cross-match status before issuing blood for transfusion.' },
  { title: 'Audit movement', description: 'Review issue, return, discard, and cold-chain exception history.' },
]

const advancedHmsActions = [
  { title: 'Extend clinical workflow', description: 'Add AI, video care, image viewing, and national health identity workflows.' },
  { title: 'Keep context connected', description: 'Link notes, prescriptions, reports, payments, and patient portal communication.' },
  { title: 'Prepare integrations', description: 'Expose backend-ready endpoints for implementation-specific connectors.' },
]

const lisActions = [
  { title: 'Control pre-analytics', description: 'Manage outreach orders, phlebotomy, accessioning, routing, and custody.' },
  { title: 'Coordinate testing', description: 'Track analyzer worklists, pathology, molecular diagnostics, and microbiology.' },
  { title: 'Improve quality', description: 'Monitor auto-verification, reflex rules, alerts, reagent stock, and compliance.' },
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
    path: '/finance/sehat-card-claims',
    dataEndpoint: '/finance/sehat-card-claims',
    module: 'Sehat Card / SSP',
    title: 'Sehat Card Claims',
    subtitle: 'CNIC eligibility, entitlement, package selection, pre-authorization, claim documents, objections, resubmission, payment reconciliation, and fraud review.',
    workflow: ['Check CNIC eligibility', 'Select package', 'Request pre-authorization', 'Attach discharge documents', 'Submit or resubmit claim', 'Reconcile payment'],
    actions: financeActions,
  },
  {
    path: '/finance/panel-billing',
    dataEndpoint: '/finance/panel-billing',
    module: 'Panel / TPA Billing',
    title: 'Panel Billing',
    subtitle: 'Corporate, insurance, TPA, NGO, State Life, and government-panel billing with price lists, authorization letters, receivables, and aging.',
    workflow: ['Verify employee or dependent', 'Validate authorization', 'Apply panel price list', 'Bill on credit', 'Submit receivable', 'Track aging'],
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
    path: '/diagnostics/lab-tests',
    dataEndpoint: '/lookups/lab-tests',
    module: 'Laboratory',
    title: 'Lab Tests',
    subtitle: 'Master list for lab investigations, specimen details, reference ranges, and pricing.',
    workflow: ['Create test', 'Set specimen', 'Define range', 'Set price', 'Activate'],
    actions: diagnosticActions,
  },
  {
    path: '/diagnostics/categories',
    dataEndpoint: '/diagnostics/categories',
    module: 'Laboratory',
    title: 'Categories',
    subtitle: 'Lab category setup for grouping tests by department and reporting workflow.',
    workflow: ['Create category', 'Assign department', 'Add description', 'Review usage', 'Activate'],
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
    path: '/emergency/er-workflow',
    dataEndpoint: '/emergency/er-workflow',
    module: 'Emergency',
    title: 'ER Workflow',
    subtitle: 'Emergency registration, triage, trauma care, quick orders, casualty notes, death-on-arrival, referral out, and disposition workflow.',
    workflow: ['Quick register', 'Triage and tag MLC if needed', 'Order lab/pharmacy/radiology', 'Document casualty notes', 'Admit, discharge, refer, or mark death'],
    actions: ipdActions,
  },
  {
    path: '/emergency/mlc-register',
    dataEndpoint: '/emergency/mlc-register',
    module: 'MLC / Legal',
    title: 'MLC Register',
    subtitle: 'Medico-legal case register for accidents, assault, poisoning, firearm injury, police intimation, legal reports, and immutable audit.',
    workflow: ['Open MLC', 'Capture injuries', 'Inform police', 'Maintain evidence chain', 'Prepare legal report', 'Close with audit'],
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
    path: '/ot/surgery-management',
    dataEndpoint: '/ot/surgery-management',
    module: 'OT / Surgery',
    title: 'Surgery Management',
    subtitle: 'Surgery scheduling, surgeon and anesthesia team, consent, pre-op checklist, implants, consumables, recovery, post-op notes, and package mapping.',
    workflow: ['Schedule surgery', 'Complete consent and pre-op checks', 'Assign OT team', 'Record implants and consumables', 'Write post-op notes', 'Map package for claim'],
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
    path: '/maternity/labor-room',
    dataEndpoint: '/maternity/labor-room',
    module: 'Maternity',
    title: 'Labor Room And Newborn',
    subtitle: 'ANC, labor progress, partograph, delivery notes, C-section workflow, birth register, APGAR, newborn admission, and vaccination at birth.',
    workflow: ['Track ANC', 'Monitor labor', 'Record delivery', 'Register newborn', 'Capture APGAR and birth vaccines', 'Close postpartum care'],
    actions: ipdActions,
  },
  {
    path: '/regulatory/government-reports',
    dataEndpoint: '/regulatory/government-reports',
    module: 'Government Reporting',
    title: 'Government Reports',
    subtitle: 'DHIS-style statistics, notifiable disease surveillance, birth/death summaries, facility indicators, and provincial reporting exports.',
    workflow: ['Select reporting period', 'Validate indicators', 'Review exceptions', 'Submit report', 'Track acceptance or return'],
    actions: operationsActions,
  },
  {
    path: '/welfare/charity-zakat',
    dataEndpoint: '/welfare/charity-zakat',
    module: 'Welfare Desk',
    title: 'Charity / Zakat',
    subtitle: 'Welfare assessment, donor funds, Zakat, Bait-ul-Mal, partial discounts, approvals, posting, and audit trail.',
    workflow: ['Assess eligibility', 'Choose fund source', 'Approve support', 'Apply discount or payment', 'Post adjustment', 'Audit utilization'],
    actions: operationsActions,
  },
  {
    path: '/patient-facilitation/complaints',
    dataEndpoint: '/patient-facilitation/complaints',
    module: 'Patient Facilitation',
    title: 'Complaint Desk',
    subtitle: 'Sehat Card facilitator and patient complaint registration, category, SLA, escalation, resolution, and satisfaction tracking.',
    workflow: ['Register complaint', 'Assign owner', 'Track SLA', 'Escalate if overdue', 'Resolve case', 'Capture satisfaction'],
    actions: operationsActions,
  },
  {
    path: '/integrations/hub',
    dataEndpoint: '/integrations/hub',
    module: 'Integration Hub',
    title: 'Connector Hub',
    subtitle: 'Central connector registry for FBR, provincial tax, Sehat Card, State Life, NADRA, SMS, WhatsApp, email, labs, PACS, biometric devices, ERP, and payment gateways.',
    workflow: ['Register connector', 'Attach credentials', 'Map facility', 'Test connection', 'Activate', 'Monitor health'],
    actions: operationsActions,
  },
  {
    path: '/integrations/fbr-e-invoicing',
    dataEndpoint: '/integrations/fbr-e-invoicing',
    module: 'Tax Integrations',
    title: 'FBR E-Invoicing',
    subtitle: 'Plug-and-play FBR digital invoicing and POS integration with sandbox/live credentials, invoice validation, IRN, QR, retry queue, failed invoice dashboard, credit/debit notes, tax profiles, branch/POS mapping, and audit log.',
    workflow: ['Configure credentials', 'Map branch/POS', 'Validate invoice', 'Submit to FBR', 'Capture IRN and QR', 'Retry or resolve failures'],
    actions: operationsActions,
  },
  {
    path: '/integrations/provincial-tax',
    dataEndpoint: '/integrations/provincial-tax',
    module: 'Tax Integrations',
    title: 'Provincial Tax Integrations',
    subtitle: 'Adapter-based tax integrations for PRA, SRB, KPRA, and BRA with province-specific credentials, service categories, rates, submissions, and retries.',
    workflow: ['Choose authority', 'Configure adapter', 'Map tax profile', 'Submit transaction', 'Track response', 'Resolve exceptions'],
    actions: operationsActions,
  },
  {
    path: '/ai/agent-marketplace',
    dataEndpoint: '/ai/agent-marketplace',
    module: 'AI Agents',
    title: 'AI Agent Marketplace',
    subtitle: 'Permission-gated, tenant/facility-scoped, draft-only installable agents for claims, Sehat Card document audit, OPD summaries, lab explanations, discharge drafts, inventory reorder, revenue leakage, and complaint triage.',
    workflow: ['Review agent', 'Check permissions', 'Install in draft mode', 'Scope facility', 'Monitor usage', 'Disable if needed'],
    actions: operationsActions,
  },
  {
    path: '/ai/governance',
    dataEndpoint: '/ai/governance',
    module: 'AI Governance',
    title: 'AI Governance Center',
    subtitle: 'AI provider, model, prompt policy, PHI redaction, approval rules, blocked actions, audit review, and usage cost tracking.',
    workflow: ['Define policy', 'Select provider', 'Set redaction', 'Require approval', 'Track usage', 'Audit outcomes'],
    actions: operationsActions,
  },
  {
    path: '/downtime/offline-queue',
    dataEndpoint: '/downtime/offline-queue',
    module: 'Downtime Mode',
    title: 'Offline Queue',
    subtitle: 'Local downtime queue for receipts, pharmacy sales, emergency registration, and FBR invoices with sync status, retries, and manual review.',
    workflow: ['Capture locally', 'Queue payload', 'Sync when online', 'Retry failures', 'Review conflicts', 'Close queue item'],
    actions: operationsActions,
  },
  {
    path: '/documents/management',
    dataEndpoint: '/documents/management',
    module: 'Document Management',
    title: 'Documents And Scanning',
    subtitle: 'Document scanning and bundle management for CNICs, admission forms, claims, consents, police letters, authorization letters, and discharge packages.',
    workflow: ['Scan document', 'Classify type', 'Run OCR', 'Verify document', 'Attach to workflow', 'Audit access'],
    actions: operationsActions,
  },
  {
    path: '/identity/biometric-cnic',
    dataEndpoint: '/identity/biometric-cnic',
    module: 'Identity Verification',
    title: 'Biometric / CNIC Verification',
    subtitle: 'Approved-channel CNIC and biometric verification layer for Sehat Card, panels, attendance, controlled drugs, and high-risk approvals.',
    workflow: ['Capture CNIC', 'Select purpose', 'Verify through device/channel', 'Store result', 'Escalate failure', 'Audit access'],
    actions: operationsActions,
  },
  {
    path: '/enterprise/multi-branch',
    dataEndpoint: '/enterprise/multi-branch',
    module: 'Enterprise Controls',
    title: 'Multi-Branch Controls',
    subtitle: 'Facility-level pricing, inventory transfers, pharmacy stock visibility, branch tax credentials, centralized claims, and consolidated BI controls.',
    workflow: ['Register branch', 'Assign pricing', 'Set inventory policy', 'Map tax credentials', 'Centralize claims', 'Review BI'],
    actions: operationsActions,
  },
  {
    path: '/payments/gateways',
    dataEndpoint: '/payments/gateways',
    module: 'Payment Integrations',
    title: 'Payment Gateways',
    subtitle: 'JazzCash, Easypaisa, bank transfer, card terminal references, QR payments, online appointment deposits, settlement accounts, and reconciliation.',
    workflow: ['Configure gateway', 'Map merchant', 'Test sandbox', 'Activate live', 'Collect payment', 'Reconcile settlement'],
    actions: operationsActions,
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
  {
    path: '/quality/incidents',
    dataEndpoint: '/quality/incidents',
    module: 'Quality And Compliance',
    title: 'Incidents',
    subtitle: 'Incident capture, severity review, immediate action, ownership, and closure workflow.',
    workflow: ['Report incident', 'Assess severity', 'Capture immediate action', 'Assign owner', 'Close or escalate'],
    actions: qualityActions,
  },
  {
    path: '/quality/incident-actions',
    dataEndpoint: '/quality/incident-actions',
    module: 'Quality And Compliance',
    title: 'Incident Actions',
    subtitle: 'Follow-up actions linked to incidents with due dates, owners, and completion status.',
    workflow: ['Create action', 'Assign owner', 'Track due date', 'Complete action', 'Verify effectiveness'],
    actions: qualityActions,
  },
  {
    path: '/quality/audit-checklists',
    dataEndpoint: '/quality/audit-checklists',
    module: 'Quality And Compliance',
    title: 'Audit Checklists',
    subtitle: 'Checklist masters for department standards, evidence requirements, and active audit scope.',
    workflow: ['Define checklist', 'Add requirements', 'Activate standard', 'Use in audit', 'Review coverage'],
    actions: qualityActions,
  },
  {
    path: '/quality/audit-findings',
    dataEndpoint: '/quality/audit-findings',
    module: 'Quality And Compliance',
    title: 'Audit Findings',
    subtitle: 'Audit findings with checklist, department, score, type, and corrective action tracking.',
    workflow: ['Run audit', 'Capture finding', 'Score result', 'Assign action', 'Verify closure'],
    actions: qualityActions,
  },
  {
    path: '/quality/compliance-tasks',
    dataEndpoint: '/quality/compliance-tasks',
    module: 'Quality And Compliance',
    title: 'Compliance Tasks',
    subtitle: 'Regulatory and internal compliance tasks with requirements, owners, due dates, and completion.',
    workflow: ['Define requirement', 'Assign owner', 'Track due date', 'Complete evidence', 'Review compliance'],
    actions: qualityActions,
  },
  {
    path: '/quality/corrective-actions',
    dataEndpoint: '/quality/corrective-actions',
    module: 'Quality And Compliance',
    title: 'Corrective Actions',
    subtitle: 'Corrective and preventive action register across incidents, audits, risks, and compliance tasks.',
    workflow: ['Identify source', 'Plan action', 'Assign owner', 'Check effectiveness', 'Close action'],
    actions: qualityActions,
  },
  {
    path: '/quality/risk-register',
    dataEndpoint: '/quality/risk-register',
    module: 'Quality And Compliance',
    title: 'Risk Register',
    subtitle: 'Operational, clinical, financial, and compliance risks with likelihood, impact, score, and mitigation.',
    workflow: ['Register risk', 'Score likelihood', 'Score impact', 'Plan mitigation', 'Review status'],
    actions: qualityActions,
  },
  {
    path: '/quality/infection-control',
    dataEndpoint: '/quality/infection-control-cases',
    module: 'Quality And Compliance',
    title: 'Infection Control',
    subtitle: 'Infection-control case tracking with organism, isolation status, antibiotic plan, and case status.',
    workflow: ['Detect case', 'Record organism', 'Set isolation', 'Plan antibiotics', 'Resolve case'],
    actions: qualityActions,
  },
  {
    path: '/quality/mortality-reviews',
    dataEndpoint: '/quality/mortality-reviews',
    module: 'Quality And Compliance',
    title: 'Mortality Reviews',
    subtitle: 'Mortality review workflow with cause, preventability, committee decision, and closure status.',
    workflow: ['Open review', 'Document cause', 'Assess preventability', 'Record decision', 'Close review'],
    actions: qualityActions,
  },
  {
    path: '/quality/reports',
    dataEndpoint: '/quality/reports/risk-summary',
    module: 'Quality And Compliance',
    title: 'Quality Reports',
    subtitle: 'Incident summary, open actions, risk summary, and compliance reporting workspace.',
    workflow: ['Select report', 'Apply period', 'Review summary', 'Export findings', 'Share actions'],
    actions: qualityActions,
  },
  {
    path: '/blood-bank/donors',
    dataEndpoint: '/blood-bank/donors',
    module: 'Blood Bank',
    title: 'Donor Registry',
    subtitle: 'Donor eligibility, donation history, blood group, screening, and deferral tracking.',
    workflow: ['Register donor', 'Screen eligibility', 'Collect donation', 'Record result', 'Schedule next donation'],
    actions: bloodBankActions,
  },
  {
    path: '/blood-bank/blood-units',
    dataEndpoint: '/blood-bank/blood-units',
    module: 'Blood Bank',
    title: 'Blood Units',
    subtitle: 'Component inventory for whole blood, packed cells, plasma, platelets, expiry, and storage status.',
    workflow: ['Receive unit', 'Test and label', 'Store by component', 'Monitor expiry', 'Reserve or discard'],
    actions: bloodBankActions,
  },
  {
    path: '/blood-bank/cross-matching',
    dataEndpoint: '/blood-bank/cross-matching',
    module: 'Blood Bank',
    title: 'Cross Matching',
    subtitle: 'Compatibility testing, antibody screening, and transfusion readiness workflow.',
    workflow: ['Receive request', 'Select unit', 'Run compatibility', 'Approve match', 'Release for issue'],
    actions: bloodBankActions,
  },
  {
    path: '/blood-bank/issue-return',
    dataEndpoint: '/blood-bank/issue-return',
    module: 'Blood Bank',
    title: 'Issue And Return',
    subtitle: 'Blood issue, bedside handoff, return, discard, and transfusion reaction tracking.',
    workflow: ['Approve issue', 'Dispatch unit', 'Confirm transfusion', 'Process return', 'Audit exception'],
    actions: bloodBankActions,
  },
  {
    path: '/blood-bank/cold-chain',
    dataEndpoint: '/blood-bank/cold-chain',
    module: 'Blood Bank',
    title: 'Cold Chain',
    subtitle: 'Refrigerator inventory, temperature logs, excursion alerts, and storage-location monitoring.',
    workflow: ['Log temperature', 'Detect excursion', 'Quarantine unit', 'Review stability', 'Release or discard'],
    actions: bloodBankActions,
  },
  {
    path: '/clinical/ai-voice-scribe',
    dataEndpoint: '/clinical/ai-voice-scribe',
    module: 'Advanced Clinical',
    title: 'AI Voice Scribe',
    subtitle: 'Doctor dictation workspace for structured notes, prescriptions, diagnoses, and follow-up instructions.',
    workflow: ['Record encounter', 'Transcribe speech', 'Structure note', 'Review prescription', 'Save to EMR'],
    actions: advancedHmsActions,
  },
  {
    path: '/telemedicine/workspace',
    dataEndpoint: '/patient-engagement/telemedicine-workspace',
    module: 'Patient Engagement',
    title: 'Telemedicine Workspace',
    subtitle: 'Remote consultation cockpit with session queue, chat, prescription, billing, and follow-up context.',
    workflow: ['Start session', 'Verify patient', 'Consult remotely', 'Issue prescription', 'Collect payment'],
    actions: advancedHmsActions,
  },
  {
    path: '/radiology/pacs-viewer',
    dataEndpoint: '/radiology/pacs-viewer',
    module: 'Radiology',
    title: 'PACS Image Viewer',
    subtitle: 'Imaging viewer launchpad for DICOM studies, PACS URLs, report context, and viewing status.',
    workflow: ['Open study', 'Load images', 'Review prior scan', 'Draft findings', 'Release report'],
    actions: advancedHmsActions,
  },
  {
    path: '/interoperability/abdm-abha',
    dataEndpoint: '/interoperability/abdm-abha',
    module: 'Interoperability',
    title: 'ABDM / ABHA',
    subtitle: 'ABHA identity linking, consent, health information exchange, and ABDM compliance workspace.',
    workflow: ['Verify ABHA', 'Capture consent', 'Link records', 'Exchange data', 'Audit access'],
    actions: advancedHmsActions,
  },
  {
    path: '/lis/outreach-orders',
    dataEndpoint: '/lis/outreach-orders',
    module: 'Enterprise LIS',
    title: 'Outreach Orders',
    subtitle: 'External clinic and home-collection order intake with real-time tracking and source attribution.',
    workflow: ['Receive order', 'Validate patient', 'Assign collection', 'Track status', 'Bill source'],
    actions: lisActions,
  },
  {
    path: '/lis/phlebotomy-collections',
    dataEndpoint: '/lis/phlebotomy-collections',
    module: 'Enterprise LIS',
    title: 'Phlebotomy Collections',
    subtitle: 'Home and in-facility phlebotomy, consent, collection handoff, GPS, and transport monitoring.',
    workflow: ['Assign phlebotomist', 'Capture consent', 'Collect sample', 'Track transport', 'Receive sample'],
    actions: lisActions,
  },
  {
    path: '/lis/accessioning-barcoding',
    dataEndpoint: '/lis/accessioning-barcoding',
    module: 'Enterprise LIS',
    title: 'Accessioning And Barcoding',
    subtitle: 'Barcode/RFID accessioning and chain-of-custody control from receipt through processing.',
    workflow: ['Scan sample', 'Generate accession', 'Validate container', 'Print barcode', 'Route specimen'],
    actions: lisActions,
  },
  {
    path: '/lis/specimen-routing',
    dataEndpoint: '/lis/specimen-routing',
    module: 'Enterprise LIS',
    title: 'Specimen Routing',
    subtitle: 'Pre-processing, sample sorting, department routing, aliquot tracking, and exception handling.',
    workflow: ['Receive specimen', 'Sort department', 'Prepare aliquot', 'Dispatch bench', 'Track exception'],
    actions: lisActions,
  },
  {
    path: '/lis/instrument-worklists',
    dataEndpoint: '/lis/instrument-worklists',
    module: 'Enterprise LIS',
    title: 'Instrument Worklists',
    subtitle: 'Bidirectional analyzer worklists, instrument status, result import, and downtime visibility.',
    workflow: ['Build worklist', 'Send to analyzer', 'Run test', 'Receive result', 'Handle downtime'],
    actions: lisActions,
  },
  {
    path: '/lis/anatomic-pathology',
    dataEndpoint: '/lis/anatomic-pathology',
    module: 'Enterprise LIS',
    title: 'Anatomic Pathology',
    subtitle: 'Biopsy, cytology, grossing, histology, slide tracking, and digital pathology workflow.',
    workflow: ['Receive specimen', 'Gross case', 'Process tissue', 'Review slide', 'Sign report'],
    actions: lisActions,
  },
  {
    path: '/lis/molecular-diagnostics',
    dataEndpoint: '/lis/molecular-diagnostics',
    module: 'Enterprise LIS',
    title: 'Molecular Diagnostics',
    subtitle: 'NGS, DNA/RNA analysis, molecular panels, variant interpretation, and result approval.',
    workflow: ['Extract sample', 'Run assay', 'Analyze variant', 'Review interpretation', 'Release report'],
    actions: lisActions,
  },
  {
    path: '/lis/microbiology',
    dataEndpoint: '/lis/microbiology',
    module: 'Enterprise LIS',
    title: 'Microbiology',
    subtitle: 'Culture tracking, incubation, organism identification, sensitivity testing, and infection alerts.',
    workflow: ['Inoculate culture', 'Track incubation', 'Identify organism', 'Run sensitivity', 'Release result'],
    actions: lisActions,
  },
  {
    path: '/lis/auto-verification',
    dataEndpoint: '/lis/auto-verification',
    module: 'Enterprise LIS',
    title: 'Auto Verification',
    subtitle: 'Rules-based result validation to auto-release normal findings and flag exceptions.',
    workflow: ['Evaluate rules', 'Check delta', 'Flag abnormal', 'Auto-release normal', 'Queue review'],
    actions: lisActions,
  },
  {
    path: '/lis/reflex-testing',
    dataEndpoint: '/lis/reflex-testing',
    module: 'Enterprise LIS',
    title: 'Reflex Testing',
    subtitle: 'Logical follow-up testing rules triggered by abnormal, critical, or clinically linked results.',
    workflow: ['Detect trigger', 'Select follow-up', 'Create order', 'Notify lab', 'Track completion'],
    actions: lisActions,
  },
  {
    path: '/lis/critical-alerts',
    dataEndpoint: '/lis/critical-alerts',
    module: 'Enterprise LIS',
    title: 'Critical Value Alerts',
    subtitle: 'Immediate notification workflow for life-threatening results with acknowledgement tracking.',
    workflow: ['Detect critical value', 'Notify clinician', 'Escalate if missed', 'Acknowledge', 'Audit response'],
    actions: lisActions,
  },
  {
    path: '/lis/reagent-inventory',
    dataEndpoint: '/lis/reagent-inventory',
    module: 'Enterprise LIS',
    title: 'Reagent Inventory',
    subtitle: 'Reagent kits, lot numbers, shelf life, low-stock alerts, and supplier reorder planning.',
    workflow: ['Receive reagent', 'Track lot', 'Monitor usage', 'Raise low-stock alert', 'Reorder'],
    actions: lisActions,
  },
  {
    path: '/lis/biobanking',
    dataEndpoint: '/lis/biobanking',
    module: 'Enterprise LIS',
    title: 'Biobanking',
    subtitle: 'Long-term specimen storage with freezer, rack, shelf, position, consent, and research status.',
    workflow: ['Register specimen', 'Assign freezer', 'Track position', 'Manage consent', 'Retrieve sample'],
    actions: lisActions,
  },
  {
    path: '/lis/document-control',
    dataEndpoint: '/lis/document-control',
    module: 'Enterprise LIS',
    title: 'Document Control',
    subtitle: 'SOP, ISO 15189/CAP compliance documents, versioning, acknowledgements, and audit trail.',
    workflow: ['Draft SOP', 'Review version', 'Approve document', 'Publish', 'Track acknowledgement'],
    actions: lisActions,
  },
  {
    path: '/lis/predictive-maintenance',
    dataEndpoint: '/lis/predictive-maintenance',
    module: 'Enterprise LIS',
    title: 'Predictive Maintenance',
    subtitle: 'Analyzer telemetry, downtime prediction, maintenance schedules, and failure-risk scoring.',
    workflow: ['Collect telemetry', 'Score risk', 'Schedule maintenance', 'Log service', 'Review downtime'],
    actions: lisActions,
  },
  {
    path: '/lis/ai-interpretation',
    dataEndpoint: '/lis/ai-interpretation',
    module: 'Enterprise LIS',
    title: 'AI Result Interpretation',
    subtitle: 'Plain-language result summaries and interpretation support for clinician and patient review.',
    workflow: ['Load report', 'Generate summary', 'Review clinically', 'Publish explanation', 'Track feedback'],
    actions: lisActions,
  },
]

export default screens.map(makeRoute)
