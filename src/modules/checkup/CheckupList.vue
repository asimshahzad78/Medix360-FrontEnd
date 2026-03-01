<template>
  <div class="checkup-page">
    <!-- Header -->
    <div class="page-header">
      <div class="left"></div>

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
      <!-- ✅ responsive table wrapper -->
      <div class="table-wrap">
        <table class="checkup-table">
          <thead>
            <tr>
              <th class="text-left col-id">ID</th>
              <th class="text-left col-visit">Visit</th>
              <th class="text-left col-patient">Patient</th>
              <th class="text-left col-doctor">Doctor</th>
              <th class="text-left col-symptoms">Symptoms</th>
              <th class="text-left col-diagnosis">Diagnosis</th>
              <th class="text-left col-advice">Advice</th>
              <th class="text-left col-date">Date</th>
              <th class="text-left col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="c in filteredCheckups" :key="c.id">
              <td class="col-id">{{ c.id }}</td>
              <td class="col-visit">{{ c.visitId }}</td>
              <td class="col-patient">{{ c.patientName }}</td>
              <td class="col-doctor">{{ c.doctorName }}</td>
              <td class="ellipsis col-symptoms">{{ c.symptoms }}</td>
              <td class="ellipsis col-diagnosis">{{ c.diagnosis }}</td>
              <td class="ellipsis col-advice">{{ c.advice }}</td>
              <td class="col-date">{{ formatDate(c.checkupDate) }}</td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="View">👁️</button>
                <button class="icon-btn" type="button" title="Edit">✏️</button>
                <button class="icon-btn" type="button" title="Delete" @click="deleteCheckup(c)">🗑️</button>
              </td>
            </tr>

            <tr v-if="filteredCheckups.length === 0">
              <td colspan="10" class="no-records">No records</td>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { checkupService, type CheckupListDto } from './checkup.service'

export default defineComponent({
  setup() {
    const checkups = ref<CheckupListDto[]>([])
    const search = ref('')
    const loading = ref(false)

    const page = ref(1)
    const pageSize = ref(25)
    const totalCount = ref(0)

    const loadCheckups = async () => {
      loading.value = true
      const res = await checkupService.getPaged(page.value, pageSize.value, search.value)
      checkups.value = res.items
      totalCount.value = res.totalCount
      loading.value = false
    }

    const filteredCheckups = computed(() => checkups.value)

    const startRecord = computed(() =>
      totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
    )

    const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

    const changePage = (p: number) => {
      page.value = p
      loadCheckups()
    }

    const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '')

    let tmr: ReturnType<typeof setTimeout> | null = null

    watch(search, () => {
      page.value = 1
      if (tmr) clearTimeout(tmr)
      tmr = setTimeout(() => loadCheckups(), 300)
    })

    const deleteCheckup = async (c: CheckupListDto) => {
      const ok = window.confirm(`Delete checkup #${c.id}?`)
      if (!ok) return

      loading.value = true
      try {
        await checkupService.delete(c.id)
        await loadCheckups()
      } finally {
        loading.value = false
      }
    }

    onMounted(loadCheckups)

    return {
      search,
      deleteCheckup,
      loading,
      filteredCheckups,
      page,
      pageSize,
      totalCount,
      startRecord,
      endRecord,
      changePage,
      formatDate,
    }
  },
})
</script>

<style scoped>
.checkup-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

/* header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.left {
  min-width: 1px;
}

/* ✅ search bar fixed */
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

/* ✅ table wrap prevents breaking layout */
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.checkup-table {
  width: 100%;
  min-width: 1150px;
  /* 10 columns -> needs room */
  border-collapse: collapse;
}

.checkup-table th,
.checkup-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.checkup-table tbody tr:hover {
  background: #f7fbf7;
}

.no-records {
  text-align: center;
  padding: 18px;
  color: #6b7280;
}

/* better actions (touch friendly) */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-left {
  text-align: left;
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

/* ellipsis columns */
.ellipsis {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 40px;
}

/* ✅ Mobile tuning */
@media (max-width: 640px) {
  .checkup-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .card {
    padding: 8px;
  }

  /* Optional: hide heavy text columns on very small screens */
  .col-symptoms,
  .col-diagnosis,
  .col-advice,
  .col-doctor {
    display: none;
  }

  th.col-symptoms,
  th.col-diagnosis,
  th.col-advice,
  th.col-doctor {
    display: none;
  }

  /* reduce min-width accordingly */
  .checkup-table {
    min-width: 720px;
  }

  .ellipsis {
    max-width: 140px;
  }
}
</style>
