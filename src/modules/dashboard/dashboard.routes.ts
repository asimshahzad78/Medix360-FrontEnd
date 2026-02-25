import type { RouteRecordRaw } from 'vue-router'
import DashboardPage from './DashboardPage.vue'

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]

export default dashboardRoutes
