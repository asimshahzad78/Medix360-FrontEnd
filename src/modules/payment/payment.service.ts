import { api } from '@/services/api'
import type {
  PaymentApiItem,
  PaymentDetailResponse,
  PaymentCategoryDto,
  ManagePaymentsDto,
  PaymentModeHistoryDto,
  PaymentItemCrudRaw,
  PaymentPrintResponse,
} from './payment.types'

/* =========================
   RAW BACKEND RESPONSE TYPES
========================= */

interface PaymentsCrudVmRaw {
  Id: number
  PatientId: number
  VisitId: string
  CommonCharge?: number
  Discount?: number
  Tax?: number
  CurrencyId?: number
  InsuranceNo?: string | null
  InsuranceCoverage?: number | null
}

interface PaymentModeRaw {
  Id: number
  ModeOfPayment: 'Cash' | 'Bank' | 'Card'
  Amount: number
  ReferenceNo?: string | null
}

interface ManagePaymentsApiResponseRaw {
  patientName: string
  PaymentsCRUDViewModel: PaymentsCrudVmRaw
  listPaymentsDetailsCRUDViewModel: PaymentItemCrudRaw[]
  listPaymentModeHistoryCRUDViewModel: PaymentModeRaw[]
}

/* =========================
   SERVICE
========================= */

export const PaymentService = {
  /* =========================
     PAGED LIST
  ========================= */
getPaged(page: number, pageSize: number, search?: string) {
  return api.get<{
    items: PaymentApiItem[]
    totalCount: number
  }>('/payments', {
    params: { page, pageSize, search: search?.trim() || undefined },
  })
},

  /* =========================
     INVOICE / VIEW
  ========================= */
  async getInvoiceById(id: number): Promise<PaymentDetailResponse> {
    const { data } = await api.get<PaymentDetailResponse>(`/payments/${id}/invoice`)
    return data
  },

  async getInvoiceDetailById(id: number): Promise<PaymentDetailResponse> {
    const { data } = await api.get<PaymentDetailResponse>(`/payments/${id}`)
    return data
  },

  /* =========================
     INVOICE / PRINT ✅ (doctorName + doctorMobile included)
  ========================= */
 async getInvoiceForPrint(id: number): Promise<PaymentPrintResponse> {
  const { data } = await api.get<{
    id: number
    visitId: string
    receiptNo: string
    paymentDate: string
    status: string

    patient: {
      id: number
      fullName: string
      age?: number
      ageDisplay?: string      // ✅ add
      ageUnit?: string         // ✅ add
      gender?: string
      mrNo?: string
      bedNo?: string | null
      panel?: string          // ✅ add
    }

    patientName?: string

    totalAmount: number
    totalDiscount: number
    netAmount: number
    paidAmount: number
    balanceAmount: number

    doctorId?: number | null
    doctorName?: string | null
    doctorMobile?: string | null

    details: Array<{
      id: number
      description: string
      quantity?: number
      unitPrice?: number
      amount: number
      discount: number
      netAmount: number
    }>
  }>(`/payments/${id}/invoice`)

  // ✅ keep your existing mapping logic (Paid -> Posted)
  const status: PaymentPrintResponse['status'] =
    data.status === 'Draft' || data.status === 'Posted' || data.status === 'Cancelled'
      ? data.status
      : data.status === 'Paid'
        ? 'Posted'
        : 'Draft'

  return {
    id: data.id,
    visitId: String(data.visitId ?? ''),
    receiptNo: data.receiptNo ?? '',
    paymentDate: data.paymentDate ?? '',
    status,

    patient: {
      id: data.patient?.id ?? 0,
      fullName: data.patient?.fullName ?? '',
      age: data.patient?.age,
      ageDisplay: data.patient?.ageDisplay,   // ✅ map
      ageUnit: data.patient?.ageUnit,         // ✅ map
      gender: data.patient?.gender,
      mrNo: data.patient?.mrNo,
      bedNo: data.patient?.bedNo ?? null,
      panel: data.patient?.panel,             // ✅ map
    },

    patientName: data.patientName ?? data.patient?.fullName ?? '',

    totalAmount: data.totalAmount ?? 0,
    totalDiscount: data.totalDiscount ?? 0,
    netAmount: data.netAmount ?? 0,
    paidAmount: data.paidAmount ?? 0,
    balanceAmount: data.balanceAmount ?? 0,

    doctorId: data.doctorId ?? null,
    doctorName: data.doctorName ?? null,
    doctorMobile: data.doctorMobile ?? null,

    details: (data.details ?? []).map((d) => ({
      id: d.id ?? 0,
      description: d.description ?? '',
      quantity: d.quantity,
      unitPrice: d.unitPrice,
      amount: d.amount ?? 0,
      discount: d.discount ?? 0,
      netAmount: d.netAmount ?? 0,
    })),
  }
},

  /* =========================
     LOAD PAYMENT (EDIT MODAL)
  ========================= */
  async getManagePaymentById(id: number): Promise<{
    patientName: string
    paymentsCRUDViewModel: ManagePaymentsDto['paymentsCRUDViewModel']
    listPaymentsDetailsCRUDViewModel: PaymentItemCrudRaw[]
    listPaymentModeHistoryCRUDViewModel: PaymentModeHistoryDto[]
  }> {
    const { data } = await api.get<ManagePaymentsApiResponseRaw>(`/payments/${id}/edit`)

    const p = data.PaymentsCRUDViewModel

    return {
      patientName: data.patientName ?? '',
      paymentsCRUDViewModel: {
        id: p.Id,
        patientId: p.PatientId,
        visitId: p.VisitId,
        commonCharge: p.CommonCharge ?? 0,
        discount: p.Discount ?? 0,
        discountAmount: 0,
        tax: p.Tax ?? 0,
        taxAmount: 0,
        subTotal: 0,
        grandTotal: 0,
        paidAmount: 0,
        dueAmount: 0,
        changedAmount: 0,
        currencyId: p.CurrencyId ?? 1,
        insuranceNo: p.InsuranceNo ?? '',
        insuranceCoverage: p.InsuranceCoverage ?? 0,
      },

      listPaymentsDetailsCRUDViewModel: data.listPaymentsDetailsCRUDViewModel ?? [],

      listPaymentModeHistoryCRUDViewModel: (data.listPaymentModeHistoryCRUDViewModel ?? []).map(
        (x): PaymentModeHistoryDto => ({
          id: x.Id,
          modeOfPayment: x.ModeOfPayment,
          amount: x.Amount,
          referenceNo: x.ReferenceNo ?? '',
        }),
      ),
    }
  },

  /* =========================
     SAVE / UPDATE PAYMENT
  ========================= */
  async saveManagePayment(payload: ManagePaymentsDto): Promise<void> {
    await api.post('/payments/add-edit', payload)
  },

  /* =========================
     PAYMENT CATEGORIES
  ========================= */
  async getMvcPaymentCategories(): Promise<PaymentCategoryDto[]> {
    const { data } = await api.get<Array<{ PaymentItemCode: string; Name: string }>>(
      '/payment-categories',
    )

    return data.map((x) => ({
      code: x.PaymentItemCode,
      name: x.Name,
    }))
  },
}
