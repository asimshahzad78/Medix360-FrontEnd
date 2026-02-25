// src/modules/finance/counter-closing/counter-closing.types.ts

export interface CounterClosingReportDto {
  date: string
  tenantId: string
  propertyId: string

  // Quick cards
  newPatients: number
  totalCheckups: number
  totalCheckupFee: number

  freePatients: number
  discountedPatients: number
  discountAmount: number

  // Payment modes (transactions + amounts)
  cashTransactions: number
  cashAmount: number

  cardTransactions: number
  cardAmount: number

  onlineTransactions: number
  onlineAmount: number

  // Cash in hand deductions
  expensesFromCashInHand: number
  doctorPayoutFromCashInHand: number

  // Left amount
  amountLeft: number
}
