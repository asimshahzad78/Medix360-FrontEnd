<template>
  <aside class="sidebar" :class="{ open: open }">
    <div class="brand-row">
      <div class="brand">HMIS</div>

      <button class="close" type="button" @click="emit('close')" aria-label="Close menu">
        ×
      </button>
    </div>

    <nav>
      <!-- DASHBOARD -->
      <div class="menu-group" v-if="canSee('dashboard')">
        <RouterLink to="/dashboard" class="menu-title single-link" @click="onNavigate">
          Dashboard
        </RouterLink>
      </div>

      <!-- PATIENT MANAGEMENT -->
      <div class="menu-group" v-if="canSee('patients')">
        <div class="menu-title" @click="toggle('patients')">
          Patient Management
          <span>{{ menuOpen.patients ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.patients" class="submenu">
          <RouterLink v-if="canSee('patients.list')" to="/patients" @click="onNavigate">
            Patient List
          </RouterLink>
          <RouterLink v-if="canSee('patients.queue')" to="/patients/queue" @click="onNavigate">
            Registration Queue
          </RouterLink>
          <RouterLink v-if="canSee('patients.checkups')" to="/checkups" @click="onNavigate">
            Checkups / Visits
          </RouterLink>
          <RouterLink v-if="canSee('patients.appointments')" to="/appointments" @click="onNavigate">
            Appointments
          </RouterLink>

          <RouterLink v-if="canSee('patients.payments')" to="/payments" @click="onNavigate">
            Payment
          </RouterLink>

          <RouterLink v-if="canSee('patients.counterClosing')" to="/finance/counter-closing" @click="onNavigate">
            Counter Closing
          </RouterLink>

          <div class="submenu-divider" v-if="canSee('opd')">Visits / OPD</div>

          <RouterLink v-if="canSee('opd.workflow')" to="/opd/workflow" @click="onNavigate">
            OPD Workflow
          </RouterLink>

          <RouterLink v-if="canSee('opd.prescriptions')" to="/opd/workflow" @click="onNavigate">
            Prescriptions
          </RouterLink>
          <RouterLink v-if="canSee('opd.diagnosis')" to="/opd/workflow" @click="onNavigate">
            Diagnosis
          </RouterLink>
          <RouterLink v-if="canSee('opd.vitals')" to="/opd/workflow" @click="onNavigate">
            Vital Signs
          </RouterLink>
          <RouterLink v-if="canSee('opd.procedures')" to="/opd/workflow" @click="onNavigate">
            Procedures
          </RouterLink>
          <RouterLink v-if="canSee('opd.followups')" to="/opd/workflow" @click="onNavigate">
            Follow-ups
          </RouterLink>
        </div>
      </div>

      <!-- HUMAN RESOURCE -->
      <!-- HUMAN RESOURCE -->
      <div class="menu-group" v-if="canSee('hr')">
        <div class="menu-title" @click="toggle('hr')">
          Human Resource
          <span>{{ menuOpen.hr ? '▾' : '▸' }}</span>
        </div>

        <div v-if="menuOpen.hr" class="submenu">
          <div class="submenu-divider">Masters</div>

          <RouterLink v-if="canSee('hr.departments')" to="/hr/departments" @click="onNavigate">
            Departments
          </RouterLink>

          <RouterLink v-if="canSee('hr.designations')" to="/hr/designations" @click="onNavigate">
            Designations
          </RouterLink>

          <RouterLink v-if="canSee('hr.shifts')" to="/hr/shifts" @click="onNavigate">
            Shifts
          </RouterLink>

          <RouterLink v-if="canSee('hr.leaveTypes')" to="/hr/leave-types" @click="onNavigate">
            Leave Types
          </RouterLink>

          <RouterLink v-if="canSee('hr.permissions')" to="/hr/permissions" @click="onNavigate">
            Permissions
          </RouterLink>

          <RouterLink v-if="canSee('hr.onboardingChecklistItems')" to="/hr/onboarding-checklist-items"
            @click="onNavigate">
            Onboarding Checklist
          </RouterLink>

          <div class="submenu-divider">Operations</div>

          <RouterLink v-if="canSee('hr.workforce')" to="/employees" @click="onNavigate">
            Workforce
          </RouterLink>

          <RouterLink v-if="canSee('hr.attendanceLogs')" to="/hr/attendance-logs" @click="onNavigate">
            Attendance Logs
          </RouterLink>

          <RouterLink v-if="canSee('hr.dutyRosters')" to="/hr/duty-rosters" @click="onNavigate">
            Duty Rosters
          </RouterLink>

          <RouterLink v-if="canSee('hr.leaveBalances')" to="/hr/leave-balances" @click="onNavigate">
            Leave Balances
          </RouterLink>

          <RouterLink v-if="canSee('hr.leaveRequests')" to="/hr/leave-requests" @click="onNavigate">
            Leave Requests
          </RouterLink>

          <RouterLink v-if="canSee('hr.payrolls')" to="/hr/payrolls" @click="onNavigate">
            Payrolls
          </RouterLink>

          <div class="submenu-divider">Compliance</div>

          <RouterLink v-if="canSee('hr.credentials')" to="/hr/credentials" @click="onNavigate">
            Credentials
          </RouterLink>

          <RouterLink v-if="canSee('hr.trainingEnrollments')" to="/hr/training-enrollments" @click="onNavigate">
            Training Enrollments
          </RouterLink>

          <RouterLink v-if="canSee('hr.performanceAppraisals')" to="/hr/performance-appraisals" @click="onNavigate">
            Performance Appraisals
          </RouterLink>

          <RouterLink v-if="canSee('hr.disciplinaryIncidents')" to="/hr/disciplinary-incidents" @click="onNavigate">
            Disciplinary Incidents
          </RouterLink>

          <RouterLink v-if="canSee('hr.employmentProfileTags')" to="/hr/employment-profile-tags" @click="onNavigate">
            Employment Profile Tags
          </RouterLink>
        </div>
      </div>

      <!-- BILLING & FINANCE -->
      <div class="menu-group" v-if="canSee('finance')">
        <div class="menu-title" @click="toggle('billing')">
          Billing & Finance
          <span>{{ menuOpen.billing ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.billing" class="submenu">
          <RouterLink v-if="canSee('finance.receipts')" to="/payments" @click="onNavigate">
            Receipts
          </RouterLink>
          <RouterLink v-if="canSee('finance.refunds')" to="/finance/refunds" @click="onNavigate">
            Refunds
          </RouterLink>
          <RouterLink v-if="canSee('finance.claims')" to="/finance/claims" @click="onNavigate">
            Insurance Claims
          </RouterLink>
          <RouterLink v-if="canSee('finance.posting')" to="/finance/posting-dashboard" @click="onNavigate">
            Posting Dashboard
          </RouterLink>
          <RouterLink v-if="canSee('finance.doctorShare')" to="/finance/doctor-share" @click="onNavigate">
            Doctor Share
          </RouterLink>
          <RouterLink v-if="canSee('finance.leakage')" to="/finance/leakage-dashboard" @click="onNavigate">
            Leakage Dashboard
          </RouterLink>
          <RouterLink v-if="canSee('finance.coa')" to="/finance/chartofaccounts" @click="onNavigate">
            Chart Of Account
          </RouterLink>
          <RouterLink v-if="canSee('finance.posting')" to="/finance/revenue-vouchers" @click="onNavigate">
            Revenue Vouchers
          </RouterLink>
          <RouterLink v-if="canSee('finance.expenseVouchers')" to="/finance/expense-vouchers" @click="onNavigate">
            Expense Voucher
          </RouterLink>
          <RouterLink v-if="canSee('finance.dailyClosing')" to="/finance/daily-closing" @click="onNavigate">
            Daily Closing
          </RouterLink>
        </div>
      </div>

      <!-- LAB -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('lab')">
        <div class="menu-title" @click="toggle('lab')">
          Laboratory
          <span>{{ menuOpen.lab ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.lab" class="submenu">
          <RouterLink v-if="canSee('lab.orders')" to="/diagnostics/orders" @click="onNavigate">
            Diagnostic Orders
          </RouterLink>
          <RouterLink v-if="canSee('lab.tests')" to="/diagnostics/orders" @click="onNavigate">
            Lab Tests
          </RouterLink>
          <RouterLink v-if="canSee('lab.categories')" to="/diagnostics/orders" @click="onNavigate">
            Categories
          </RouterLink>
          <RouterLink v-if="canSee('lab.sample')" to="/diagnostics/sample-collection" @click="onNavigate">
            Sample Collection
          </RouterLink>
          <RouterLink v-if="canSee('lab.results')" to="/diagnostics/results" @click="onNavigate">
            Result Entry
          </RouterLink>
          <RouterLink v-if="canSee('lab.reports')" to="/diagnostics/reports" @click="onNavigate">
            Reports
          </RouterLink>
          <RouterLink v-if="canSee('lab.approvals')" to="/diagnostics/approvals" @click="onNavigate">
            Approvals
          </RouterLink>
          <RouterLink v-if="canSee('radiology.worklist')" to="/radiology/worklist" @click="onNavigate">
            Radiology Worklist
          </RouterLink>
          <RouterLink v-if="canSee('radiology.reporting')" to="/radiology/reporting" @click="onNavigate">
            Radiology Reporting
          </RouterLink>
        </div>
      </div>

      <!-- PHARMACY -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('pharmacy')">
        <div class="menu-title" @click="toggle('pharmacy')">
          Pharmacy
          <span>{{ menuOpen.pharmacy ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.pharmacy" class="submenu">
          <RouterLink v-if="canSee('pharmacy.dispensing')" to="/pharmacy/dispensing" @click="onNavigate">
            Dispensing
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.batches')" to="/pharmacy/batches" @click="onNavigate">
            Batch & Expiry
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.sales')" to="/pharmacy/unit-box-sales" @click="onNavigate">
            Unit / Box Sales
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.freeMedicine')" to="/pharmacy/free-medicine" @click="onNavigate">
            Free Medicine
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.paymentModes')" to="/pharmacy/payment-modes" @click="onNavigate">
            Payment Modes
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.reports')" to="/pharmacy/reports" @click="onNavigate">
            Reports
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.medicines')" to="/pharmacy/dispensing" @click="onNavigate">
            Medicines
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.categories')" to="/pharmacy/dispensing" @click="onNavigate">
            Categories
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.stock')" to="/pharmacy/batches" @click="onNavigate">
            Stock
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.issue')" to="/pharmacy/dispensing" @click="onNavigate">
            Medicine Issue
          </RouterLink>
        </div>
      </div>

      <!-- IPD -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('ipd')">
        <div class="menu-title" @click="toggle('ipd')">
          IPD / Inpatient
          <span>{{ menuOpen.ipd ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.ipd" class="submenu">
          <RouterLink v-if="canSee('ipd.admissions')" to="/ipd/admissions" @click="onNavigate">Admissions</RouterLink>
          <RouterLink v-if="canSee('ipd.bedBoard')" to="/ipd/bed-board" @click="onNavigate">Bed Board</RouterLink>
          <RouterLink v-if="canSee('ipd.nursing')" to="/ipd/nursing" @click="onNavigate">Nursing</RouterLink>
          <RouterLink v-if="canSee('ipd.mar')" to="/ipd/mar" @click="onNavigate">MAR</RouterLink>
          <RouterLink v-if="canSee('ipd.discharge')" to="/ipd/discharge" @click="onNavigate">Discharge</RouterLink>
          <div class="submenu-divider">Emergency / OT / ICU</div>
          <RouterLink v-if="canSee('ipd.admissions')" to="/emergency/triage" @click="onNavigate">Emergency Triage</RouterLink>
          <RouterLink v-if="canSee('ipd.admissions')" to="/emergency/encounters" @click="onNavigate">Emergency Encounters</RouterLink>
          <RouterLink v-if="canSee('ipd.bedBoard')" to="/emergency/observation-beds" @click="onNavigate">Observation Beds</RouterLink>
          <RouterLink v-if="canSee('ipd.nursing')" to="/ot/procedures" @click="onNavigate">OT Procedures</RouterLink>
          <RouterLink v-if="canSee('ipd.nursing')" to="/icu/workflows" @click="onNavigate">ICU Workflows</RouterLink>
        </div>
      </div>

      <!-- INVENTORY -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('inventory')">
        <div class="menu-title" @click="toggle('inventory')">
          Inventory
          <span>{{ menuOpen.inventory ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.inventory" class="submenu">
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/procurement" @click="onNavigate">Procurement</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/suppliers" @click="onNavigate">Suppliers</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/requisitions" @click="onNavigate">Requisitions</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/purchase-orders" @click="onNavigate">Purchase Orders</RouterLink>
          <RouterLink v-if="canSee('inventory.procurement')" to="/inventory/receiving" @click="onNavigate">Receiving</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/stock-lots" @click="onNavigate">Stock Lots</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/expiry" @click="onNavigate">Expiry</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/adjustments" @click="onNavigate">Adjustments</RouterLink>
          <RouterLink v-if="canSee('inventory.stockMovements')" to="/inventory/stock-movements" @click="onNavigate">Stock Movements</RouterLink>
          <RouterLink v-if="canSee('inventory.reports')" to="/inventory/reports" @click="onNavigate">Inventory Reports</RouterLink>
        </div>
      </div>

      <!-- ANALYTICS -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('analytics')">
        <div class="menu-title" @click="toggle('analytics')">
          Analytics
          <span>{{ menuOpen.analytics ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.analytics" class="submenu">
          <RouterLink v-if="canSee('analytics.executive')" to="/analytics/executive" @click="onNavigate">Executive</RouterLink>
          <RouterLink v-if="canSee('analytics.clinical')" to="/analytics/clinical" @click="onNavigate">Clinical</RouterLink>
          <RouterLink v-if="canSee('analytics.finance')" to="/analytics/finance" @click="onNavigate">Finance</RouterLink>
          <RouterLink v-if="canSee('analytics.finance')" to="/analytics/exports" @click="onNavigate">Exports</RouterLink>
        </div>
      </div>

      <!-- PATIENT ENGAGEMENT -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('patientEngagement')">
        <div class="menu-title" @click="toggle('patientEngagement')">
          Patient Engagement
          <span>{{ menuOpen.patientEngagement ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.patientEngagement" class="submenu">
          <RouterLink v-if="canSee('patientEngagement.portal')" to="/patient-engagement/portal-accounts" @click="onNavigate">Portal Accounts</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.prescriptions')" to="/patient-engagement/prescription-access" @click="onNavigate">Prescription Access</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.notifications')" to="/patient-engagement/notifications" @click="onNavigate">Notifications</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.consents')" to="/patient-engagement/consents" @click="onNavigate">Consents</RouterLink>
          <RouterLink v-if="canSee('patientEngagement.messages')" to="/patient-engagement/messages" @click="onNavigate">Messages</RouterLink>
        </div>
      </div>

      <!-- INTEROPERABILITY -->
      <div class="menu-group" v-if="showAdvancedDemoModules && canSee('interoperability')">
        <div class="menu-title" @click="toggle('interoperability')">
          Interoperability
          <span>{{ menuOpen.interoperability ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.interoperability" class="submenu">
          <RouterLink v-if="canSee('interoperability.outbox')" to="/interoperability/outbox" @click="onNavigate">Outbox & Retries</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/hl7-fhir" @click="onNavigate">HL7 / FHIR</RouterLink>
          <RouterLink v-if="canSee('interoperability.partners')" to="/interoperability/partners" @click="onNavigate">Partners</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/exchange" @click="onNavigate">External Exchange</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/webhooks" @click="onNavigate">Webhooks</RouterLink>
          <RouterLink v-if="canSee('interoperability.fhir')" to="/interoperability/pacs-dicom" @click="onNavigate">PACS / DICOM</RouterLink>
        </div>
      </div>

      <!-- REPORTS -->
      <div class="menu-group" v-if="canSee('reports')">
        <div class="menu-title" @click="toggle('reports')">
          Reports
          <span>{{ menuOpen.reports ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.reports" class="submenu">
          <RouterLink v-if="canSee('reports.patient')" to="/dashboard" @click="onNavigate">
            Patient Reports
          </RouterLink>
          <RouterLink v-if="canSee('reports.finance')" to="/dashboard" @click="onNavigate">
            Financial Reports
          </RouterLink>
          <RouterLink v-if="canSee('reports.lab')" to="/dashboard" @click="onNavigate">
            Lab Reports
          </RouterLink>
        </div>
      </div>

      <!-- ADMIN -->
      <div class="menu-group" v-if="canSee('admin')">
        <div class="menu-title" @click="toggle('admin')">
          Administration
          <span>{{ menuOpen.admin ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.admin" class="submenu">
          <RouterLink v-if="canSee('admin.company')" to="/company-info" @click="onNavigate">
            Company Info
          </RouterLink>

          <RouterLink v-if="canSee('admin.paymentCategories')" to="/admin/payment-categories" @click="onNavigate">
            Payment Categories
          </RouterLink>

          <RouterLink v-if="canSee('admin.users')" to="/admin/users" @click="onNavigate">
            Users
          </RouterLink>

          <RouterLink v-if="canSee('admin.audit')" to="/admin/audit" @click="onNavigate">
            Audit Viewer
          </RouterLink>

          <RouterLink v-if="canSee('admin.permissionSync')" to="/admin/permission-sync" @click="onNavigate">
            Permission Sync
          </RouterLink>

          <RouterLink v-if="canSee('admin.observability')" to="/admin/observability" @click="onNavigate">
            Observability
          </RouterLink>

          <RouterLink v-if="canSee('admin.roles')" to="/dashboard" @click="onNavigate">
            Roles & Permissions
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { canSeeMenuItem } from '@/security/permissions'

/**
 * `open` prop controls drawer visibility on mobile/tablet
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const auth = useAuthStore()
const route = useRoute()
const showAdvancedDemoModules = import.meta.env.VITE_SHOW_ADVANCED_DEMO_MODULES === 'true'

/**
 * Rename accordion state to avoid collision with prop `open`
 */
const menuOpen = reactive({
  patients: false,
  hr: false,
  lab: false,
  pharmacy: false,
  ipd: false,
  inventory: false,
  analytics: false,
  patientEngagement: false,
  interoperability: false,
  billing: false,
  reports: false,
  admin: false,
})

function toggle(key: keyof typeof menuOpen) {
  Object.keys(menuOpen).forEach((k) => {
    menuOpen[k as keyof typeof menuOpen] = false
  })
  menuOpen[key] = true
}

function onNavigate() {
  emit('close')
}

const canSee = (key: string): boolean => canSeeMenuItem(key, auth.permissions)

/**
 * Auto-close drawer when route changes (mobile UX)
 */
watch(
  () => route.fullPath,
  () => {
    if (props.open) emit('close')
  }
)
</script>

<style scoped>
.sidebar {
  width: 270px;
  background: #4caf50;
  color: white;
  padding: 18px 14px;
  overflow-y: auto;
}

/* brand row */
.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.brand {
  font-size: 22px;
  font-weight: 700;
}

/* close button (mobile only) */
.close {
  display: none;
  border: none;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
}

/* Drawer behavior on mobile/tablet */
@media (max-width: 1023px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

/* menu styles */
.menu-title {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 10px;
}

.menu-title:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submenu {
  padding-left: 10px;
  margin-bottom: 6px;
}

.submenu a {
  display: block;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: white;
  text-decoration: none;
}

.submenu a:hover {
  background: rgba(255, 255, 255, 0.15);
}

.submenu a.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  color: #e8f5e9;
  font-weight: 600;
  border-left: 4px solid #c8e6c9;
}

.submenu-divider {
  margin: 8px 0 4px;
  font-size: 11px;
  opacity: 0.8;
  text-transform: uppercase;
}

.menu-title.single-link {
  text-decoration: none;
  color: white;
}

.menu-title.single-link.router-link-active {
  background: rgba(255, 255, 255, 0.25);
  color: #e8f5e9;
  font-weight: 600;
  border-left: 4px solid #c8e6c9;
}
</style>
