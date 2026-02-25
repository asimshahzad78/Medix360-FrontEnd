export default [
  {
    path: 'login',
    component: () => import('./LoginPage.vue'),
  },
  {
    path: 'forgot-password',
    component: () => import('./ForgotPassword.vue'),
  },
  {
    path: 'reset-password',
    component: () => import('./ResetPassword.vue'),
  },
]
