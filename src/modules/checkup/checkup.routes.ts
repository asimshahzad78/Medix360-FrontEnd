export default [
  {
    path: '/opd/workflow',
    name: 'OpdWorkflow',
    component: () => import('./OpdWorkflowPage.vue'),
    meta: {
      title: 'OPD Workflow',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/opd/prescriptions',
    name: 'OpdPrescriptions',
    component: () => import('./OpdSectionPage.vue'),
    props: { section: 'prescriptions' },
    meta: {
      title: 'Prescriptions',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/opd/diagnosis',
    name: 'OpdDiagnosis',
    component: () => import('./OpdSectionPage.vue'),
    props: { section: 'diagnosis' },
    meta: {
      title: 'Diagnosis',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/opd/vital-signs',
    name: 'OpdVitalSigns',
    component: () => import('./OpdSectionPage.vue'),
    props: { section: 'vitalSigns' },
    meta: {
      title: 'Vital Signs',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/opd/procedures',
    name: 'OpdProcedures',
    component: () => import('./OpdSectionPage.vue'),
    props: { section: 'procedures' },
    meta: {
      title: 'Procedures',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/opd/follow-ups',
    name: 'OpdFollowUps',
    component: () => import('./OpdSectionPage.vue'),
    props: { section: 'followUps' },
    meta: {
      title: 'Follow-ups',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
  {
    path: '/checkups',
    name: 'Checkups',
    component: () => import('./CheckupList.vue'),
    meta: {
      title: 'Checkup List',
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
