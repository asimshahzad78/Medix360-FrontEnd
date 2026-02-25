<template>
  <div class="revenue-page">
    <!-- Header -->
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" disabled title="Revenue vouchers are created from OPD / IPD billing">
          + Add Revenue Voucher
        </button>
      </div>

      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search here" />
        <span class="icon">🔍</span>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" />
    </div>

    <!-- Table -->
    <div v-else class="card">
      <div class="table-wrap">
        <table class="voucher-table">
          <thead>
            <tr>
              <th class="text-left col-date">Date</th>
              <th class="text-left col-inv">Invoice #</th>
              <th class="text-left col-patient">Patient</th>
              <th class="text-left col-doctor">Doctor</th>
              <th class="text-left col-amt">Net Amount</th>
              <th class="text-left col-status">Status</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="v in filtered" :key="v.Id">
              <td class="col-date">{{ formatDate(v.VoucherDate) }}</td>
              <td class="col-inv">{{ v.InvoiceNumber ?? '-' }}</td>
              <td class="col-patient">{{ v.PatientId }}</td>
              <td class="col-doctor">{{ v.DoctorId ?? '-' }}</td>
              <td class="col-amt">{{ v.NetAmount.toFixed(2) }}</td>

              <td class="col-status">
                <span class="status-pill" :class="statusClass(v.Status)">
                  {{ statusLabel(v.Status) }}
                </span>
              </td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="View" @click="openView(v.Id)">
                  👁
                </button>

                <button v-if="canReverse(v.Status)" class="icon-btn" type="button" title="Reverse Voucher"
                  @click="reverseVoucher(v)">
                  🔁
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="7" class="no-records">No records</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- View Modal -->
    <Teleport to="body">
      <RevenueVoucherViewModal v-if="viewId" :voucherId="viewId" @close="viewId = null" />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { revenueVoucherService } from './revenueVoucher.service'
import { RevenueVoucherStatus, type RevenueVoucherApiDto } from './revenueVoucher.types'
import RevenueVoucherViewModal from './RevenueVoucherViewModal.vue'
import { systemContext } from '@/services/systemContext'

export default defineComponent({
  components: { RevenueVoucherViewModal },

  setup() {
    const loading = ref(false)
    const list = ref<RevenueVoucherApiDto[]>([])
    const search = ref('')
    const viewId = ref<string | null>(null)

    const load = async () => {
      loading.value = true
      list.value = await revenueVoucherService.getAll(systemContext.tenantId, systemContext.propertyId)
      loading.value = false
    }

    const filtered = computed(() => {
      if (!search.value) return list.value
      const t = search.value.toLowerCase()
      return list.value.filter((x) =>
        (x.InvoiceNumber + x.PatientId + x.DoctorId + x.NetAmount + x.Status)
          .toString()
          .toLowerCase()
          .includes(t),
      )
    })

    const statusLabel = (s: RevenueVoucherStatus) => RevenueVoucherStatus[s]

    const statusClass = (s: RevenueVoucherStatus) => {
      if (s === RevenueVoucherStatus.Posted) return 'posted'
      if (s === RevenueVoucherStatus.Reversed) return 'reversed'
      if (s === RevenueVoucherStatus.Cancelled) return 'cancelled'
      return 'draft'
    }

    const canReverse = (s: RevenueVoucherStatus) => s === RevenueVoucherStatus.Posted

    const openView = (id: string) => (viewId.value = id)

    const reverseVoucher = async (v: RevenueVoucherApiDto) => {
      if (!confirm('Reverse this voucher?')) return
      await revenueVoucherService.reverse(
        v.Id,
        systemContext.tenantId,
        systemContext.propertyId,
        'User reversal',
      )
      await load()
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString()

    onMounted(load)

    return {
      search,
      loading,
      filtered,
      viewId,
      openView,
      statusLabel,
      statusClass,
      canReverse,
      reverseVoucher,
      formatDate,
    }
  },
})
</script>

<style scoped>
.revenue-page {
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
  margin-bottom: 16px;
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
  cursor: not-allowed;
  opacity: 0.6;
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

/* card + table */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.voucher-table {
  width: 100%;
  min-width: 860px;
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

/* actions */
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

/* status pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-pill.posted {
  background: #d1e7dd;
  color: #0f5132;
}

.status-pill.reversed {
  background: #cff4fc;
  color: #055160;
}

.status-pill.cancelled {
  background: #f8d7da;
  color: #842029;
}

.status-pill.draft {
  background: #fff3cd;
  color: #664d03;
}

.loader-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

/* ✅ mobile */
@media (max-width: 640px) {
  .revenue-page {
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

  /* optional: hide Doctor on very small screens */
  .col-doctor,
  th.col-doctor {
    display: none;
  }

  .voucher-table {
    min-width: 720px;
  }
}
</style>
