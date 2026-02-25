import type { RouteRecordRaw } from 'vue-router'
import RevenueVoucherList from './RevenueVoucherList.vue'

const RevenueVoucherRoutes: RouteRecordRaw[] = [
  {
    path: '/finance/revenue-vouchers',
    name: 'RevenueVoucherList',
    component: RevenueVoucherList,
    meta: {
      title: 'Revenue Vouchers',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]

export default RevenueVoucherRoutes
