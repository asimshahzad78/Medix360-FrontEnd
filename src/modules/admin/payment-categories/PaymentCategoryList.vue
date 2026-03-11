<template>
  <div class="patient-page">
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" @click="openAdd">+ Add New</button>
      </div>

      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search here" />
        <span class="icon">🔍</span>
      </div>
    </div>

    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" />
    </div>

    <div v-else class="card">
      <div class="table-wrap">
        <table class="patient-table">
          <thead>
            <tr>
              <th class="text-left col-code">Code</th>
              <th class="text-left col-name">Name</th>
              <th class="text-left col-price">Price</th>
              <th class="text-left col-cc">Counter Closing</th>
              <th class="text-left col-rev">Revenue Account</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in filtered" :key="c.id">
              <td class="col-code">{{ c.paymentItemCode }}</td>
              <td class="col-name">{{ c.name }}</td>
              <td class="col-price">{{ c.unitPrice }}</td>

              <!-- ✅ toggle switch like modal -->
              <td class="col-cc">
                <div class="cc-toggle">
                  <label class="switch">
                    <input type="checkbox" :checked="c.includeInCounterClosing" :disabled="!!updating[c.id]"
                      @change="toggleCounterClosing(c, ($event.target as HTMLInputElement).checked)" />
                    <span class="slider"></span>
                  </label>
                  <span v-if="updating[c.id]" class="cc-saving">Saving...</span>
                </div>
              </td>

              <td class="col-rev">{{ c.revenueAccountName || '-' }}</td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="Edit" @click="openEdit(c)">
                  ✏️
                </button>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="6" class="no-records">No records</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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

    // ✅ reactive map for “saving” state (per row)
    const updating = ref<Record<number, boolean>>({})

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
          revenueAccountName: i.RevenueAccountName ?? '',
          includeInCounterClosing: !!i.IncludeInCounterClosing,
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

    const toggleCounterClosing = async (c: PaymentCategoryListItem, checked: boolean) => {
      const old = c.includeInCounterClosing
      c.includeInCounterClosing = checked
      updating.value[c.id] = true

      try {
        await paymentCategoryService.setCounterClosing(c.id, checked)
      } catch {
        c.includeInCounterClosing = old
        alert('Failed to update counter closing flag.')
      } finally {
        updating.value[c.id] = false
      }
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
      toggleCounterClosing,
      updating,
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

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

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.patient-table {
  width: 100%;
  min-width: 820px;
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

/* ✅ toggle styling (same as modal) */
.cc-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cc-saving {
  font-size: 12px;
  color: #6b7280;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 999px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.switch input:checked+.slider {
  background-color: #34c759;
}

.switch input:checked+.slider:before {
  transform: translateX(20px);
}

.switch input:disabled+.slider {
  opacity: 0.6;
  cursor: not-allowed;
}

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

  .patient-table {
    min-width: 740px;
  }
}
</style>
