export default [
  {
    path: '/appointments',
    component: () => import('./AppointmentList.vue'),
  },
  {
    path: '/appointments/calendar',
    component: () => import('./AppointmentCalendar.vue'),
  },
]
