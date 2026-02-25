export default [
  {
    path: '/hr/departments',
    component: () => import('./pages/DepartmentsPage.vue'),
    meta: { title: 'Departments' },
  },
  {
    path: '/hr/designations',
    component: () => import('./pages/DesignationsPage.vue'),
    meta: { title: 'Designations' },
  },
]
