import type { RouteRecordRaw } from 'vue-router'

export const auditRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/audit',
    name: 'AuditViewer',
    component: () => import('./AuditViewerPage.vue'),
    meta: {
      title: 'Audit Viewer',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
