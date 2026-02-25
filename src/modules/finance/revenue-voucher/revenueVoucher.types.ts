// MUST match backend enum exactly
export enum RevenueVoucherStatus {
  Unpaid = 0,
  Partial = 1,
  Paid = 2,
  Posted = 3,
  Cancelled = 4,
  Reversed = 5,
}

export interface RevenueVoucherApiDto {
  Id: string
  VoucherDate: string
  InvoiceNumber?: string | null

  PatientId: string
  DoctorId?: string | null

  TotalAmount: number
  Discount: number
  TaxAmount: number
  NetAmount: number

  Status: RevenueVoucherStatus

  IsReversal: boolean
  ReversedVoucherId?: string | null
}
