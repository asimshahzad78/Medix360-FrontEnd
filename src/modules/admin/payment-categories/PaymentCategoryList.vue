<template>
  <div class="patient-page">
    <!-- Header -->
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" @click="openAdd">+ Add New</button>
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
      <!-- ✅ responsive wrapper -->
      <div class="table-wrap">
        <table class="patient-table">
          <thead>
            <tr>
              <th class="text-left col-code">Code</th>
              <th class="text-left col-name">Name</th>
              <th class="text-left col-price">Price</th>
              <th class="text-left col-rev">Revenue Account</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in filtered" :key="c.id">
              <td class="col-code">{{ c.paymentItemCode }}</td>
              <td class="col-name">{{ c.name }}</td>
              <td class="col-price">{{ c.unitPrice }}</td>
              <td class="col-rev">{{ c.revenueAccountName || '-' }}</td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="Edit" @click="openEdit(c)">
                  ✏️
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="5" class="no-records">No records</td>
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

    <!-- Modal -->
    <Teleport to="body">
      <PaymentCategoryFormModal v-if="showForm" :categoryId="selected?.id" @saved="reload" @close="close" />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { paymentCategoryService, type PaymentCategoryApiDto } from './paymentCategory.service'
import PaymentCategoryFormModal from './PaymentCategoryFormModal.vue'
import type { PaymentCategoryListItem } from './paymentCategory.types'

export default defineComponent({
  components: { PaymentCategoryFormModal },

  setup() {
    const items = ref<PaymentCategoryListItem[]>([])
    const loading = ref(false)
    const search = ref('')
    const showForm = ref(false)
    const selected = ref<PaymentCategoryListItem | null>(null)

    const page = ref(1)
    const pageSize = ref(25)
    const totalCount = ref(0)

    const load = async () => {
      loading.value = true
      try {
        const res: PaymentCategoryApiDto[] = await paymentCategoryService.getAll()
        totalCount.value = res.length
        items.value = res.map((i) => ({
          id: i.Id,
          paymentItemCode: i.PaymentItemCode,
          name: i.Name,
          unitPrice: i.UnitPrice,
          revenueAccountName: '',
        }))
      } finally {
        loading.value = false
      }
    }

    const filtered = computed(() => {
      if (!search.value) return items.value
      const t = search.value.toLowerCase()
      return items.value.filter((i) => (i.name + i.paymentItemCode).toLowerCase().includes(t))
    })

    const startRecord = computed(() =>
      totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
    )
    const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

    const changePage = (p: number) => {
      page.value = p
    }

    const openAdd = () => {
      selected.value = null
      showForm.value = true
    }

    const openEdit = (c: PaymentCategoryListItem) => {
      selected.value = c
      showForm.value = true
    }

    const close = () => {
      showForm.value = false
      selected.value = null
    }

    const reload = () => {
      close()
      load()
    }

    watch(search, () => {
      page.value = 1
    })

    onMounted(load)

    return {
      search,
      loading,
      filtered,
      page,
      pageSize,
      totalCount,
      startRecord,
      endRecord,
      changePage,
      openAdd,
      openEdit,
      showForm,
      selected,
      close,
      reload,
    }
  },
})
</script>

<style scoped>
.patient-page {
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

.action-bar {
  margin: 0;
}

/* ✅ search pill (perfect mobile) */
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

.card {
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* ✅ safe scroll wrapper */
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.patient-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

.patient-table th,
.patient-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.patient-table tbody tr:hover {
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

/* ✅ actions as buttons (touch friendly) */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
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

/* ✅ mobile tuning */
@media (max-width: 640px) {
  .patient-page {
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

  /* Optional: hide Revenue Account on very small screens */
  .col-rev,
  th.col-rev {
    display: none;
  }

  .patient-table {
    min-width: 520px;
  }
}
</style>
