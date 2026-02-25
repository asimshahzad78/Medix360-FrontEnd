export interface DashboardSummary {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
}

export interface RevenueChartItem {
  label: string
  income: number
  expense: number
}

export interface PatientTrendItem {
  month: string
  newPatients: number
  recoveredPatients: number
}

export interface PaymentItem {
  patientName: string
  amount: number
  date: string
}

export interface CheckupItem {
  patientName: string
  doctorName: string
  date: string
}
