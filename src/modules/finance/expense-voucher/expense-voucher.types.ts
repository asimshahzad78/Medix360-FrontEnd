export type ExpenseVoucherStatus = 'Unpaid' | 'Paid' | 'Cancelled'

// API DTO (based on your controller using ExpenseVoucherDto)
export interface ExpenseVoucherApiDto {
  Id?: string
  TenantId?: string
  PropertyId?: string | null

  VoucherNo?: string
  Description?: string
  Amount: number
  Type?: string | number
  Date: string

  ExpenseAccountId: string
  BankAccountId: string // <-- this is your PaymentAccountId in UI terms (Cash/Bank leaf)
  Status?: ExpenseVoucherStatus
}

export interface ExpenseVoucherListItem {
  id: string
  voucherNo: string
  date: string
  description: string
  amount: number
  status: ExpenseVoucherStatus

  expenseAccountId: string
  paymentAccountId: string

  expenseAccountName?: string
  paymentAccountName?: string
}

export interface ExpenseVoucherSaveDto {
  date: string
  description: string
  amount: number
  expenseAccountId: string
  paymentAccountId: string
}
