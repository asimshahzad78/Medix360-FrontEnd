import type { RouteRecordRaw } from 'vue-router'
import ChartOfAccountList from './ChartOfAccountList.vue'

const ChartOfAccount: RouteRecordRaw[] = [
  {
    path: '/finance/chartofaccounts',
    name: 'ChartOfAccountList',
    component: ChartOfAccountList,
    meta: {
      title: 'Chart Of Account',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]

export default ChartOfAccount
