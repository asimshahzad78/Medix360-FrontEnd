export default [
  {
    path: '/admin/payment-categories',
    component: () => import('./PaymentCategoryList.vue'),
    meta: {
      title: 'Payment Categories',
    },
  },
]
