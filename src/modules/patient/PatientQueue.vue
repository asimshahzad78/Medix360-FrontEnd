<template>
  <div class="queue-page">
    <div class="page-header">
      <div>
        <h2>Registration Queue</h2>
        <p>Today’s OPD visits, ordered for front-desk follow-up.</p>
      </div>

      <div class="header-actions">
        <input v-model="search" type="search" placeholder="Search patient, visit, doctor" />
        <RouterLink class="btn-secondary" to="/patients">Patients</RouterLink>
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <span>Total in view</span>
        <strong>{{ totalCount }}</strong>
      </div>
      <div class="summary-card">
        <span>Current page</span>
        <strong>{{ queue.length }}</strong>
      </div>
      <div class="summary-card">
        <span>Context</span>
        <strong>{{ contextStore.displayFacility }}</strong>
      </div>
    </div>

    <div v-if="loading" class="loader">Loading queue...</div>
    <div v-else-if="loadError" class="load-error">{{ loadError }}</div>

    <div v-else class="queue-list">
      <article v-for="item in queue" :key="item.id" class="queue-card">
        <div class="queue-number">#{{ item.serialNo || item.id }}</div>

        <div class="queue-main">
          <div class="queue-top">
            <h3>{{ item.patientName }}</h3>
            <span>{{ formatDate(item.checkupDate) }}</span>
          </div>
          <div class="queue-meta">
            <span>Visit {{ item.visitId }}</span>
            <span>{{ item.doctorName || 'Doctor not assigned' }}</span>
            <span>{{ item.diagnosis || 'Awaiting diagnosis' }}</span>
          </div>
        </div>

        <div class="queue-status">Registered</div>
      </article>

      <div v-if="queue.length === 0" class="empty">No queue records found.</div>
    </div>

    <div class="table-footer">
      <span>Showing {{ startRecord }} - {{ endRecord }} of {{ totalCount }}</span>

      <div class="pagination">
        <button :disabled="page === 1" @click="changePage(page - 1)">Prev</button>
        <span>Page {{ page }}</span>
        <button :disabled="page * pageSize >= totalCount" @click="changePage(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { checkupService, type CheckupListDto } from '@/modules/checkup/checkup.service'
import { usePlatformContextStore } from '@/store/platform-context.store'
import { getApiErrorMessage } from '@/services/api-response'

const contextStore = usePlatformContextStore()

const queue = ref<CheckupListDto[]>([])
const search = ref('')
const loading = ref(false)
const loadError = ref('')
const page = ref(1)
const pageSize = ref(25)
const totalCount = ref(0)

const startRecord = computed(() =>
  totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
)
const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

const loadQueue = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const result = await checkupService.getPaged(page.value, pageSize.value, search.value)
    queue.value = result.items
    totalCount.value = result.totalCount
  } catch (error: unknown) {
    queue.value = []
    totalCount.value = 0
    loadError.value = getApiErrorMessage(error, 'Could not load registration queue.')
  } finally {
    loading.value = false
  }
}

const changePage = (nextPage: number) => {
  page.value = nextPage
  loadQueue()
}

const formatDate = (value: string) => (value ? new Date(value).toLocaleString() : 'Not dated')

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  page.value = 1
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadQueue, 300)
})

onMounted(loadQueue)
</script>

<style scoped>
.queue-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  color: #0f172a;
  font-size: 22px;
}

p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
  min-width: min(520px, 100%);
}

.header-actions input {
  flex: 1;
  min-width: 0;
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 12px;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  border-radius: 6px;
  background: #166534;
  color: #fff;
  padding: 0 14px;
  text-decoration: none;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.summary-card,
.queue-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.summary-card {
  padding: 14px;
}

.summary-card span {
  color: #64748b;
  font-size: 12px;
}

.summary-card strong {
  display: block;
  color: #0f172a;
  font-size: 20px;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-list {
  display: grid;
  gap: 10px;
}

.queue-card {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) 110px;
  gap: 14px;
  align-items: center;
  padding: 14px;
}

.queue-number {
  color: #166534;
  font-weight: 800;
}

.queue-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.queue-top h3 {
  color: #0f172a;
  font-size: 16px;
}

.queue-top span,
.queue-meta,
.queue-status {
  color: #64748b;
  font-size: 13px;
}

.queue-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}

.queue-status {
  justify-self: end;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
}

.loader,
.load-error,
.empty {
  background: #fff;
  border-radius: 8px;
  color: #64748b;
  padding: 24px;
  text-align: center;
}

.load-error {
  border: 1px solid #fecdd3;
  color: #9f1239;
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

@media (max-width: 760px) {
  .queue-page {
    padding: 14px;
  }

  .page-header,
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-grid,
  .queue-card {
    grid-template-columns: 1fr;
  }

  .queue-status {
    justify-self: start;
  }
}
</style>
