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
  {
    path: '/hr/attendance-logs',
    component: () => import('./pages/AttendanceLogsPage.vue'),
    meta: { title: 'Attendance Logs' },
  },
  {
    path: '/hr/credentials',
    component: () => import('./pages/CredentialsPage.vue'),
    meta: { title: 'Credentials' },
  },
  {
    path: '/hr/disciplinary-incidents',
    component: () => import('./pages/DisciplinaryIncidentsPage.vue'),
    meta: { title: 'Disciplinary Incidents' },
  },
  {
    path: '/hr/duty-rosters',
    component: () => import('./pages/DutyRostersPage.vue'),
    meta: { title: 'Duty Rosters' },
  },
  {
    path: '/hr/employment-profile-tags',
    component: () => import('./pages/EmploymentProfileTagsPage.vue'),
    meta: { title: 'Employment Profile Tags' },
  },
  {
    path: '/hr/leave-balances',
    component: () => import('./pages/LeaveBalancesPage.vue'),
    meta: { title: 'Leave Balances' },
  },
  {
    path: '/hr/leave-requests',
    component: () => import('./pages/LeaveRequestsPage.vue'),
    meta: { title: 'Leave Requests' },
  },
  {
    path: '/hr/leave-types',
    component: () => import('./pages/LeaveTypesPage.vue'),
    meta: { title: 'Leave Types' },
  },
  {
    path: '/hr/onboarding-checklist-items',
    component: () => import('./pages/OnboardingChecklistItemsPage.vue'),
    meta: { title: 'Onboarding Checklist Items' },
  },
  {
    path: '/hr/payrolls',
    component: () => import('./pages/PayrollsPage.vue'),
    meta: { title: 'Payrolls' },
  },
  {
    path: '/hr/performance-appraisals',
    component: () => import('./pages/PerformanceAppraisalsPage.vue'),
    meta: { title: 'Performance Appraisals' },
  },
  {
    path: '/hr/permissions',
    component: () => import('./pages/PermissionsPage.vue'),
    meta: { title: 'Permissions' },
  },
  {
    path: '/hr/shifts',
    component: () => import('./pages/ShiftsPage.vue'),
    meta: { title: 'Shifts' },
  },
  {
    path: '/hr/training-enrollments',
    component: () => import('./pages/TrainingEnrollmentsPage.vue'),
    meta: { title: 'Training Enrollments' },
  },
]
