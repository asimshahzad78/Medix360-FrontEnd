export type ExpenseVoucherStatus = 'Unpaid' | 'Paid' | 'Cancelled'
export type ExpenseVoucherType = 0 | 1 | 2 | 3 | 4 | 5

export const expenseVoucherTypeOptions: { value: ExpenseVoucherType; label: string }[] = [
  { value: 0, label: 'General' },
  { value: 1, label: 'Petty Cash' },
  { value: 2, label: 'Vendor Payment' },
  { value: 3, label: 'Adjustment' },
  { value: 4, label: 'Expense' },
  { value: 5, label: 'Journal' },
]

export const expenseVoucherStatusOptions: ExpenseVoucherStatus[] = ['Unpaid', 'Paid', 'Cancelled']

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
  type: ExpenseVoucherType
  expenseAccountId: string
  paymentAccountId: string
  status: ExpenseVoucherStatus
}
