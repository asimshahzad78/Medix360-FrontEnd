<template>
  <div class="module-page">
    <section class="module-header">
      <div>
        <p class="eyebrow">{{ module }}</p>
        <h2>{{ title }}</h2>
        <p class="subtitle">{{ subtitle }}</p>
      </div>

      <div class="header-actions">
        <button type="button" :disabled="exporting" @click="exportData">
          {{ exporting ? 'Exporting...' : 'Export' }}
        </button>
        <button type="button" :disabled="loading" @click="refresh">Refresh</button>
        <button type="button" class="primary" @click="openForm">New</button>
      </div>
    </section>

    <section class="filter-panel">
      <div class="panel-title">
        <h3>Filters</h3>
        <button type="button" :disabled="loading" @click="applyFilters">Apply</button>
      </div>

      <div class="filter-grid">
        <label v-for="field in filterFields" :key="field.key" class="field">
          <span>{{ field.label }}</span>
          <AppLookupSelect
            v-if="field.type === 'lookup' && field.lookupKind"
            v-model="filters[field.key]"
            :kind="field.lookupKind"
            :placeholder="field.placeholder || field.label"
          />
          <select v-else-if="field.type === 'select'" v-model="filters[field.key]">
            <option value="">Any</option>
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <input
            v-else
            v-model.trim="filters[field.key]"
            :type="field.type"
            :placeholder="field.placeholder || field.label"
            @keyup.enter="applyFilters"
          />
        </label>
      </div>
    </section>

    <section class="kpi-grid">
      <article v-for="metric in displayMetrics" :key="metric.label" class="kpi-card">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.hint }}</small>
      </article>
    </section>

    <section class="workspace-grid">
      <article class="panel">
        <div class="panel-title">
          <h3>Workflow</h3>
          <span>{{ workflow.length }} steps</span>
        </div>

        <ol class="workflow-list">
          <li v-for="step in workflow" :key="step">
            <span>{{ step }}</span>
          </li>
        </ol>
      </article>

      <article class="panel">
        <div class="panel-title">
          <h3>Work Queue</h3>
          <input v-model.trim="search" type="search" placeholder="Search queue" />
        </div>

        <AppProblemDetails v-if="loadError" :problem="loadError" fallback-title="Could not load module data" />
        <AppLoadingState v-else-if="loading" label="Loading module data..." />

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th v-for="column in columns" :key="column">{{ column }}</th>
                <th v-if="rowActions.length">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.subject }}</td>
                <td>{{ row.owner }}</td>
                <td>
                  <span class="status">{{ row.status }}</span>
                </td>
                <td v-if="rowActions.length">
                  <div class="row-actions">
                    <button
                      v-for="action in rowActions"
                      :key="action.key"
                      type="button"
                      class="mini-btn"
                      :disabled="actioning"
                      @click="startRowAction(row, action)"
                    >
                      {{ action.label }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRows.length === 0">
                <td :colspan="rowActions.length ? 5 : 4" class="empty-cell">No records match the current search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <section class="action-grid">
      <article v-for="action in actions" :key="action.title" class="action-card">
        <h3>{{ action.title }}</h3>
        <p>{{ action.description }}</p>
      </article>
    </section>

    <AppModal v-if="showForm" :title="mutationLabel" :subtitle="title" @close="closeForm">
      <form class="record-form" @submit.prevent="submitForm">
        <label v-for="field in formFields" :key="field.key" class="field">
          <span>{{ field.label }} <b v-if="field.required">*</b></span>
          <AppLookupSelect
            v-if="field.type === 'lookup' && field.lookupKind"
            v-model="form[field.key]"
            :kind="field.lookupKind"
            :placeholder="field.placeholder || field.label"
          />
          <select v-else-if="field.type === 'select'" v-model="form[field.key]" :required="field.required">
            <option value="">Select</option>
            <option v-for="option in field.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
          <textarea
            v-else-if="field.type === 'textarea'"
            v-model.trim="form[field.key]"
            :required="field.required"
            :placeholder="field.placeholder || field.label"
          />
          <input
            v-else
            v-model.trim="form[field.key]"
            :type="field.type"
            :required="field.required"
            :placeholder="field.placeholder || field.label"
          />
        </label>

        <label v-if="requiresAuditReason" class="field full">
          <span>Audit Reason <b>*</b></span>
          <textarea v-model.trim="auditReason" required placeholder="Why is this sensitive action being performed?" />
        </label>

        <AppProblemDetails v-if="saveError" :problem="saveError" fallback-title="Could not save record" />

        <div class="form-actions">
          <button type="button" @click="closeForm">Cancel</button>
          <button type="submit" class="primary" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </AppModal>

    <AppModal
      v-if="pendingRowAction && pendingRow"
      :title="pendingRowAction.label"
      :subtitle="`${pendingRow.subject} (${pendingRow.id})`"
      @close="closeRowAction"
    >
      <form class="record-form one-column" @submit.prevent="submitRowAction">
        <label v-if="pendingRowAction.requiresAuditReason" class="field">
          <span>Audit Reason <b>*</b></span>
          <textarea v-model.trim="rowActionReason" required placeholder="Explain this workflow action." />
        </label>

        <AppProblemDetails v-if="actionError" :problem="actionError" fallback-title="Could not complete action" />

        <div class="form-actions">
          <button type="button" @click="closeRowAction">Cancel</button>
          <button type="submit" class="primary" :disabled="actioning">
            {{ actioning ? 'Working...' : pendingRowAction.label }}
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppLookupSelect from '@/components/ui/AppLookupSelect.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppProblemDetails from '@/components/ui/AppProblemDetails.vue'
import {
  enterpriseService,
  type EnterpriseMetric,
  type EnterpriseQueueRow,
} from '@/modules/enterprise/enterprise.service'
import type {
  EnterpriseFilterField,
  EnterpriseFormField,
  EnterpriseRowAction,
} from '@/modules/enterprise/enterprise.types'
import { createMutationState, runMutation } from '@/services/mutations'
import { useToastStore } from '@/store/toast.store'

type Metric = EnterpriseMetric

type Action = {
  title: string
  description: string
}

type QueueRow = EnterpriseQueueRow

const props = withDefaults(
  defineProps<{
    module: string
    title: string
    subtitle: string
    dataEndpoint?: string
    exportEndpoint?: string
    mutationEndpoint?: string
    mutationLabel?: string
    requiresAuditReason?: boolean
    formFields?: EnterpriseFormField[]
    filterFields?: EnterpriseFilterField[]
    rowActions?: EnterpriseRowAction[]
    metrics?: Metric[]
    workflow?: string[]
    actions?: Action[]
    rows?: QueueRow[]
  }>(),
  {
    metrics: () => [
      { label: 'Open', value: '0', hint: 'Awaiting backend data' },
      { label: 'Due today', value: '0', hint: 'No due items loaded' },
      { label: 'Exceptions', value: '0', hint: 'No alerts loaded' },
    ],
    workflow: () => ['Capture', 'Validate', 'Approve', 'Post'],
    mutationEndpoint: '',
    exportEndpoint: '',
    mutationLabel: 'Create record',
    requiresAuditReason: false,
    formFields: () => [],
    filterFields: () => [
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Pending', 'Approved', 'Posted', 'Closed'] },
      { key: 'from', label: 'From', type: 'date' },
      { key: 'to', label: 'To', type: 'date' },
    ],
    actions: () => [
      { title: 'Create record', description: 'Start a new workflow item from this screen.' },
      { title: 'Review queue', description: 'Prioritize pending items and resolve exceptions.' },
      { title: 'Export report', description: 'Download operational data when backend export is available.' },
    ],
    rowActions: () => [],
    rows: () => [
      { id: 'OPD-1024', subject: 'Ayesha Khan', owner: 'Dr. Sarah Ahmed', status: 'In Progress' },
      { id: 'BILL-8842', subject: 'Receipt pending print', owner: 'Main Counter', status: 'Ready' },
    ],
  },
)

const search = ref('')
const liveMetrics = ref<Metric[] | null>(null)
const liveRows = ref<QueueRow[] | null>(null)
const loadState = createMutationState()
const saveState = createMutationState()
const actionState = createMutationState()
const exportState = createMutationState()
const showForm = ref(false)
const auditReason = ref('')
const rowActionReason = ref('')
const pendingRow = ref<QueueRow | null>(null)
const pendingRowAction = ref<EnterpriseRowAction | null>(null)
const form = reactive<Record<string, string | number | null>>({})
const filters = reactive<Record<string, string | number | null>>({})
const columns = ['ID', 'Subject', 'Owner', 'Status']
const toast = useToastStore()

const loading = computed(() => loadState.loading.value)
const loadError = computed(() => loadState.error.value)
const saving = computed(() => saveState.loading.value)
const saveError = computed(() => saveState.error.value)
const actioning = computed(() => actionState.loading.value)
const actionError = computed(() => actionState.error.value)
const exporting = computed(() => exportState.loading.value)
const displayMetrics = computed(() => (liveMetrics.value?.length ? liveMetrics.value : props.metrics))
const displayRows = computed(() => liveRows.value ?? props.rows)

const filteredRows = computed(() => {
  const term = search.value.toLowerCase()
  if (!term) return displayRows.value

  return displayRows.value.filter((row) =>
    [row.id, row.subject, row.owner, row.status].some((value) => value.toLowerCase().includes(term)),
  )
})

const loadModuleData = async () => {
  if (!props.dataEndpoint) return

  const result = await runMutation(
    loadState,
    () => enterpriseService.searchWorkspaceData(props.dataEndpoint as string, compact(filters)),
    {
      showErrorToast: false,
      showSuccessToast: false,
    },
  )

  if (!result) return

  liveMetrics.value = result.metrics
  liveRows.value = result.rows
}

const refresh = async () => {
  search.value = search.value.trim()
  await loadModuleData()
}

const compact = (source: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )

const resetForm = () => {
  Object.keys(form).forEach((key) => {
    delete form[key]
  })

  props.formFields.forEach((field) => {
    form[field.key] = ''
  })

  auditReason.value = ''
}

const fieldValue = (key: string) => form[key]

const isBlank = (value: unknown): boolean => value === '' || value === null || value === undefined

const toNumber = (value: unknown): number => Number(value)

const validateForm = (): boolean => {
  const missing = props.formFields.find((field) => field.required && isBlank(fieldValue(field.key)))
  if (missing) {
    toast.error('Missing required field', `${missing.label} is required.`)
    return false
  }

  const invalidQuantity = ['quantity', 'receivedQuantity', 'orderedQuantity', 'stockOnHand'].find((key) => {
    if (isBlank(fieldValue(key))) return false
    const value = toNumber(fieldValue(key))
    return !Number.isFinite(value) || value <= 0
  })
  if (invalidQuantity) {
    toast.error('Invalid quantity', 'Quantity and stock values must be greater than zero.')
    return false
  }

  const invalidAmount = ['unitPrice', 'price', 'totalAmount', 'amount'].find((key) => {
    if (isBlank(fieldValue(key))) return false
    const value = toNumber(fieldValue(key))
    return !Number.isFinite(value) || value < 0
  })
  if (invalidAmount) {
    toast.error('Invalid amount', 'Price and amount fields cannot be negative.')
    return false
  }

  if (!isBlank(fieldValue('expiryDate'))) {
    const expiry = new Date(String(fieldValue('expiryDate')))
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (Number.isNaN(expiry.getTime()) || expiry < today) {
      toast.error('Invalid expiry date', 'Batch expiry must be today or a future date.')
      return false
    }
  }

  return true
}

const openForm = () => {
  resetForm()
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}

const submitForm = async () => {
  const endpoint = props.mutationEndpoint || props.dataEndpoint
  if (!endpoint) return
  if (!validateForm()) return

  const result = await runMutation(
    saveState,
    () =>
      enterpriseService.runWorkspaceAction(endpoint, compact(form), {
        auditReason: props.requiresAuditReason ? auditReason.value : undefined,
        idempotencyKey: true,
      }),
    {
      successMessage: `${props.mutationLabel} saved.`,
      errorMessage: `Could not save ${props.mutationLabel.toLowerCase()}.`,
    },
  )

  if (!result) return

  closeForm()
  await loadModuleData()
}

const startRowAction = (row: QueueRow, action: EnterpriseRowAction) => {
  pendingRow.value = row
  pendingRowAction.value = action
  rowActionReason.value = ''
  actionState.error.value = null
}

const closeRowAction = () => {
  if (actioning.value) return

  pendingRow.value = null
  pendingRowAction.value = null
  rowActionReason.value = ''
}

const submitRowAction = async () => {
  if (!props.dataEndpoint || !pendingRow.value || !pendingRowAction.value) return

  const action = pendingRowAction.value
  const row = pendingRow.value
  const endpoint = `${props.dataEndpoint}/${encodeURIComponent(row.id)}/${action.endpointSuffix}`

  const result = await runMutation(
    actionState,
    () =>
      enterpriseService.runWorkspaceAction(
        endpoint,
        { id: row.id },
        {
          auditReason: action.requiresAuditReason ? rowActionReason.value : undefined,
          idempotencyKey: action.idempotent === false ? undefined : true,
          method: action.method ?? 'post',
        },
      ),
    {
      successMessage: `${action.label} completed.`,
      errorMessage: `Could not complete ${action.label.toLowerCase()}.`,
    },
  )

  if (!result) return

  closeRowAction()
  await loadModuleData()
}

const exportData = async () => {
  const endpoint = props.exportEndpoint || (props.dataEndpoint ? `${props.dataEndpoint}/export` : '')
  if (!endpoint) return

  const blob = await runMutation(
    exportState,
    () => enterpriseService.exportWorkspaceData(endpoint, compact(filters)),
    {
      showSuccessToast: false,
      errorMessage: `Could not export ${props.title}.`,
    },
  )

  if (!blob) return

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
  toast.success(`${props.title} export downloaded`)
}

const applyFilters = async () => {
  await loadModuleData()
}

onMounted(loadModuleData)
watch(() => props.dataEndpoint, loadModuleData)
</script>

<style scoped>
.module-page {
  min-height: 100vh;
  background: #f4f9f4;
  padding: 24px;
}

.module-header,
.panel,
.kpi-card,
.action-card,
.filter-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.eyebrow,
.subtitle,
.kpi-card span,
.kpi-card small,
.panel-title span,
.action-card p,
.field span {
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
p {
  margin: 0;
}

h2,
h3 {
  color: #0f172a;
}

.subtitle {
  margin-top: 6px;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.filter-panel {
  padding: 16px;
  margin-bottom: 16px;
}

.filter-grid,
.record-form {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.record-form.one-column {
  grid-template-columns: 1fr;
}

.field {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.field b {
  color: #dc2626;
}

.field.full {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  font-size: 13px;
  padding: 0 10px;
}

input,
select {
  height: 36px;
}

textarea {
  min-height: 86px;
  padding-top: 9px;
  resize: vertical;
}

button {
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 6px;
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

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-card {
  padding: 14px;
}

.kpi-card strong {
  display: block;
  color: #0f172a;
  font-size: 24px;
  margin: 4px 0;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.panel {
  padding: 16px;
  min-width: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panel-title input {
  width: 220px;
  max-width: 100%;
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
}

.workflow-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.workflow-list li {
  border: 1px solid #dcfce7;
  border-radius: 6px;
  color: #166534;
  font-weight: 700;
  padding: 10px;
}

.table-wrap {
  overflow-x: auto;
}

.problem {
  margin-bottom: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

th,
td {
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px;
  white-space: nowrap;
}

th {
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
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

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-btn {
  padding: 6px 8px;
  font-size: 12px;
}

.empty-cell {
  color: #64748b;
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.action-card {
  padding: 14px;
}

.action-card p {
  margin-top: 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  grid-column: 1 / -1;
}

@media (max-width: 1000px) {
  .workspace-grid,
  .kpi-grid,
  .action-grid,
  .filter-grid,
  .record-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .module-page {
    padding: 14px;
  }

  .module-header,
  .panel-title {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }
}
</style>
