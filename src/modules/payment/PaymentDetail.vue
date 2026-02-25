<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PaymentService } from './payment.service'

/* =======================
   TYPES (FROM BACKEND MODELS)
======================= */

type PaymentStatus = 'Draft' | 'Posted' | 'Cancelled'

interface PaymentDetailItem {
  id: number
  description: string
  amount: number
  discount: number
  netAmount: number
}

interface PaymentModeHistory {
  id: number
  paymentMode: string
  referenceNo: string | null
  remarks: string | null
  createdOn: string
  createdBy: string
}

interface PatientInfo {
  id: number
  fullName: string
  age?: number
  gender?: string
  mrNo?: string
  bedNo?: string | null
}

interface PaymentDetailResponse {
  id: number
  receiptNo: string
  paymentDate: string
  status: PaymentStatus
  categoryName: string

  patient: PatientInfo

  details: PaymentDetailItem[]

  totalAmount: number
  totalDiscount: number
  netAmount: number
  paidAmount: number
  balanceAmount: number

  paymentAccountName: string
  paymentMode: string
  referenceNo: string | null
  remarks: string | null

  history: PaymentModeHistory[]
}

/* =======================
   STATE
======================= */

const route = useRoute()
const router = useRouter()

const loading = ref<boolean>(false)
const payment = ref<PaymentDetailResponse | null>(null)

/* =======================
   COMPUTED
======================= */

const paymentId = computed<number>(() => {
  return Number(route.params.id)
})

const isDraft = computed<boolean>(() => {
  return payment.value?.status === 'Draft'
})

/* =======================
   METHODS
======================= */

const loadPayment = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await PaymentService.getInvoiceById(paymentId.value)
    payment.value = res
  } finally {
    loading.value = false
  }
}

const goBack = (): void => {
  router.push({ name: 'PaymentList' })
}

const editPayment = (): void => {
  if (!payment.value || payment.value.status !== 'Draft') return
  router.push({ name: 'PaymentDetail', params: { id: payment.value.id } })
}

const printA4 = (): void => {
  window.open(`/payments/${paymentId.value}/print`, '_blank')
}

const printThermal = (): void => {
  window.open(`/payments/${paymentId.value}/thermal`, '_blank')
}

/* =======================
   LIFECYCLE
======================= */

onMounted(loadPayment)
</script>

<template>
  <div class="page-wrapper" v-if="payment">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h2>🧾 Payment Invoice</h2>
        <small>
          Receipt #: <strong>{{ payment.receiptNo }}</strong> | Date: {{ payment.paymentDate }}
        </small>
      </div>

      <div class="actions">
        <button v-if="isDraft" class="btn btn-warning" @click="editPayment">✏️ Edit</button>
        <button class="btn btn-secondary" @click="printA4">🖨️ Print</button>
        <button class="btn btn-secondary" @click="printThermal">🧾 Thermal</button>
        <button class="btn btn-light" @click="goBack">⬅ Back</button>
      </div>
    </div>

    <!-- STATUS -->
    <div class="status-strip" :class="{
      draft: payment.status === 'Draft',
      posted: payment.status === 'Posted',
      cancelled: payment.status === 'Cancelled',
    }">
      {{ payment.status }}
    </div>

    <!-- INFO -->
    <div class="card grid-2">
      <div>
        <h4>Patient</h4>
        <p>
          <strong>{{ payment.patient.fullName }}</strong>
        </p>
        <p v-if="payment.patient.mrNo">MR No: {{ payment.patient.mrNo }}</p>
        <p v-if="payment.patient.age">
          Age: {{ payment.patient.age }} | {{ payment.patient.gender }}
        </p>
        <p v-if="payment.patient.bedNo">Bed No: {{ payment.patient.bedNo }}</p>
      </div>

      <div>
        <h4>Invoice Info</h4>
        <p>Category: {{ payment.categoryName }}</p>
        <p>Payment Date: {{ payment.paymentDate }}</p>
      </div>
    </div>

    <!-- DETAILS TABLE -->
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Amount</th>
            <th class="text-right">Discount</th>
            <th class="text-right">Net</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in payment.details" :key="row.id">
            <td>{{ row.description }}</td>
            <td class="text-right">{{ row.amount }}</td>
            <td class="text-right">{{ row.discount }}</td>
            <td class="text-right">{{ row.netAmount }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TOTALS -->
    <div class="totals">
      <div>
        Total Amount: <strong>{{ payment.totalAmount }}</strong>
      </div>
      <div>
        Total Discount: <strong>{{ payment.totalDiscount }}</strong>
      </div>
      <div>
        Net Amount: <strong>{{ payment.netAmount }}</strong>
      </div>
      <div>
        Paid: <strong>{{ payment.paidAmount }}</strong>
      </div>
      <div>
        Balance: <strong>{{ payment.balanceAmount }}</strong>
      </div>
    </div>

    <!-- PAYMENT MODE -->
    <div class="card">
      <h4>Payment Mode</h4>
      <p>Account: {{ payment.paymentAccountName }}</p>
      <p>Mode: {{ payment.paymentMode }}</p>
      <p v-if="payment.referenceNo">Reference: {{ payment.referenceNo }}</p>
      <p v-if="payment.remarks">Remarks: {{ payment.remarks }}</p>
    </div>

    <!-- HISTORY -->
    <div class="card" v-if="payment.history.length">
      <h4>Payment History</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>User</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in payment.history" :key="h.id">
            <td>{{ h.createdOn }}</td>
            <td>{{ h.paymentMode }}</td>
            <td>{{ h.createdBy }}</td>
            <td>{{ h.remarks }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-else-if="loading" class="text-center">Loading…</div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions button {
  margin-left: 6px;
}

.status-strip {
  margin: 10px 0;
  padding: 8px;
  font-weight: bold;
  border-radius: 4px;
}

.status-strip.draft {
  background: #e0e7ff;
  color: #1e3a8a;
}

.status-strip.posted {
  background: #dcfce7;
  color: #166534;
}

.status-strip.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.text-right {
  text-align: right;
}

.totals {
  margin: 16px 0;
  display: flex;
  justify-content: flex-end;
  gap: 24px;
  font-weight: 500;
}
</style>
