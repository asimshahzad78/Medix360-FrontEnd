// src/modules/finance/counter-closing/counter-closing.routes.ts
import type { RouteRecordRaw } from 'vue-router'

const counterClosingRoutes: RouteRecordRaw[] = [
  {
    path: '/finance/counter-closing',
    name: 'FinanceCounterClosing',
    component: () => import('@/modules/finance/counter-closing/CounterClosingView.vue'),
    meta: {
      title: 'Counter Closing',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]

export default counterClosingRoutes
