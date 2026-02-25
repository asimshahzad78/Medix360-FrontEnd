export default [
  {
    path: '/patients',
    component: () => import('./PatientList.vue'),
    meta: {
      title: 'Patient List',
    },
  },
  {
    path: '/patients/:id',
    component: () => import('./PatientDetail.vue'),
    meta: {
      title: 'Patient Detail',
    },
  },
]
