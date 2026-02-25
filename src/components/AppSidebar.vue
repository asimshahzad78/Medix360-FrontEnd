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
          <RouterLink v-if="canSee('patients.checkups')" to="/checkups" @click="onNavigate">
            Checkups / Visits
          </RouterLink>
          <RouterLink v-if="canSee('patients.appointments')" to="/dashboard" @click="onNavigate">
            Appointments
          </RouterLink>

          <RouterLink v-if="canSee('patients.payments')" to="/payments" @click="onNavigate">
            Payment
          </RouterLink>

          <RouterLink v-if="canSee('patients.counterClosing')" to="/finance/counter-closing" @click="onNavigate">
            Counter Closing
          </RouterLink>

          <div class="submenu-divider" v-if="canSee('opd')">Visits / OPD</div>

          <RouterLink v-if="canSee('opd.prescriptions')" to="/dashboard" @click="onNavigate">
            Prescriptions
          </RouterLink>
          <RouterLink v-if="canSee('opd.diagnosis')" to="/dashboard" @click="onNavigate">
            Diagnosis
          </RouterLink>
          <RouterLink v-if="canSee('opd.vitals')" to="/dashboard" @click="onNavigate">
            Vital Signs
          </RouterLink>
          <RouterLink v-if="canSee('opd.procedures')" to="/dashboard" @click="onNavigate">
            Procedures
          </RouterLink>
          <RouterLink v-if="canSee('opd.followups')" to="/dashboard" @click="onNavigate">
            Follow-ups
          </RouterLink>
        </div>
      </div>

      <!-- HUMAN RESOURCE -->
      <div class="menu-group" v-if="canSee('hr')">
        <div class="menu-title" @click="toggle('hr')">
          Human Resource
          <span>{{ menuOpen.hr ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.hr" class="submenu">
          <RouterLink v-if="canSee('hr.departments')" to="/hr/departments" @click="onNavigate">
            Departments
          </RouterLink>
          <RouterLink v-if="canSee('hr.designations')" to="/hr/designations" @click="onNavigate">
            Designations
          </RouterLink>
          <RouterLink v-if="canSee('hr.workforce')" to="/employees" @click="onNavigate">
            Workforce
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
          <RouterLink v-if="canSee('finance.coa')" to="/finance/chartofaccounts" @click="onNavigate">
            Chart Of Account
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
      <div class="menu-group" v-if="canSee('lab')">
        <div class="menu-title" @click="toggle('lab')">
          Laboratory
          <span>{{ menuOpen.lab ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.lab" class="submenu">
          <RouterLink v-if="canSee('lab.tests')" to="/dashboard" @click="onNavigate">
            Lab Tests
          </RouterLink>
          <RouterLink v-if="canSee('lab.categories')" to="/dashboard" @click="onNavigate">
            Categories
          </RouterLink>
          <RouterLink v-if="canSee('lab.sample')" to="/dashboard" @click="onNavigate">
            Sample Collection
          </RouterLink>
          <RouterLink v-if="canSee('lab.results')" to="/dashboard" @click="onNavigate">
            Lab Results
          </RouterLink>
        </div>
      </div>

      <!-- PHARMACY -->
      <div class="menu-group" v-if="canSee('pharmacy')">
        <div class="menu-title" @click="toggle('pharmacy')">
          Pharmacy
          <span>{{ menuOpen.pharmacy ? '▾' : '▸' }}</span>
        </div>
        <div v-if="menuOpen.pharmacy" class="submenu">
          <RouterLink v-if="canSee('pharmacy.medicines')" to="/dashboard" @click="onNavigate">
            Medicines
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.categories')" to="/dashboard" @click="onNavigate">
            Categories
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.stock')" to="/dashboard" @click="onNavigate">
            Stock
          </RouterLink>
          <RouterLink v-if="canSee('pharmacy.issue')" to="/dashboard" @click="onNavigate">
            Medicine Issue
          </RouterLink>
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

/**
 * `open` prop controls drawer visibility on mobile/tablet
 */
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const auth = useAuthStore()
const route = useRoute()

/**
 * Rename accordion state to avoid collision with prop `open`
 */
const menuOpen = reactive({
  patients: false,
  hr: false,
  lab: false,
  pharmacy: false,
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

const has = (perm: string) => auth.permissions.includes(perm)

const canSee = (key: string): boolean => {
  switch (key) {
    case 'dashboard':
      return has('Dashboard.View')

    case 'patients':
    case 'patients.list':
    case 'patients.checkups':
    case 'patients.appointments':
      return has('Patients.View')

    case 'patients.payments':
      return has('Finance.Payments.View')

    case 'patients.counterClosing':
      return has('Finance.CounterClosing.View')

    case 'opd':
    case 'opd.prescriptions':
    case 'opd.diagnosis':
    case 'opd.vitals':
    case 'opd.procedures':
    case 'opd.followups':
      return has('OPD.Checkups.View')

    case 'hr':
    case 'hr.departments':
      return has('HR.Departments.View')
    case 'hr.designations':
      return has('HR.Designations.View')
    case 'hr.workforce':
      return has('HR.Workforce.View')

    case 'finance':
    case 'finance.coa':
      return has('Finance.COA.View')
    case 'finance.expenseVouchers':
      return has('Finance.ExpenseVouchers.View')
    case 'finance.dailyClosing':
      return has('Finance.DailyClosing.View')

    case 'lab':
    case 'lab.tests':
      return has('Lab.Tests.View')
    case 'lab.categories':
      return has('Lab.Categories.View')
    case 'lab.sample':
      return has('Lab.SampleCollection.View')
    case 'lab.results':
      return has('Lab.Results.View')

    case 'pharmacy':
    case 'pharmacy.medicines':
      return has('Pharmacy.Medicines.View')
    case 'pharmacy.categories':
      return has('Pharmacy.Categories.View')
    case 'pharmacy.stock':
      return has('Pharmacy.Stock.View')
    case 'pharmacy.issue':
      return has('Pharmacy.Issue.View')

    case 'reports':
      return has('Reports.Patient.View') || has('Reports.Finance.View') || has('Reports.Lab.View')

    case 'reports.patient':
      return has('Reports.Patient.View')
    case 'reports.finance':
      return has('Reports.Finance.View')
    case 'reports.lab':
      return has('Reports.Lab.View')

    case 'admin':
      return (
        has('Admin.CompanyInfo.View') ||
        has('Admin.Users.View') ||
        has('Admin.Permissions.View') ||
        has('Admin.JobRoles.View')
      )

    case 'admin.company':
      return has('Admin.CompanyInfo.View')

    case 'admin.paymentCategories':
      return has('Finance.PaymentCategories.View')

    case 'admin.users':
      return has('Admin.Users.View')

    case 'admin.roles':
      return has('Admin.Permissions.View') || has('Admin.JobRoles.View')

    default:
      return false
  }
}

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
