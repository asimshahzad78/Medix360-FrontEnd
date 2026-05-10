import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'

import type {
  DashboardSummary,
  RevenueChartItem,
  PatientTrendItem,
  PaymentItem,
  CheckupItem,
} from './dashboard.types'

export const demoDashboardSummary: DashboardSummary = {
  totalPatients: 128,
  totalDoctors: 12,
  totalAppointments: 34,
  totalRevenue: 485000,
}

export const demoRecentPayments: PaymentItem[] = [
  { patientName: 'Ayesha Khan', amount: 2500, date: new Date().toISOString() },
  { patientName: 'Bilal Ahmed', amount: 1800, date: new Date().toISOString() },
  { patientName: 'Fatima Noor', amount: 3200, date: new Date().toISOString() },
]

export const demoRecentCheckups: CheckupItem[] = [
  { patientName: 'Ayesha Khan', doctorName: 'Dr. Sarah Ahmed', date: new Date().toISOString() },
  { patientName: 'Bilal Ahmed', doctorName: 'Dr. Imran Malik', date: new Date().toISOString() },
  { patientName: 'Fatima Noor', doctorName: 'Dr. Hina Yusuf', date: new Date().toISOString() },
]

const demoRevenueChart: RevenueChartItem[] = [
  { label: 'Jan', income: 315000, expense: 198000 },
  { label: 'Feb', income: 342000, expense: 205000 },
  { label: 'Mar', income: 388000, expense: 228000 },
  { label: 'Apr', income: 421000, expense: 244000 },
  { label: 'May', income: 485000, expense: 271000 },
  { label: 'Jun', income: 532000, expense: 296000 },
]

const demoPatientTrend: PatientTrendItem[] = [
  { month: 'Jan', newPatients: 96, recoveredPatients: 72 },
  { month: 'Feb', newPatients: 118, recoveredPatients: 84 },
  { month: 'Mar', newPatients: 132, recoveredPatients: 91 },
  { month: 'Apr', newPatients: 149, recoveredPatients: 103 },
  { month: 'May', newPatients: 164, recoveredPatients: 121 },
  { month: 'Jun', newPatients: 181, recoveredPatients: 136 },
]

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      const { data } = await api.get('/dashboard/summary')
      return unwrapApiData<DashboardSummary>(data, demoDashboardSummary)
    } catch {
      return demoDashboardSummary
    }
  },

  async getRevenueChart(): Promise<RevenueChartItem[]> {
    try {
      const { data } = await api.get('/dashboard/revenue-chart')
      const rows = unwrapApiData<RevenueChartItem[]>(data, [])
      return rows.length ? rows : demoRevenueChart
    } catch {
      return demoRevenueChart
    }
  },

  async getPatientTrend(): Promise<PatientTrendItem[]> {
    try {
      const { data } = await api.get('/dashboard/patient-trend')
      const rows = unwrapApiData<PatientTrendItem[]>(data, [])
      return rows.length ? rows : demoPatientTrend
    } catch {
      return demoPatientTrend
    }
  },

  async getRecentPayments(): Promise<PaymentItem[]> {
    try {
      const { data } = await api.get('/dashboard/recent-payments')
      const rows = unwrapApiData<PaymentItem[]>(data, [])
      return rows.length ? rows : demoRecentPayments
    } catch {
      return demoRecentPayments
    }
  },

  async getRecentCheckups(): Promise<CheckupItem[]> {
    try {
      const { data } = await api.get('/dashboard/recent-checkups')
      const rows = unwrapApiData<CheckupItem[]>(data, [])
      return rows.length ? rows : demoRecentCheckups
    } catch {
      return demoRecentCheckups
    }
  },
}
