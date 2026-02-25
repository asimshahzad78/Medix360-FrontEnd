// src/modules/company-info/company-info.routes.ts

export default [
  {
    path: '/company-info',
    component: () => import('./CompanyInfoFormModal.vue'),
    meta: {
      title: 'Company Info',
    },
  },
]
