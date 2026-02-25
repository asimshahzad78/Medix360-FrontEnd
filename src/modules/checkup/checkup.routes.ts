export default [
  {
    path: '/checkups',
    component: () => import('./CheckupList.vue'),
    meta: {
      title: 'Checkup List',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
