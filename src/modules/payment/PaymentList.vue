<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PaymentService } from './payment.service'
import PaymentFormModal from './PaymentFormModal.vue'
import type { PaymentApiItem } from './payment.types'

const router = useRouter()

const payments = ref<PaymentApiItem[]>([])
const loading = ref(false)
const search = ref('')

const page = ref(1)
const pageSize = ref(25)
const totalCount = ref(0)

// modal
const showEditModal = ref(false)
const selectedPaymentId = ref<number | null>(null)

// ---------------- LOAD LIST ----------------
const loadPayments = async () => {
  loading.value = true
  try {
    const res = await PaymentService.getPaged(page.value, pageSize.value, search.value)
    payments.value = res.data.items
    totalCount.value = res.data.totalCount
  } finally {
    loading.value = false
  }
}

const filteredPayments = computed(() => payments.value)

const startRecord = computed(() =>
  totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
)
const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

const changePage = (p: number) => {
  page.value = p
  loadPayments()
}

// ---------------- ACTIONS ----------------
const openNewPayment = () => {
  selectedPaymentId.value = null
  showEditModal.value = true
}

const viewPayment = (id: number) => {
  router.push({ name: 'PaymentDetail', params: { id } })
}

const viewInvoice = (id: number) => {
  window.open(`/payments/${id}/print`, '_blank')
}

const editPayment = (id: number) => {
  selectedPaymentId.value = id
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedPaymentId.value = null
}

let tmr: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  page.value = 1
  if (tmr) clearTimeout(tmr)
  tmr = setTimeout(() => loadPayments(), 300)
})

onMounted(loadPayments)
</script>

<template>
  <div class="payment-page">
    <!-- HEADER -->
    <div class="page-header">
      <button class="btn-add" @click="openNewPayment">+ Add Payment</button>

      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search payments..." />
        <span class="icon">🔍</span>
      </div>
    </div>

    <!-- LOADER -->
    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" />
    </div>

    <!-- TABLE -->
    <div v-else class="card">
      <div class="table-wrap">
        <table class="payment-table">
          <thead>
            <tr>
              <th class="text-left col-id">ID</th>
              <th class="text-left col-patient">Patient</th>
              <th class="text-left col-type">Type</th>
              <th class="text-left col-amount">Amount</th>
              <th class="text-left col-amount">Payment Mode</th>
              <th class="text-left col-date">Date</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in filteredPayments" :key="p.Id">
              <td class="col-id">{{ p.Id }}</td>
              <td class="col-patient">{{ p.PatientName }}</td>
              <td class="col-type">{{ p.PatientType }}</td>
              <td class="col-amount">{{ p.GrandTotal }}</td>
              <td class="col-payment-mode">{{ p.ModeOfPayment }}</td>
              <td class="col-date">{{ p.CreatedDate?.slice(0, 10) }}</td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="View" @click="viewPayment(p.Id)">
                  👁️
                </button>
                <button class="icon-btn" type="button" title="Edit" @click="editPayment(p.Id)">
                  ✏️
                </button>
                <button class="icon-btn" type="button" title="Invoice" @click="viewInvoice(p.Id)">
                  🧾
                </button>
              </td>
            </tr>

            <tr v-if="filteredPayments.length === 0">
              <td colspan="6" class="no-records">No records</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <span> Showing {{ startRecord }} - {{ endRecord }} of {{ totalCount }} </span>

      <div class="pagination">
        <button :disabled="page === 1" @click="changePage(page - 1)">Prev</button>
        <span>Page {{ page }}</span>
        <button :disabled="page * pageSize >= totalCount" @click="changePage(page + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <Teleport to="body">
      <PaymentFormModal v-if="showEditModal" :paymentId="selectedPaymentId!" @close="closeEditModal"
        @saved="loadPayments" />
    </Teleport>
  </div>
</template>

<style scoped>
.payment-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

/* ✅ responsive header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

/* button */
.btn-add {
  height: 44px;
  background: #34c759;
  color: #fff;
  border: none;
  padding: 0 18px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

/* ✅ search pill */
.search-box {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.search-box input {
  width: 100%;
  height: 44px;
  line-height: 44px;
  padding: 0 44px 0 16px;
  border-radius: 999px;
  border: 1px solid #d8e3d8;
  background: #fff;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.search-box input:focus {
  border-color: #34c759;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.15);
}

.search-box .icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  height: 22px;
  width: 22px;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0.85;
}

/* card */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* ✅ table scroll wrapper */
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.payment-table {
  width: 100%;
  min-width: 780px;
  /* safe */
  border-collapse: collapse;
}

.payment-table th,
.payment-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.payment-table tbody tr:hover {
  background: #f7fbf7;
}

.text-left {
  text-align: left;
}

.no-records {
  text-align: center;
  padding: 18px;
  color: #6b7280;
}

/* ✅ actions touch friendly */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 6px;
  border-radius: 8px;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 13px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #eee;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loader-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* ✅ mobile */
@media (max-width: 640px) {
  .payment-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
  }

  .search-box {
    max-width: 100%;
  }

  .card {
    padding: 8px;
  }

  /* Optional: hide Type on very small screens */
  .col-type,
  th.col-type {
    display: none;
  }

  .payment-table {
    min-width: 560px;
  }
}
</style>
