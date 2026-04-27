import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import FullWidthLayout from '@/layouts/FullWidthLayout.vue'
import { useAuthStore } from '@/store/auth.store'
import {
  applyRoutePermissionMeta,
  canAccessRoute,
  getFirstAllowedRoute,
} from '@/security/permissions'

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
import enterpriseRoutes from '@/modules/enterprise/enterprise.routes'
import { auditRoutes } from '@/modules/audit/audit.routes'
import { observabilityRoutes } from '@/modules/observability/observability.routes'
import { permissionSyncRoutes } from '@/modules/admin/permission-sync.routes'

const routes: RouteRecordRaw[] = applyRoutePermissionMeta([
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
      ...auditRoutes,
      ...observabilityRoutes,
      ...permissionSyncRoutes,
      ...enterpriseRoutes,
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
])

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  const publicPaths = ['/login', '/forgot-password', '/reset-password', '/forbidden']
  const isPublic = publicPaths.includes(to.path)

  if (!auth.isLoggedIn) {
    if (isPublic) return next()
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (to.path === '/login') {
    return next(getFirstAllowedRoute(auth.permissions))
  }

  if (!canAccessRoute(to, auth.permissions)) {
    return next(getFirstAllowedRoute(auth.permissions))
  }

  if (to.path === '/') {
    return next(getFirstAllowedRoute(auth.permissions))
  }

  next()
})

export default router
