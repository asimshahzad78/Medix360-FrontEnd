export default [
  {
    path: '/doctors',
    component: () => import('./DoctorList.vue'),
    meta: {
      title: 'Doctor List',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/doctors/:id',
    component: () => import('./DoctorDetail.vue'),
    meta: {
      title: 'Doctor Detail',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
