<template>
  <div class="audit-page">
    <section class="page-header">
      <div>
        <p class="eyebrow">Quality / Compliance</p>
        <h2>Audit Viewer</h2>
        <p class="subtitle">Search sensitive activity by actor, tenant, facility, module, action, date, and correlation ID.</p>
      </div>

      <div class="header-actions">
        <button type="button" :disabled="loading" @click="load">Search</button>
        <button type="button" :disabled="exporting" class="primary" @click="exportAudit">Export</button>
      </div>
    </section>

    <section class="filters">
      <label>
        <span>User</span>
        <input v-model.trim="filters.user" placeholder="Email or user ID" @keyup.enter="load" />
      </label>

      <label>
        <span>Tenant</span>
        <input v-model.trim="filters.tenantId" placeholder="Tenant ID" @keyup.enter="load" />
      </label>

      <label>
        <span>Facility</span>
        <AppLookupSelect v-model="filters.facilityId" kind="facility" placeholder="Any facility" />
      </label>

      <label>
        <span>Module</span>
        <select v-model="filters.module">
          <option value="">Any module</option>
          <option v-for="moduleName in moduleOptions" :key="moduleName" :value="moduleName">
            {{ moduleName }}
          </option>
        </select>
      </label>

      <label>
        <span>Action</span>
        <select v-model="filters.action">
          <option value="">Any action</option>
          <option v-for="action in actionOptions" :key="action" :value="action">
            {{ action }}
          </option>
        </select>
      </label>

      <label>
        <span>From</span>
        <input v-model="filters.from" type="date" />
      </label>

      <label>
        <span>To</span>
        <input v-model="filters.to" type="date" />
      </label>

      <label>
        <span>Correlation ID</span>
        <input v-model.trim="filters.correlationId" placeholder="Trace request" @keyup.enter="load" />
      </label>
    </section>

    <AppProblemDetails v-if="loadError" :problem="loadError" fallback-title="Could not load audit events" />

    <section class="results-panel">
      <div class="panel-title">
        <div>
          <h3>Audit Events</h3>
          <span>{{ result.totalCount }} matching events</span>
        </div>
        <select v-model.number="filters.pageSize" @change="load">
          <option :value="25">25 rows</option>
          <option :value="50">50 rows</option>
          <option :value="100">100 rows</option>
        </select>
      </div>

      <AppLoadingState v-if="loading" label="Loading audit trail..." />

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Tenant / Facility</th>
              <th>Module</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Correlation ID</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="entry in result.items" :key="entry.id">
              <tr>
                <td>{{ formatDate(entry.occurredAt || entry.createdAt) }}</td>
                <td>
                  <strong>{{ entry.actorEmail || entry.actorUserId || '-' }}</strong>
                  <small v-if="entry.reason">{{ entry.reason }}</small>
                </td>
                <td>
                  <span>{{ entry.tenantId || '-' }}</span>
                  <small>{{ entry.facilityId || '-' }}</small>
                </td>
                <td>{{ entry.module || entry.entityType || '-' }}</td>
                <td><span class="status">{{ entry.action || '-' }}</span></td>
                <td>
                  <span>{{ entry.entityType || '-' }}</span>
                  <small>{{ entry.entityId || '-' }}</small>
                </td>
                <td class="mono">{{ entry.correlationId || '-' }}</td>
                <td>
                  <button type="button" class="link-btn" @click="toggle(entry.id)">
                    {{ expandedId === entry.id ? 'Hide' : 'Values' }}
                  </button>
                </td>
              </tr>
              <tr v-if="expandedId === entry.id" class="diff-row">
                <td colspan="8">
                  <div class="diff-grid">
                    <article>
                      <h4>Before</h4>
                      <pre>{{ formatJson(entry.beforeValues ?? entry.beforeJson) }}</pre>
                    </article>
                    <article>
                      <h4>After</h4>
                      <pre>{{ formatJson(entry.afterValues ?? entry.afterJson) }}</pre>
                    </article>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="result.items.length === 0">
              <td colspan="8" class="empty-cell">No audit events found for the current filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <button type="button" :disabled="filters.page <= 1 || loading" @click="changePage(filters.page - 1)">Previous</button>
        <span>Page {{ filters.page }}</span>
        <button type="button" :disabled="!hasNextPage || loading" @click="changePage(filters.page + 1)">Next</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppLookupSelect from '@/components/ui/AppLookupSelect.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppProblemDetails from '@/components/ui/AppProblemDetails.vue'
import { auditService } from '@/services/audit.service'
import { createMutationState, runMutation } from '@/services/mutations'
import { useToastStore } from '@/store/toast.store'
import type { AuditSearchFilters, AuditSearchResult } from '@/types/audit'

const moduleOptions = [
  'Platform',
  'Patients',
  'OPD',
  'Emergency',
  'IPD',
  'Laboratory',
  'Radiology',
  'Pharmacy',
  'Billing',
  'Finance',
  'Inventory',
  'HR',
  'Quality',
  'Analytics',
  'Interoperability',
]

const actionOptions = [
  'Create',
  'Update',
  'Cancel',
  'Void',
  'Reverse',
  'Refund',
  'Post',
  'Approve',
  'Verify',
  'Dispense',
  'StockMovement',
  'Export',
  'Login',
  'EmergencyAccess',
  'DelegatedAccess',
]

const filters = reactive<Required<Pick<AuditSearchFilters, 'page' | 'pageSize'>> & Omit<AuditSearchFilters, 'page' | 'pageSize'>>({
  user: '',
  tenantId: '',
  facilityId: '',
  module: '',
  action: '',
  from: '',
  to: '',
  correlationId: '',
  page: 1,
  pageSize: 25,
})

const result = ref<AuditSearchResult>({
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 25,
})
const expandedId = ref<string | null>(null)
const loadState = createMutationState()
const exportState = createMutationState()
const toast = useToastStore()

const loading = computed(() => loadState.loading.value)
const exporting = computed(() => exportState.loading.value)
const loadError = computed(() => loadState.error.value)
const hasNextPage = computed(() => filters.page * filters.pageSize < result.value.totalCount)

const load = async () => {
  const data = await runMutation(loadState, () => auditService.search({ ...filters }), {
    showErrorToast: false,
    showSuccessToast: false,
  })

  if (!data) return

  result.value = data
  expandedId.value = null
}

const changePage = async (page: number) => {
  filters.page = page
  await load()
}

const exportAudit = async () => {
  const blob = await runMutation(exportState, () => auditService.export({ ...filters }), {
    showSuccessToast: false,
    successMessage: 'Audit export prepared.',
  })

  if (!blob) return

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
  toast.success('Audit export downloaded')
}

const toggle = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const formatDate = (value?: string | null): string => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

const formatJson = (value: unknown): string => {
  if (!value) return 'No values captured.'

  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }

  return JSON.stringify(value, null, 2)
}

onMounted(load)
</script>

<style scoped>
.audit-page {
  min-height: 100vh;
  background: #f4f9f4;
  padding: 24px;
}

.page-header,
.filters,
.results-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.eyebrow,
.subtitle,
.panel-title span,
td small {
  color: #64748b;
  font-size: 13px;
}

.eyebrow {
  margin: 0 0 4px;
  font-weight: 800;
  text-transform: uppercase;
}

h2,
h3,
h4,
p {
  margin: 0;
}

h2,
h3,
h4 {
  color: #0f172a;
}

.subtitle {
  margin-top: 6px;
}

.header-actions,
.pager {
  display: flex;
  gap: 8px;
  align-items: center;
}

button,
select,
input {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  font-size: 13px;
}

button {
  background: #fff;
  padding: 9px 12px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

button.primary {
  border-color: #166534;
  background: #166534;
  color: #fff;
}

.link-btn {
  border: none;
  color: #166534;
  font-weight: 800;
  padding: 0;
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

label {
  display: grid;
  gap: 5px;
}

label span {
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

input,
select {
  height: 36px;
  padding: 0 10px;
  width: 100%;
}

.results-panel {
  padding: 16px;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1100px;
}

th,
td {
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  vertical-align: top;
}

th {
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
  white-space: nowrap;
}

td strong,
td span {
  display: block;
}

.status {
  display: inline-flex;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 9px;
}

.mono {
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.diff-row td {
  background: #f8fafc;
}

.diff-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.diff-grid article {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  padding: 12px;
  min-width: 0;
}

pre {
  max-height: 320px;
  overflow: auto;
  margin: 10px 0 0;
  color: #334155;
  font-size: 12px;
  white-space: pre-wrap;
}

.empty-cell {
  color: #64748b;
  text-align: center;
}

.pager {
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 1100px) {
  .filters {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }

  .diff-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .audit-page {
    padding: 14px;
  }

  .page-header,
  .panel-title {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
