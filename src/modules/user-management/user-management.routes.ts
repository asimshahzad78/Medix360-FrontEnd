// src/modules/user-management/user-management.routes.ts

import type { RouteRecordRaw } from 'vue-router'
import UserList from './UserList.vue'

export const userManagementRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: UserList,
    meta: { requiresAuth: true },
  },
]
