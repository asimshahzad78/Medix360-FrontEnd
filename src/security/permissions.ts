import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

export const PERMISSIONS = {
  DashboardView: 'Dashboard.View',

  PatientsView: 'Patients.View',
  AppointmentsView: 'Appointments.View',
  OpdCheckupsView: 'OPD.Checkups.View',

  HrDepartmentsView: 'HR.Departments.View',
  HrDesignationsView: 'HR.Designations.View',
  HrWorkforceView: 'HR.Workforce.View',
  HrShiftsView: 'HR.Shifts.View',
  HrLeaveTypesView: 'HR.LeaveTypes.View',
  HrPermissionsView: 'HR.Permissions.View',
  HrOnboardingChecklistItemsView: 'HR.OnboardingChecklistItems.View',
  HrAttendanceLogsView: 'HR.AttendanceLogs.View',
  HrDutyRostersView: 'HR.DutyRosters.View',
  HrLeaveBalancesView: 'HR.LeaveBalances.View',
  HrLeaveRequestsView: 'HR.LeaveRequests.View',
  HrPayrollsView: 'HR.Payrolls.View',
  HrCredentialsView: 'HR.Credentials.View',
  HrTrainingEnrollmentsView: 'HR.TrainingEnrollments.View',
  HrPerformanceAppraisalsView: 'HR.PerformanceAppraisals.View',
  HrDisciplinaryIncidentsView: 'HR.DisciplinaryIncidents.View',
  HrEmploymentProfileTagsView: 'HR.EmploymentProfileTags.View',

  FinancePaymentsView: 'Finance.Payments.View',
  FinanceCounterClosingView: 'Finance.CounterClosing.View',
  FinanceCoaView: 'Finance.COA.View',
  FinanceExpenseVouchersView: 'Finance.ExpenseVouchers.View',
  FinanceDailyClosingView: 'Finance.DailyClosing.View',
  FinancePaymentCategoriesView: 'Finance.PaymentCategories.View',
  FinanceRefundsView: 'Finance.Refunds.View',
  FinanceClaimsView: 'Finance.Claims.View',
  FinancePostingView: 'Finance.Posting.View',
  FinanceDoctorShareView: 'Finance.DoctorShare.View',
  FinanceLeakageView: 'Finance.Leakage.View',

  AdminCompanyInfoView: 'Admin.CompanyInfo.View',
  AdminUsersView: 'Admin.Users.View',
  AdminPermissionsView: 'Admin.Permissions.View',
  AdminJobRolesView: 'Admin.JobRoles.View',
  AuditLogsView: 'Audit.Logs.View',
  ObservabilityAdminView: 'Observability.Admin.View',

  LabTestsView: 'Lab.Tests.View',
  LabCategoriesView: 'Lab.Categories.View',
  LabSampleCollectionView: 'Lab.SampleCollection.View',
  LabResultsView: 'Lab.Results.View',
  LabOrdersView: 'Lab.Orders.View',
  LabReportsView: 'Lab.Reports.View',
  LabApprovalsView: 'Lab.Approvals.View',
  RadiologyWorklistView: 'Radiology.Worklist.View',
  RadiologyReportingView: 'Radiology.Reporting.View',

  PharmacyMedicinesView: 'Pharmacy.Medicines.View',
  PharmacyCategoriesView: 'Pharmacy.Categories.View',
  PharmacyStockView: 'Pharmacy.Stock.View',
  PharmacyIssueView: 'Pharmacy.Issue.View',
  PharmacyDispensingView: 'Pharmacy.Dispensing.View',
  PharmacyBatchesView: 'Pharmacy.Batches.View',
  PharmacySalesView: 'Pharmacy.Sales.View',
  PharmacyFreeMedicineView: 'Pharmacy.FreeMedicine.View',
  PharmacyPaymentModesView: 'Pharmacy.PaymentModes.View',
  PharmacyReportsView: 'Pharmacy.Reports.View',

  IpdAdmissionsView: 'IPD.Admissions.View',
  IpdBedBoardView: 'IPD.BedBoard.View',
  IpdNursingView: 'IPD.Nursing.View',
  IpdMarView: 'IPD.MAR.View',
  IpdDischargeView: 'IPD.Discharge.View',

  InventoryProcurementView: 'Inventory.Procurement.View',
  InventoryStockMovementsView: 'Inventory.StockMovements.View',
  InventoryReportsView: 'Inventory.Reports.View',

  AnalyticsExecutiveView: 'Analytics.Executive.View',
  AnalyticsClinicalView: 'Analytics.Clinical.View',
  AnalyticsFinanceView: 'Analytics.Finance.View',

  InteroperabilityOutboxView: 'Interoperability.Outbox.View',
  InteroperabilityFhirView: 'Interoperability.FHIR.View',
  InteroperabilityPartnersView: 'Interoperability.Partners.View',

  ReportsPatientView: 'Reports.Patient.View',
  ReportsFinanceView: 'Reports.Finance.View',
  ReportsLabView: 'Reports.Lab.View',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
export type PermissionInput = PermissionCode | (string & {})
export type PermissionRule = readonly PermissionInput[]

export const PERMISSION_BACKEND_SYNC_GROUPS: Record<string, PermissionCode[]> = {
  Pharmacy: [
    PERMISSIONS.PharmacyMedicinesView,
    PERMISSIONS.PharmacyCategoriesView,
    PERMISSIONS.PharmacyStockView,
    PERMISSIONS.PharmacyIssueView,
    PERMISSIONS.PharmacyDispensingView,
    PERMISSIONS.PharmacyBatchesView,
    PERMISSIONS.PharmacySalesView,
    PERMISSIONS.PharmacyFreeMedicineView,
    PERMISSIONS.PharmacyPaymentModesView,
    PERMISSIONS.PharmacyReportsView,
  ],
  IPD: [
    PERMISSIONS.IpdAdmissionsView,
    PERMISSIONS.IpdBedBoardView,
    PERMISSIONS.IpdNursingView,
    PERMISSIONS.IpdMarView,
    PERMISSIONS.IpdDischargeView,
  ],
  Inventory: [
    PERMISSIONS.InventoryProcurementView,
    PERMISSIONS.InventoryStockMovementsView,
    PERMISSIONS.InventoryReportsView,
  ],
  Analytics: [
    PERMISSIONS.AnalyticsExecutiveView,
    PERMISSIONS.AnalyticsClinicalView,
    PERMISSIONS.AnalyticsFinanceView,
  ],
  Interoperability: [
    PERMISSIONS.InteroperabilityOutboxView,
    PERMISSIONS.InteroperabilityFhirView,
    PERMISSIONS.InteroperabilityPartnersView,
  ],
  Radiology: [
    PERMISSIONS.RadiologyWorklistView,
    PERMISSIONS.RadiologyReportingView,
  ],
}

export const FRONTEND_PERMISSION_CODES = Object.values(PERMISSIONS)

const routePermissionByPath: Record<string, PermissionRule> = {
  '/dashboard': [PERMISSIONS.DashboardView],

  '/patients': [PERMISSIONS.PatientsView],
  '/patients/queue': [PERMISSIONS.PatientsView],
  '/patients/:id': [PERMISSIONS.PatientsView],
  '/checkups': [PERMISSIONS.OpdCheckupsView],
  '/opd/workflow': [PERMISSIONS.OpdCheckupsView],
  '/opd/prescriptions': [PERMISSIONS.OpdCheckupsView],
  '/opd/diagnosis': [PERMISSIONS.OpdCheckupsView],
  '/opd/vital-signs': [PERMISSIONS.OpdCheckupsView],
  '/opd/procedures': [PERMISSIONS.OpdCheckupsView],
  '/opd/follow-ups': [PERMISSIONS.OpdCheckupsView],
  '/appointments': [PERMISSIONS.AppointmentsView],
  '/appointments/calendar': [PERMISSIONS.AppointmentsView],

  '/hr/departments': [PERMISSIONS.HrDepartmentsView],
  '/hr/designations': [PERMISSIONS.HrDesignationsView],
  '/employees': [PERMISSIONS.HrWorkforceView],
  '/employees/:id': [PERMISSIONS.HrWorkforceView],
  '/hr/shifts': [PERMISSIONS.HrShiftsView],
  '/hr/leave-types': [PERMISSIONS.HrLeaveTypesView],
  '/hr/permissions': [PERMISSIONS.HrPermissionsView],
  '/hr/onboarding-checklist-items': [PERMISSIONS.HrOnboardingChecklistItemsView],
  '/hr/attendance-logs': [PERMISSIONS.HrAttendanceLogsView],
  '/hr/duty-rosters': [PERMISSIONS.HrDutyRostersView],
  '/hr/leave-balances': [PERMISSIONS.HrLeaveBalancesView],
  '/hr/leave-requests': [PERMISSIONS.HrLeaveRequestsView],
  '/hr/payrolls': [PERMISSIONS.HrPayrollsView],
  '/hr/credentials': [PERMISSIONS.HrCredentialsView],
  '/hr/training-enrollments': [PERMISSIONS.HrTrainingEnrollmentsView],
  '/hr/performance-appraisals': [PERMISSIONS.HrPerformanceAppraisalsView],
  '/hr/disciplinary-incidents': [PERMISSIONS.HrDisciplinaryIncidentsView],
  '/hr/employment-profile-tags': [PERMISSIONS.HrEmploymentProfileTagsView],

  '/payments': [PERMISSIONS.FinancePaymentsView],
  '/payments/new': [PERMISSIONS.FinancePaymentsView],
  '/payments/:id(\\d+)': [PERMISSIONS.FinancePaymentsView],
  '/payments/:id(\\d+)/print': [PERMISSIONS.FinancePaymentsView],
  '/payments/:id(\\d+)/thermal': [PERMISSIONS.FinancePaymentsView],
  '/finance/counter-closing': [PERMISSIONS.FinanceCounterClosingView],
  '/finance/chartofaccounts': [PERMISSIONS.FinanceCoaView],
  '/finance/expense-vouchers': [PERMISSIONS.FinanceExpenseVouchersView],
  '/finance/daily-closing': [PERMISSIONS.FinanceDailyClosingView],
  '/finance/revenue-vouchers': [PERMISSIONS.FinancePostingView],
  '/finance/refunds': [PERMISSIONS.FinanceRefundsView],
  '/finance/claims': [PERMISSIONS.FinanceClaimsView],
  '/finance/posting-dashboard': [PERMISSIONS.FinancePostingView],
  '/finance/doctor-share': [PERMISSIONS.FinanceDoctorShareView],
  '/finance/leakage-dashboard': [PERMISSIONS.FinanceLeakageView],
  '/admin/payment-categories': [PERMISSIONS.FinancePaymentCategoriesView],

  '/company-info': [PERMISSIONS.AdminCompanyInfoView],
  '/admin/users': [PERMISSIONS.AdminUsersView],
  '/admin/audit': [PERMISSIONS.AuditLogsView],
  '/admin/observability': [PERMISSIONS.ObservabilityAdminView],
  '/admin/permission-sync': [PERMISSIONS.AdminPermissionsView],

  '/pharmacy/dispensing': [PERMISSIONS.PharmacyDispensingView],
  '/pharmacy/batches': [PERMISSIONS.PharmacyBatchesView],
  '/pharmacy/unit-box-sales': [PERMISSIONS.PharmacySalesView],
  '/pharmacy/free-medicine': [PERMISSIONS.PharmacyFreeMedicineView],
  '/pharmacy/payment-modes': [PERMISSIONS.PharmacyPaymentModesView],
  '/pharmacy/reports': [PERMISSIONS.PharmacyReportsView],

  '/diagnostics/orders': [PERMISSIONS.LabOrdersView],
  '/diagnostics/sample-collection': [PERMISSIONS.LabSampleCollectionView],
  '/diagnostics/results': [PERMISSIONS.LabResultsView],
  '/diagnostics/reports': [PERMISSIONS.LabReportsView],
  '/diagnostics/approvals': [PERMISSIONS.LabApprovalsView],
  '/radiology/worklist': [PERMISSIONS.RadiologyWorklistView],
  '/radiology/reporting': [PERMISSIONS.RadiologyReportingView],

  '/ipd/admissions': [PERMISSIONS.IpdAdmissionsView],
  '/ipd/bed-board': [PERMISSIONS.IpdBedBoardView],
  '/ipd/nursing': [PERMISSIONS.IpdNursingView],
  '/ipd/mar': [PERMISSIONS.IpdMarView],
  '/ipd/discharge': [PERMISSIONS.IpdDischargeView],
  '/emergency/triage': [PERMISSIONS.IpdAdmissionsView],
  '/emergency/encounters': [PERMISSIONS.IpdAdmissionsView],
  '/emergency/observation-beds': [PERMISSIONS.IpdBedBoardView],
  '/ot/procedures': [PERMISSIONS.IpdNursingView],
  '/icu/workflows': [PERMISSIONS.IpdNursingView],

  '/inventory/procurement': [PERMISSIONS.InventoryProcurementView],
  '/inventory/suppliers': [PERMISSIONS.InventoryProcurementView],
  '/inventory/requisitions': [PERMISSIONS.InventoryProcurementView],
  '/inventory/purchase-orders': [PERMISSIONS.InventoryProcurementView],
  '/inventory/receiving': [PERMISSIONS.InventoryProcurementView],
  '/inventory/stock-lots': [PERMISSIONS.InventoryStockMovementsView],
  '/inventory/expiry': [PERMISSIONS.InventoryStockMovementsView],
  '/inventory/adjustments': [PERMISSIONS.InventoryStockMovementsView],
  '/inventory/stock-movements': [PERMISSIONS.InventoryStockMovementsView],
  '/inventory/reports': [PERMISSIONS.InventoryReportsView],

  '/analytics/executive': [PERMISSIONS.AnalyticsExecutiveView],
  '/analytics/clinical': [PERMISSIONS.AnalyticsClinicalView],
  '/analytics/finance': [PERMISSIONS.AnalyticsFinanceView],
  '/analytics/exports': [PERMISSIONS.AnalyticsFinanceView],

  '/patient-engagement/portal-accounts': [PERMISSIONS.PatientsView],
  '/patient-engagement/prescription-access': [PERMISSIONS.PatientsView],
  '/patient-engagement/notifications': [PERMISSIONS.PatientsView],
  '/patient-engagement/consents': [PERMISSIONS.PatientsView],
  '/patient-engagement/messages': [PERMISSIONS.PatientsView],

  '/interoperability/outbox': [PERMISSIONS.InteroperabilityOutboxView],
  '/interoperability/hl7-fhir': [PERMISSIONS.InteroperabilityFhirView],
  '/interoperability/partners': [PERMISSIONS.InteroperabilityPartnersView],
  '/interoperability/exchange': [PERMISSIONS.InteroperabilityFhirView],
  '/interoperability/webhooks': [PERMISSIONS.InteroperabilityFhirView],
  '/interoperability/pacs-dicom': [PERMISSIONS.InteroperabilityFhirView],
}

const firstAllowedRoutePriority: Array<{ permission: PermissionInput; path: string }> = [
  { permission: PERMISSIONS.DashboardView, path: '/dashboard' },
  { permission: PERMISSIONS.PatientsView, path: '/patients' },
  { permission: PERMISSIONS.OpdCheckupsView, path: '/checkups' },
  { permission: PERMISSIONS.AppointmentsView, path: '/appointments' },
  { permission: PERMISSIONS.HrDepartmentsView, path: '/hr/departments' },
  { permission: PERMISSIONS.HrDesignationsView, path: '/hr/designations' },
  { permission: PERMISSIONS.HrWorkforceView, path: '/employees' },
  { permission: PERMISSIONS.FinancePaymentsView, path: '/payments' },
  { permission: PERMISSIONS.FinanceCounterClosingView, path: '/finance/counter-closing' },
  { permission: PERMISSIONS.FinanceCoaView, path: '/finance/chartofaccounts' },
  { permission: PERMISSIONS.FinanceExpenseVouchersView, path: '/finance/expense-vouchers' },
  { permission: PERMISSIONS.FinanceDailyClosingView, path: '/finance/daily-closing' },
  { permission: PERMISSIONS.AdminCompanyInfoView, path: '/company-info' },
  { permission: PERMISSIONS.AdminUsersView, path: '/admin/users' },
  { permission: PERMISSIONS.AuditLogsView, path: '/admin/audit' },
  { permission: PERMISSIONS.ObservabilityAdminView, path: '/admin/observability' },
  { permission: PERMISSIONS.FinancePaymentCategoriesView, path: '/admin/payment-categories' },
  { permission: PERMISSIONS.PharmacyDispensingView, path: '/pharmacy/dispensing' },
  { permission: PERMISSIONS.LabOrdersView, path: '/diagnostics/orders' },
  { permission: PERMISSIONS.IpdAdmissionsView, path: '/ipd/admissions' },
  { permission: PERMISSIONS.InventoryProcurementView, path: '/inventory/procurement' },
  { permission: PERMISSIONS.AnalyticsExecutiveView, path: '/analytics/executive' },
  { permission: PERMISSIONS.InteroperabilityOutboxView, path: '/interoperability/outbox' },
]

const menuPermissionRules: Record<string, PermissionRule> = {
  dashboard: [PERMISSIONS.DashboardView],

  patients: [
    PERMISSIONS.PatientsView,
    PERMISSIONS.OpdCheckupsView,
    PERMISSIONS.AppointmentsView,
    PERMISSIONS.FinancePaymentsView,
    PERMISSIONS.FinanceCounterClosingView,
  ],
  'patients.list': [PERMISSIONS.PatientsView],
  'patients.queue': [PERMISSIONS.PatientsView],
  'patients.checkups': [PERMISSIONS.OpdCheckupsView],
  'patients.appointments': [PERMISSIONS.AppointmentsView],
  'patients.payments': [PERMISSIONS.FinancePaymentsView],
  'patients.counterClosing': [PERMISSIONS.FinanceCounterClosingView],

  opd: [PERMISSIONS.OpdCheckupsView],
  'opd.workflow': [PERMISSIONS.OpdCheckupsView],
  'opd.prescriptions': [PERMISSIONS.OpdCheckupsView],
  'opd.diagnosis': [PERMISSIONS.OpdCheckupsView],
  'opd.vitals': [PERMISSIONS.OpdCheckupsView],
  'opd.procedures': [PERMISSIONS.OpdCheckupsView],
  'opd.followups': [PERMISSIONS.OpdCheckupsView],

  hr: [
    PERMISSIONS.HrDepartmentsView,
    PERMISSIONS.HrDesignationsView,
    PERMISSIONS.HrWorkforceView,
    PERMISSIONS.HrShiftsView,
    PERMISSIONS.HrLeaveTypesView,
    PERMISSIONS.HrPermissionsView,
    PERMISSIONS.HrOnboardingChecklistItemsView,
    PERMISSIONS.HrAttendanceLogsView,
    PERMISSIONS.HrDutyRostersView,
    PERMISSIONS.HrLeaveBalancesView,
    PERMISSIONS.HrLeaveRequestsView,
    PERMISSIONS.HrPayrollsView,
    PERMISSIONS.HrCredentialsView,
    PERMISSIONS.HrTrainingEnrollmentsView,
    PERMISSIONS.HrPerformanceAppraisalsView,
    PERMISSIONS.HrDisciplinaryIncidentsView,
    PERMISSIONS.HrEmploymentProfileTagsView,
  ],
  'hr.departments': [PERMISSIONS.HrDepartmentsView],
  'hr.designations': [PERMISSIONS.HrDesignationsView],
  'hr.workforce': [PERMISSIONS.HrWorkforceView],
  'hr.shifts': [PERMISSIONS.HrShiftsView],
  'hr.leaveTypes': [PERMISSIONS.HrLeaveTypesView],
  'hr.permissions': [PERMISSIONS.HrPermissionsView],
  'hr.onboardingChecklistItems': [PERMISSIONS.HrOnboardingChecklistItemsView],
  'hr.attendanceLogs': [PERMISSIONS.HrAttendanceLogsView],
  'hr.dutyRosters': [PERMISSIONS.HrDutyRostersView],
  'hr.leaveBalances': [PERMISSIONS.HrLeaveBalancesView],
  'hr.leaveRequests': [PERMISSIONS.HrLeaveRequestsView],
  'hr.payrolls': [PERMISSIONS.HrPayrollsView],
  'hr.credentials': [PERMISSIONS.HrCredentialsView],
  'hr.trainingEnrollments': [PERMISSIONS.HrTrainingEnrollmentsView],
  'hr.performanceAppraisals': [PERMISSIONS.HrPerformanceAppraisalsView],
  'hr.disciplinaryIncidents': [PERMISSIONS.HrDisciplinaryIncidentsView],
  'hr.employmentProfileTags': [PERMISSIONS.HrEmploymentProfileTagsView],

  finance: [
    PERMISSIONS.FinancePaymentsView,
    PERMISSIONS.FinanceCounterClosingView,
    PERMISSIONS.FinanceCoaView,
    PERMISSIONS.FinanceExpenseVouchersView,
    PERMISSIONS.FinanceDailyClosingView,
    PERMISSIONS.FinancePaymentCategoriesView,
    PERMISSIONS.FinanceRefundsView,
    PERMISSIONS.FinanceClaimsView,
    PERMISSIONS.FinancePostingView,
    PERMISSIONS.FinanceDoctorShareView,
    PERMISSIONS.FinanceLeakageView,
  ],
  'finance.receipts': [PERMISSIONS.FinancePaymentsView],
  'finance.refunds': [PERMISSIONS.FinanceRefundsView],
  'finance.claims': [PERMISSIONS.FinanceClaimsView],
  'finance.posting': [PERMISSIONS.FinancePostingView],
  'finance.doctorShare': [PERMISSIONS.FinanceDoctorShareView],
  'finance.leakage': [PERMISSIONS.FinanceLeakageView],
  'finance.coa': [PERMISSIONS.FinanceCoaView],
  'finance.expenseVouchers': [PERMISSIONS.FinanceExpenseVouchersView],
  'finance.dailyClosing': [PERMISSIONS.FinanceDailyClosingView],

  lab: [
    PERMISSIONS.LabTestsView,
    PERMISSIONS.LabCategoriesView,
    PERMISSIONS.LabSampleCollectionView,
    PERMISSIONS.LabResultsView,
    PERMISSIONS.LabOrdersView,
    PERMISSIONS.LabReportsView,
    PERMISSIONS.LabApprovalsView,
    PERMISSIONS.RadiologyWorklistView,
    PERMISSIONS.RadiologyReportingView,
  ],
  'lab.orders': [PERMISSIONS.LabOrdersView],
  'lab.tests': [PERMISSIONS.LabTestsView],
  'lab.categories': [PERMISSIONS.LabCategoriesView],
  'lab.sample': [PERMISSIONS.LabSampleCollectionView],
  'lab.results': [PERMISSIONS.LabResultsView],
  'lab.reports': [PERMISSIONS.LabReportsView],
  'lab.approvals': [PERMISSIONS.LabApprovalsView],
  'radiology.worklist': [PERMISSIONS.RadiologyWorklistView],
  'radiology.reporting': [PERMISSIONS.RadiologyReportingView],

  pharmacy: [
    PERMISSIONS.PharmacyMedicinesView,
    PERMISSIONS.PharmacyCategoriesView,
    PERMISSIONS.PharmacyStockView,
    PERMISSIONS.PharmacyIssueView,
    PERMISSIONS.PharmacyDispensingView,
    PERMISSIONS.PharmacyBatchesView,
    PERMISSIONS.PharmacySalesView,
    PERMISSIONS.PharmacyFreeMedicineView,
    PERMISSIONS.PharmacyPaymentModesView,
    PERMISSIONS.PharmacyReportsView,
  ],
  'pharmacy.dispensing': [PERMISSIONS.PharmacyDispensingView],
  'pharmacy.batches': [PERMISSIONS.PharmacyBatchesView],
  'pharmacy.sales': [PERMISSIONS.PharmacySalesView],
  'pharmacy.freeMedicine': [PERMISSIONS.PharmacyFreeMedicineView],
  'pharmacy.paymentModes': [PERMISSIONS.PharmacyPaymentModesView],
  'pharmacy.reports': [PERMISSIONS.PharmacyReportsView],
  'pharmacy.medicines': [PERMISSIONS.PharmacyMedicinesView],
  'pharmacy.categories': [PERMISSIONS.PharmacyCategoriesView],
  'pharmacy.stock': [PERMISSIONS.PharmacyStockView],
  'pharmacy.issue': [PERMISSIONS.PharmacyIssueView],

  ipd: [
    PERMISSIONS.IpdAdmissionsView,
    PERMISSIONS.IpdBedBoardView,
    PERMISSIONS.IpdNursingView,
    PERMISSIONS.IpdMarView,
    PERMISSIONS.IpdDischargeView,
  ],
  'ipd.admissions': [PERMISSIONS.IpdAdmissionsView],
  'ipd.bedBoard': [PERMISSIONS.IpdBedBoardView],
  'ipd.nursing': [PERMISSIONS.IpdNursingView],
  'ipd.mar': [PERMISSIONS.IpdMarView],
  'ipd.discharge': [PERMISSIONS.IpdDischargeView],

  inventory: [
    PERMISSIONS.InventoryProcurementView,
    PERMISSIONS.InventoryStockMovementsView,
    PERMISSIONS.InventoryReportsView,
  ],
  'inventory.procurement': [PERMISSIONS.InventoryProcurementView],
  'inventory.stockMovements': [PERMISSIONS.InventoryStockMovementsView],
  'inventory.reports': [PERMISSIONS.InventoryReportsView],

  analytics: [
    PERMISSIONS.AnalyticsExecutiveView,
    PERMISSIONS.AnalyticsClinicalView,
    PERMISSIONS.AnalyticsFinanceView,
  ],
  'analytics.executive': [PERMISSIONS.AnalyticsExecutiveView],
  'analytics.clinical': [PERMISSIONS.AnalyticsClinicalView],
  'analytics.finance': [PERMISSIONS.AnalyticsFinanceView],

  patientEngagement: [PERMISSIONS.PatientsView],
  'patientEngagement.portal': [PERMISSIONS.PatientsView],
  'patientEngagement.prescriptions': [PERMISSIONS.PatientsView],
  'patientEngagement.notifications': [PERMISSIONS.PatientsView],
  'patientEngagement.consents': [PERMISSIONS.PatientsView],
  'patientEngagement.messages': [PERMISSIONS.PatientsView],

  interoperability: [
    PERMISSIONS.InteroperabilityOutboxView,
    PERMISSIONS.InteroperabilityFhirView,
    PERMISSIONS.InteroperabilityPartnersView,
  ],
  'interoperability.outbox': [PERMISSIONS.InteroperabilityOutboxView],
  'interoperability.fhir': [PERMISSIONS.InteroperabilityFhirView],
  'interoperability.partners': [PERMISSIONS.InteroperabilityPartnersView],

  reports: [
    PERMISSIONS.ReportsPatientView,
    PERMISSIONS.ReportsFinanceView,
    PERMISSIONS.ReportsLabView,
  ],
  'reports.patient': [PERMISSIONS.ReportsPatientView],
  'reports.finance': [PERMISSIONS.ReportsFinanceView],
  'reports.lab': [PERMISSIONS.ReportsLabView],

  admin: [
    PERMISSIONS.AdminCompanyInfoView,
    PERMISSIONS.AdminUsersView,
    PERMISSIONS.AdminPermissionsView,
    PERMISSIONS.AdminJobRolesView,
    PERMISSIONS.FinancePaymentCategoriesView,
    PERMISSIONS.AuditLogsView,
    PERMISSIONS.ObservabilityAdminView,
  ],
  'admin.company': [PERMISSIONS.AdminCompanyInfoView],
  'admin.paymentCategories': [PERMISSIONS.FinancePaymentCategoriesView],
  'admin.users': [PERMISSIONS.AdminUsersView],
  'admin.roles': [PERMISSIONS.AdminPermissionsView, PERMISSIONS.AdminJobRolesView],
  'admin.permissionSync': [PERMISSIONS.AdminPermissionsView],
  'admin.audit': [PERMISSIONS.AuditLogsView],
  'admin.observability': [PERMISSIONS.ObservabilityAdminView],
}

export const hasPermission = (permissions: readonly string[], permission: PermissionInput): boolean =>
  permissions.includes(permission)

export const hasAnyPermission = (
  permissions: readonly string[],
  required: PermissionRule = [],
): boolean => required.length === 0 || required.some((permission) => hasPermission(permissions, permission))

export const hasAllPermissions = (
  permissions: readonly string[],
  required: PermissionRule = [],
): boolean => required.every((permission) => hasPermission(permissions, permission))

export const canSeeMenuItem = (key: string, permissions: readonly string[]): boolean => {
  const required = menuPermissionRules[key]
  return required ? hasAnyPermission(permissions, required) : false
}

export const getFirstAllowedRoute = (permissions: readonly string[]): string => {
  const match = firstAllowedRoutePriority.find((route) =>
    hasPermission(permissions, route.permission),
  )
  return match?.path ?? '/forbidden'
}

export const applyRoutePermissionMeta = <T extends RouteRecordRaw[]>(routes: T): T => {
  for (const route of routes) {
    const permissions = routePermissionByPath[route.path]

    if (permissions?.length) {
      route.meta = {
        ...(route.meta ?? {}),
        requiresAuth: true,
        permissions: [...permissions],
      }
    }

    if (route.children) {
      applyRoutePermissionMeta(route.children)
    }
  }

  return routes
}

export const getRequiredRoutePermissions = (to: RouteLocationNormalized): string[] =>
  to.matched.flatMap((route) => route.meta.permissions ?? [])

export const canAccessRoute = (
  to: RouteLocationNormalized,
  permissions: readonly string[],
): boolean => hasAllPermissions(permissions, getRequiredRoutePermissions(to))
