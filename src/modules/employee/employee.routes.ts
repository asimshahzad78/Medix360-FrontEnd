export default [
  {
    path: '/employees',
    component: () => import('./EmployeeList.vue'),
    meta: {
      title: 'Employee List',
    },
  },
  {
    path: '/employees/:id',
    component: () => import('./EmployeeDetail.vue'),
    meta: {
      title: 'Employee Detail',
    },
  },
]
