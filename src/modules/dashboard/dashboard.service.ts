import { api } from '@/services/api'

import type {
  DashboardSummary,
  RevenueChartItem,
  PatientTrendItem,
  PaymentItem,
  CheckupItem,
} from './dashboard.types'

export const dashboardService = {
  // 🔹 SUMMARY (KPIs)
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get('/dashboard/summary')
    return data
  },

  // 🔹 REVENUE CHART
  async getRevenueChart(): Promise<RevenueChartItem[]> {
    const { data } = await api.get('/dashboard/revenue-chart')
    return data
  },

  // 🔹 PATIENT TREND
  async getPatientTrend(): Promise<PatientTrendItem[]> {
    const { data } = await api.get('/dashboard/patient-trend')
    return data
  },

  // 🔹 RECENT PAYMENTS
  async getRecentPayments(): Promise<PaymentItem[]> {
    const { data } = await api.get('/dashboard/recent-payments')
    return data
  },

  // 🔹 RECENT CHECKUPS
  async getRecentCheckups(): Promise<CheckupItem[]> {
    const { data } = await api.get('/dashboard/recent-checkups')
    return data
  },
}
