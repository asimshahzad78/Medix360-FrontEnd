import type { RouteRecordRaw } from 'vue-router'

export const permissionSyncRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/permission-sync',
    name: 'PermissionBackendSync',
    component: () => import('./PermissionSyncPage.vue'),
    meta: {
      title: 'Permission Backend Sync',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
