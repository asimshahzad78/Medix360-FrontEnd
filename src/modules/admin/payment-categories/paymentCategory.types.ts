/* =========================
   CRUD VIEW MODEL
   Mirrors: PaymentCategoriesCRUDViewModel
========================= */
export interface PaymentCategoryCrudVm {
  id: number
  paymentItemCode: string
  name: string
  unitPrice: number
  description: string
  revenueAccountId: string
}

/* =========================
   SAVE DTO (Create / Update)
   Frontend → Backend
========================= */
export interface PaymentCategorySaveDto {
  paymentItemCode: string
  name: string
  unitPrice: number
  description: string
  revenueAccountId: string
}

/* =========================
   LIST ITEM (Table View)
========================= */
export interface PaymentCategoryListItem {
  id: number
  paymentItemCode: string
  name: string
  unitPrice: number
  revenueAccountName?: string
}

/* =========================
   PAGED RESULT (Generic)
========================= */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

/* =========================
   REVENUE ACCOUNT DROPDOWN
========================= */
export interface RevenueAccountLookup {
  id: string
  name: string
}
