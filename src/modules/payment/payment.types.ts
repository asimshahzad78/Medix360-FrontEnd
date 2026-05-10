/* =====================================================
   SHARED
===================================================== */

export type PaymentStatus = 'Draft' | 'Paid' | 'Posted' | 'Cancelled'

/* =====================================================
   FILTERS
===================================================== */

export interface PaymentListFilter {
  fromDate?: string
  toDate?: string
  patientId?: number | null
  categoryId?: number | null
  status?: PaymentStatus
  inBedOnly?: boolean
}

/* =====================================================
   LIST (GRID)
===================================================== */

export interface PaymentApiItem {
  Id: number
  id?: number
  VisitId: string | null
  visitId?: string | null
  PatientName: string
  patientName?: string
  DoctorName?: string | null
  doctorName?: string | null
  PatientType: string
  patientType?: string
  Discount: number
  discount?: number
  Tax: number
  tax?: number
  SubTotal: number
  subTotal?: number
  GrandTotal: number
  grandTotal?: number
  ModeOfPayment: string
  modeOfPayment?: string
  CreatedDate: string
  createdDate?: string
}

export interface PaymentListItem {
  id: number
  receiptNo: string
  patientName: string
  patientType: string
  totalAmount: number
  paymentDate: string
}

export interface PaymentTotals {
  totalAmount: number
  totalPaid: number
  totalBalance: number
}

export interface PaymentListResponse {
  items: PaymentListItem[]
  totals: PaymentTotals
}

/* =====================================================
   MEDICINES / LABS (NO any)
===================================================== */

export interface PaymentMedicineItem {
  medicineId: number
  noOfDays: number
  whenToTake: string
  isBeforeMeal: boolean
}

export interface PaymentLabTestItem {
  testId: number
  price: number
}

/* =====================================================
   DETAIL (EDIT PAYMENT / CONSULTATION)
===================================================== */

export interface PaymentDetailDto {
  id: number
  visitId: string | null
  patientId: number
  doctorId: number | null
  patientType: string
  checkupDate: string
  nextVisitDate: string

  symptoms: string
  diagnosis: string
  hpi: string
  vitalSigns: string
  physicalExamination: string

  advice: string
  comments: string

  bpSystolic?: number | null
  bpDiastolic?: number | null
  respirationRate?: number | null
  temperature?: number | null

  medicines: PaymentMedicineItem[]
  labTests: PaymentLabTestItem[]

  paymentAccountId: string | null
  discountAmount?: number
  refundAmount?: number
  status?: PaymentStatus
}

/* =====================================================
   CREATE / UPDATE (EDIT CONSULTATION PAYMENT)
===================================================== */

export interface PaymentEditDto {
  patientId: number
  doctorId: number
  patientType: string
  checkupDate: string
  nextVisitDate: string
  doctorFee: number

  symptoms: string
  diagnosis: string
  hpi: string
  vitalSigns: string
  physicalExamination: string

  advice: string
  comments: string

  bpSystolic?: number | null
  bpDiastolic?: number | null
  respirationRate?: number | null
  temperature?: number | null

  medicines: PaymentMedicineItem[]
  labTests: PaymentLabTestItem[]

  paymentAccountId: string | null
  discountAmount?: number
  refundAmount?: number
}

/* =====================================================
   SIMPLE PAYMENT CREATE (NON-CONSULTATION)
===================================================== */

export interface SimplePaymentCreateDto {
  paymentDate: string
  patientId: number
  categoryId: number
  description?: string
  amount: number
  discount: number
  paidAmount: number
  paymentAccountId: string
  paymentMode: string
  referenceNo?: string
  remarks?: string
}

/* =====================================================
   INVOICE / VIEW DTO (DETAIL, PRINT, THERMAL)
===================================================== */

export interface PaymentDetailResponse {
  id: number
  receiptNo: string
  paymentDate: string
  status: 'Draft' | 'Posted' | 'Cancelled'
  categoryName: string

  patient: {
    id: number
    fullName: string
    age?: number
    gender?: string
    panel?: string
    mrNo?: string
    phoneNo?: string
    bedNo?: string | null
  }

  details: {
    id: number
    description: string
    amount: number
    discount: number
    netAmount: number
  }[]

  totalAmount: number
  totalDiscount: number
  netAmount: number
  paidAmount: number
  balanceAmount: number

  paymentAccountName: string
  paymentMode: string
  referenceNo: string | null
  remarks: string | null

  history: {
    id: number
    paymentMode: string
    referenceNo: string | null
    remarks: string | null
    createdOn: string
    createdBy: string
  }[]
}

export interface PaymentItemDto {
  id?: number
  paymentCategoryId: number
  paymentCategoryName?: string
  quantity: number
  unitPrice: number
  totalAmount: number
}

export interface PaymentModeDto {
  id?: number
  paymentMode: 'Cash' | 'Card' | 'Bank'
  amount: number
  referenceNo?: string | null
}

export interface PaymentFormDto {
  id?: number
  patientId: number
  visitId?: number | null

  items: PaymentItemDto[]
  paymentModes: PaymentModeDto[]

  paidAmount: number
  subTotal: number
  grandTotal: number
  dueAmount: number

  commonCharge: number
  discount: number
  tax: number

  hasInsurance: boolean
  insuranceNo?: string | null
  insuranceCompanyId?: number | null
  insuranceCoverage?: number | null

  currencyId: number
}

/* =====================================================
   BACKEND (MVC) – PAYMENT EDIT SUPPORT
   (DO NOT REMOVE EXISTING TYPES)
===================================================== */

/** From: LoadddlPaymentCategories */
export interface PaymentCategoryDto {
  code: string // PaymentItemCode
  name: string // "Consultation, Unit Prize: 500"
}

/** From: PaymentsDetailsCRUDViewModel */
export interface PaymentItemCrudDto {
  id?: number
  paymentsId?: number | null
  itemDetailId?: number | null
  paymentItemCode: string
  paymentItemName?: string
  quantity: number
  unitPrize: number
  totalAmount: number
  paymentType?: number | null
}

export interface PaymentItemCrudRaw {
  Id?: number
  PaymentsId?: number | null
  ItemDetailId?: number | null
  PaymentItemCode: string
  PaymentItemName: string
  Quantity: number
  UnitPrize: number
  TotalAmount: number
  PaymentType?: number | null
}

/** From: PaymentModeHistoryCRUDViewModel */
export interface PaymentModeHistoryDto {
  id?: number
  paymentId?: number | null
  modeOfPayment: 'Cash' | 'Bank' | 'Card'
  amount: number
  referenceNo?: string | null
}

/** From: ManagePaymentsViewModel */
export interface ManagePaymentsDto {
  paymentsCRUDViewModel: {
    id?: number
    patientId: number
    visitId: string

    commonCharge: number
    discount: number
    discountAmount: number
    tax: number
    taxAmount: number

    subTotal: number
    grandTotal: number
    paidAmount: number
    dueAmount: number
    changedAmount: number
    phoneNo?: string
    insuranceNo?: string | null
    insuranceCompanyId?: number | null
    insuranceCompanyName?: string | null
    insuranceCoverage?: number | null
    insuranceAmount?: number | null

    currencyId: number
    paymentStatus?: string
    currentURL?: string
    userRole?: string
  }

  listPaymentsDetailsCRUDViewModel: PaymentItemCrudDto[]
  listPaymentModeHistoryCRUDViewModel: PaymentModeHistoryDto[]
}

export interface ManagePaymentsApiResponse {
  PaymentsCRUDViewModel: ManagePaymentsDto['paymentsCRUDViewModel']
  listPaymentsDetailsCRUDViewModel: PaymentItemCrudDto[]
  listPaymentModeHistoryCRUDViewModel: PaymentModeHistoryDto[]
  patientName: string
}

/* =====================================================
   PRINT INVOICE DTO
===================================================== */

export interface PaymentDetailItem {
  id: number
  description: string
  quantity?: number
  unitPrice?: number
  amount: number
  discount: number
  netAmount: number
}

export interface PatientInfo {
  id: number
  fullName: string
  age?: number
  gender?: string
  mrNo?: string
  panel?: string
  Panel?: string
  ageDisplay?: string
  ageUnit?: string
  bedNo?: string | null
  phoneNo?: string
}


export interface PaymentPrintResponse {
  id: number
  visitId: string            // ✅ FIXED (API returns string)
  receiptNo: string
  paymentDate: string
  status: PaymentStatus      // ✅ includes Paid
panel?: string              // ✅ added in API
  Panel?: string            // ✅ add
  patientType?: string      // ✅ add
  PatientType?: string      // ✅ add

  patient: PatientInfo
  patientName: string

  totalAmount: number
  totalDiscount: number
  netAmount: number
  paidAmount: number
  balanceAmount: number

  // ✅ doctor fields (added in API)
  doctorId?: number | null
  doctorName?: string | null
  doctorMobile?: string | null

  details: PaymentDetailItem[]
}
