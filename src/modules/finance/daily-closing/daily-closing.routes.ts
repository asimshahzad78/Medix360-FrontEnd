import type { RouteRecordRaw } from 'vue-router'

const dailyClosingRoutes: RouteRecordRaw[] = [
  {
    path: '/finance/daily-closing',
    name: 'FinanceDailyClosing',
    component: () => import('@/modules/finance/daily-closing/DailyClosingView.vue'),
    meta: {
      title: 'Daily Closing',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]

export default dailyClosingRoutes
