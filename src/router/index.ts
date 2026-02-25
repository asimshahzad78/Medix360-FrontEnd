import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import FullWidthLayout from '@/layouts/FullWidthLayout.vue'
import { useAuthStore } from '@/store/auth.store'

// Modules
import authRoutes from '@/modules/auth/auth.routes'
import dashboardRoutes from '@/modules/dashboard/dashboard.routes'
import doctorRoutes from '@/modules/doctor/doctor.routes'
import patientRoutes from '@/modules/patient/patient.routes'
import appointmentRoutes from '@/modules/appointment/appointment.routes'
import checkupRoutes from '@/modules/checkup/checkup.routes'
import { paymentRoutes } from '@/modules/payment/payment.routes'
import companyInfoRoutes from '@/modules/company-info/company-info.routes'

import coaRoutes from '@/modules/finance/coa/coa.routes'
import revenueVoucherRoutes from '@/modules/finance/revenue-voucher/revenueVoucher.routes'
import paymentCategoryRoutes from '@/modules/admin/payment-categories/paymentCategory.routes'
import expenseVoucherRoutes from '@/modules/finance/expense-voucher/expense-voucher.routes'
import dailyClosingRoutes from '@/modules/finance/daily-closing/daily-closing.routes'
import counterClosingRoutes from '@/modules/finance/counter-closing/counter-closing.routes'
import employeeRoutes from '@/modules/employee/employee.routes'
import hrRoutes from '@/modules/hr/routes'
import { userManagementRoutes } from '@/modules/user-management/user-management.routes'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },

  {
    path: '/',
    component: FullWidthLayout,
    children: [...authRoutes],
  },

  {
    path: '/',
    component: MainLayout,
    children: [
      ...dashboardRoutes,
      ...doctorRoutes,
      ...patientRoutes,
      ...appointmentRoutes,
      ...checkupRoutes,
      ...paymentRoutes,
      ...companyInfoRoutes,

      ...coaRoutes,
      ...revenueVoucherRoutes,
      ...paymentCategoryRoutes,
      ...expenseVoucherRoutes,
      ...dailyClosingRoutes,
      ...counterClosingRoutes,
      ...employeeRoutes,
      ...hrRoutes,
      ...userManagementRoutes,
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    component: FullWidthLayout,
    children: [{ path: '', component: () => import('@/pages/errors/ErrorPage404.vue') }],
  },
  {
  path: '/forbidden',
  component: FullWidthLayout,
  children: [{ path: '', component: () => import('@/pages/errors/ErrorPage404.vue') }],
},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const getFirstAllowedRoute = (perms: string[]): string => {
  const has = (p: string) => perms.includes(p)

  // ✅ Your priority order (edit if you want)
  if (has('Dashboard.View')) return '/dashboard'

  // Patient module
  if (has('Patients.View')) return '/patients'
  if (has('OPD.Checkups.View')) return '/checkups'
  if (has('Appointments.View')) return '/appointments'

  // HR
  if (has('HR.Departments.View')) return '/hr/departments'
  if (has('HR.Designations.View')) return '/hr/designations'
  if (has('HR.Workforce.View')) return '/employees'

  // Finance
  if (has('Finance.Payments.View')) return '/payments'
  if (has('Finance.CounterClosing.View')) return '/finance/counter-closing'
  if (has('Finance.COA.View')) return '/finance/chartofaccounts'
  if (has('Finance.ExpenseVouchers.View')) return '/finance/expense-vouchers'
  if (has('Finance.DailyClosing.View')) return '/finance/daily-closing'

  // Admin
  if (has('Admin.CompanyInfo.View')) return '/company-info'
  if (has('Admin.Users.View')) return '/admin/users'
  if (has('Finance.PaymentCategories.View')) return '/admin/payment-categories'

  // fallback
  return '/forbidden'
}

// optional: which permission is needed for which route prefix
const routePermRules: Array<{ prefix: string; perm: string }> = [
  { prefix: '/dashboard', perm: 'Dashboard.View' },

  { prefix: '/patients', perm: 'Patients.View' },
  { prefix: '/checkups', perm: 'OPD.Checkups.View' },
  { prefix: '/appointments', perm: 'Appointments.View' },

  { prefix: '/hr/departments', perm: 'HR.Departments.View' },
  { prefix: '/hr/designations', perm: 'HR.Designations.View' },
  { prefix: '/employees', perm: 'HR.Workforce.View' },

  { prefix: '/payments', perm: 'Finance.Payments.View' },
  { prefix: '/finance/counter-closing', perm: 'Finance.CounterClosing.View' },
  { prefix: '/finance/chartofaccounts', perm: 'Finance.COA.View' },
  { prefix: '/finance/expense-vouchers', perm: 'Finance.ExpenseVouchers.View' },
  { prefix: '/finance/daily-closing', perm: 'Finance.DailyClosing.View' },

  { prefix: '/company-info', perm: 'Admin.CompanyInfo.View' },
  { prefix: '/admin/users', perm: 'Admin.Users.View' },
  { prefix: '/admin/payment-categories', perm: 'Finance.PaymentCategories.View' },
]

const requiredPermForPath = (path: string): string | null => {
  const rule = routePermRules.find((r) => path.startsWith(r.prefix))
  return rule?.perm ?? null
}

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  const publicPaths = ['/login', '/forgot-password', '/reset-password', '/forbidden']
  const isPublic = publicPaths.includes(to.path)

  // ✅ if not logged in -> only allow public
  if (!auth.isLoggedIn) {
    if (isPublic) return next()
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // ✅ logged in: opening /login should go to first allowed page
  if (to.path === '/login') {
    return next(getFirstAllowedRoute(auth.permissions))
  }

  // ✅ if route requires perm and user does not have it -> redirect to first allowed
  const required = requiredPermForPath(to.path)
  if (required && !auth.permissions.includes(required)) {
    return next(getFirstAllowedRoute(auth.permissions))
  }

  // ✅ if user hits "/" (root) while logged in -> go to first allowed
  if (to.path === '/') {
    return next(getFirstAllowedRoute(auth.permissions))
  }

  next()
})

export default router
