export default [
  {
    path: '/opd/workflow',
    component: () => import('./OpdWorkflowPage.vue'),
    meta: {
      title: 'OPD Workflow',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
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
