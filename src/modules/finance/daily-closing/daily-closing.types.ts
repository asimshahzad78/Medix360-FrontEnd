export interface DailyClosingSourceSummaryDto {
  sourceModule: string
  count: number
  cashIn: number
  cashOut: number
  net: number
}

export interface DailyClosingExpenseHeadDto {
  accountId: string
  accountName: string
  amount: number
}

export interface DailyClosingReportDto {
  date: string
  tenantId: string
  propertyId: string

  cashAccountId: string
  cashAccountName: string

  entriesCount: number
  cashIn: number
  cashOut: number
  netCash: number

  bySource: DailyClosingSourceSummaryDto[]
  topExpenses: DailyClosingExpenseHeadDto[]
}
