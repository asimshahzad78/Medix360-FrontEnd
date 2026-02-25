export default [
  {
    path: '/finance/expense-vouchers',
    component: () => import('./ExpenseVoucherList.vue'),
    meta: {
      title: 'Expense Vouchers',
    },
  },
]
