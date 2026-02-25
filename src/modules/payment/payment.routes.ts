// src/modules/payments/payment.routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const paymentRoutes: RouteRecordRaw[] = [
  {
    path: '/payments',
    name: 'PaymentList',
    component: () => import('./PaymentList.vue'),
    meta: {
      requiresAuth: true,
      title: 'Payments',
    },
  },

  // ✅ CREATE (NO ID)
  {
    path: '/payments/new',
    name: 'PaymentCreate',
    component: () => import('./PaymentDetail.vue'),
    meta: {
      requiresAuth: true,
      title: 'New Payment',
    },
  },

  // ✅ EDIT / VIEW (NUMERIC ID ONLY)
  {
    path: '/payments/:id(\\d+)',
    name: 'PaymentDetail',
    component: () => import('./PaymentDetail.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      title: 'Edit Payment',
    },
  },

  {
    path: '/payments/:id(\\d+)/print',
    name: 'PaymentPrint',
    component: () => import('./PaymentPrint.vue'),
    meta: {
      requiresAuth: true,
      layout: 'MainLayout',
      title: 'Print Invoice',
    },
  },

  {
    path: '/payments/:id(\\d+)/thermal',
    name: 'PaymentThermalPrint',
    component: () => import('./PaymentThermalPrint.vue'),
    meta: {
      requiresAuth: true,
      layout: 'MainLayout',
    },
  },
]
