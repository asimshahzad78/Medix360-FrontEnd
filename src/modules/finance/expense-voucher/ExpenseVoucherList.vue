<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import ExpenseVoucherFormModal from './ExpenseVoucherFormModal.vue'
import { expenseVoucherService } from './expense-voucher.service'
import type {
  ExpenseVoucherListItem,
  ExpenseVoucherApiDto,
  ExpenseVoucherStatus,
} from './expense-voucher.types'
import { coaService } from '../coa/coa.service'
import type { ChartOfAccountUiDto } from '../coa/coa.types'

function safeStr(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function normalizeStatus(v: unknown): ExpenseVoucherStatus {
  const s = safeStr(v)
  if (s === 'Paid') return 'Paid'
  if (s === 'Cancelled') return 'Cancelled'
  return 'Unpaid'
}

export default defineComponent({
  components: { ExpenseVoucherFormModal },

  setup() {
    const loading = ref(false)
    const search = ref('')

    const page = ref(1)
    const pageSize = ref(25)

    const showForm = ref(false)
    const selectedId = ref<string | null>(null)

    const vouchers = ref<ExpenseVoucherListItem[]>([])
    const accounts = ref<ChartOfAccountUiDto[]>([])

    const paymentAccountFilter = ref('')
    const cashOnly = ref(false)

    const paymentAccounts = computed((): ChartOfAccountUiDto[] =>
      accounts.value.filter(
        (a: ChartOfAccountUiDto) => a.isLeaf && a.isActive && a.typeLabel === 'Asset',
      ),
    )

    const cashAccountIds = computed((): string[] => {
      return paymentAccounts.value
        .filter(
          (a: ChartOfAccountUiDto) =>
            a.name.toLowerCase().includes('cash in hand') || a.code === '1110',
        )
        .map((a: ChartOfAccountUiDto) => a.id)
    })

    const formatDate = (iso: string) => (iso ? iso.slice(0, 10) : '')
    const formatMoney = (n: number) => `Rs ${Number.isFinite(n) ? n.toFixed(2) : '0.00'}`

    const mapToListItem = (x: ExpenseVoucherApiDto): ExpenseVoucherListItem => {
      const id = safeStr(x.Id) || crypto.randomUUID()
      const expenseAccountId = safeStr(x.ExpenseAccountId)
      const paymentAccountId = safeStr(x.BankAccountId)

      const expenseAcc = accounts.value.find((a: ChartOfAccountUiDto) => a.id === expenseAccountId)
      const payAcc = accounts.value.find((a: ChartOfAccountUiDto) => a.id === paymentAccountId)

      return {
        id,
        voucherNo: safeStr(x.VoucherNo) || id.slice(0, 8),
        date: x.Date,
        description: safeStr(x.Description),
        amount: x.Amount ?? 0,
        status: normalizeStatus(x.Status),
        expenseAccountId,
        paymentAccountId,
        expenseAccountName: expenseAcc?.name,
        paymentAccountName: payAcc?.name,
      }
    }

    const load = async () => {
      loading.value = true
      accounts.value = await coaService.getAllUi()
      const data = await expenseVoucherService.getAll()
      vouchers.value = data.map(mapToListItem)
      loading.value = false
    }

    const filteredItems = computed((): ExpenseVoucherListItem[] => {
      const t = search.value.trim().toLowerCase()
      let list: ExpenseVoucherListItem[] = vouchers.value

      if (t) {
        list = list.filter((v: ExpenseVoucherListItem) => {
          const hay =
            `${v.voucherNo} ${v.description} ${v.expenseAccountName ?? ''} ${v.paymentAccountName ?? ''}`.toLowerCase()
          return hay.includes(t)
        })
      }

      if (paymentAccountFilter.value) {
        list = list.filter(
          (v: ExpenseVoucherListItem) => v.paymentAccountId === paymentAccountFilter.value,
        )
      }

      if (cashOnly.value) {
        const set = new Set<string>(cashAccountIds.value)
        list = list.filter((v: ExpenseVoucherListItem) => set.has(v.paymentAccountId))
      }

      return [...list].sort((a: ExpenseVoucherListItem, b: ExpenseVoucherListItem) =>
        a.date < b.date ? 1 : -1,
      )
    })

    const pagedItems = computed((): ExpenseVoucherListItem[] => {
      const start = (page.value - 1) * pageSize.value
      return filteredItems.value.slice(start, start + pageSize.value)
    })

    const startRecord = computed(() =>
      filteredItems.value.length === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
    )
    const endRecord = computed(() =>
      Math.min(page.value * pageSize.value, filteredItems.value.length),
    )

    const changePage = (p: number) => {
      page.value = p
    }

    // ✅ Paid-now model
    const canEdit = (v: ExpenseVoucherListItem) => v.status === 'Unpaid'
    const canDelete = (v: ExpenseVoucherListItem) => v.status === 'Unpaid'
    const canPost = (v: ExpenseVoucherListItem) => v.status === 'Unpaid'
    const canReverse = (v: ExpenseVoucherListItem) => v.status === 'Paid'

    const openAddModal = () => {
      selectedId.value = null
      showForm.value = true
    }

    const openEditModal = (v: ExpenseVoucherListItem) => {
      if (!canEdit(v)) return
      selectedId.value = v.id
      showForm.value = true
    }

    const closeModals = () => {
      showForm.value = false
      selectedId.value = null
    }

    const reload = async () => {
      closeModals()
      await load()
    }

    const postVoucher = async (v: ExpenseVoucherListItem) => {
      if (!canPost(v)) return
      await expenseVoucherService.post(v.id)
      await load()
    }

    const reverseVoucher = async (v: ExpenseVoucherListItem) => {
      if (!canReverse(v)) return
      await expenseVoucherService.reverse(v.id)
      await load()
    }

    const deleteVoucher = async (v: ExpenseVoucherListItem) => {
      if (!canDelete(v)) return
      await expenseVoucherService.delete(v.id)
      await load()
    }

    onMounted(load)

    return {
      loading,
      search,
      page,
      pageSize,
      changePage,

      showForm,
      selectedId,

      openAddModal,
      openEditModal,
      closeModals,
      reload,

      pagedItems,
      filteredItems,
      startRecord,
      endRecord,

      formatDate,
      formatMoney,

      postVoucher,
      reverseVoucher,
      deleteVoucher,

      canEdit,
      canPost,
      canReverse,
      canDelete,

      paymentAccountFilter,
      cashOnly,
      paymentAccounts,
    }
  },
})
</script>

<template>
  <div class="expense-page">
    <!-- Header -->
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" @click="openAddModal">+ Add New</button>
      </div>

      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search here" />
        <span class="icon">🔍</span>
      </div>
    </div>

    <!-- Quick Filters -->
    <div class="filters card">
      <div class="filter-row">
        <div class="field">
          <label>Payment Account</label>
          <select v-model="paymentAccountFilter">
            <option value="">All</option>
            <option v-for="a in paymentAccounts" :key="a.id" :value="a.id">
              {{ a.name }}
            </option>
          </select>
        </div>

        <div class="field checkbox">
          <label>
            <input type="checkbox" v-model="cashOnly" />
            Counter Cash Only
          </label>
          <small class="hint">Shows expenses paid via “Cash in Hand” type accounts.</small>
        </div>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" />
    </div>

    <!-- Table -->
    <div v-else class="card">
      <!-- ✅ responsive table wrapper -->
      <div class="table-wrap">
        <table class="voucher-table">
          <thead>
            <tr>
              <th class="text-left col-vno">Voucher #</th>
              <th class="text-left col-date">Date</th>
              <th class="text-left col-head">Expense Head</th>
              <th class="text-left col-paid">Paid From</th>
              <th class="text-left col-desc">Description</th>
              <th class="text-left col-amt">Amount</th>
              <th class="text-left col-status">Status</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="v in pagedItems" :key="v.id">
              <td class="col-vno">{{ v.voucherNo }}</td>
              <td class="col-date">{{ formatDate(v.date) }}</td>
              <td class="col-head">{{ v.expenseAccountName ?? '-' }}</td>
              <td class="col-paid">{{ v.paymentAccountName ?? '-' }}</td>
              <td class="nowrap col-desc">{{ v.description }}</td>
              <td class="col-amt">{{ formatMoney(v.amount) }}</td>

              <td class="col-status">
                <span :class="[
                  'badge',
                  v.status === 'Paid' ? 'ok' : v.status === 'Cancelled' ? 'bad' : 'warn',
                ]">
                  {{ v.status }}
                </span>
              </td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="Edit" @click="openEditModal(v)" :disabled="!canEdit(v)">
                  ✏️
                </button>

                <button class="icon-btn" type="button" title="Post" @click="postVoucher(v)" :disabled="!canPost(v)">
                  ✅
                </button>

                <button class="icon-btn" type="button" title="Reverse" @click="reverseVoucher(v)"
                  :disabled="!canReverse(v)">
                  🔁
                </button>

                <button class="icon-btn" type="button" title="Delete" @click="deleteVoucher(v)"
                  :disabled="!canDelete(v)">
                  🗑️
                </button>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="8" class="no-records">No records</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <span> Showing {{ startRecord }} - {{ endRecord }} of {{ filteredItems.length }} </span>

      <div class="pagination">
        <button :disabled="page === 1" @click="changePage(page - 1)">Prev</button>
        <span>Page {{ page }}</span>
        <button :disabled="page * pageSize >= filteredItems.length" @click="changePage(page + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- MODAL -->
    <Teleport to="body">
      <ExpenseVoucherFormModal v-if="showForm" :voucherId="selectedId ?? undefined" @saved="reload"
        @close="closeModals" />
    </Teleport>
  </div>
</template>

<style scoped>
.expense-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

/* ✅ header responsive */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.action-bar {
  margin: 0;
}

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

/* cards */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

/* ✅ Filters */
.filters {
  padding: 14px 14px 10px;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  align-items: end;
}

.field {
  min-width: 0;
  /* ✅ critical: no overflow */
}

.field label {
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 6px;
}

.field select {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #d0d0d0;
  font-size: 13px;
  background: #fff;
}

.field.checkbox label {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 700;
  margin-bottom: 0;
}

.hint {
  display: block;
  font-size: 12px;
  opacity: 0.7;
  margin-top: 6px;
}

/* ✅ table */
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.voucher-table {
  width: 100%;
  min-width: 1150px;
  /* 8 columns */
  border-collapse: collapse;
}

.voucher-table th,
.voucher-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
  text-align: left;
}

.voucher-table tbody tr:hover {
  background: #f7fbf7;
}

.no-records {
  text-align: center;
  padding: 18px;
  color: #6b7280;
}

.nowrap {
  max-width: 420px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ✅ actions */
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
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

.icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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

/* badges */
.badge {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge.ok {
  background: #d1e7dd;
  color: #0f5132;
}

.badge.warn {
  background: #fff3cd;
  color: #664d03;
}

.badge.bad {
  background: #f8d7da;
  color: #842029;
}

/* ✅ mobile */
@media (max-width: 640px) {
  .expense-page {
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

  .filter-row {
    grid-template-columns: 1fr;
    /* ✅ stack filters */
    gap: 12px;
  }

  /* optional: hide Paid From on very small screens */
  .col-paid,
  th.col-paid {
    display: none;
  }

  .voucher-table {
    min-width: 920px;
  }

  .nowrap {
    max-width: 220px;
  }
}
</style>
