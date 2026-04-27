import type { RouteRecordRaw } from 'vue-router'

export const observabilityRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/observability',
    name: 'ObservabilityAdmin',
    component: () => import('./ObservabilityAdminPage.vue'),
    meta: {
      title: 'Observability Admin',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
