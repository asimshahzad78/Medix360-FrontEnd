<template>
  <div class="page">
    <div class="top">
      <div>
        <h1 class="h">{{ title }}</h1>
        <p class="sub">{{ subtitle }}</p>
      </div>

      <button class="btn btn-primary" type="button" @click="openAdd">
        {{ addLabel }}
      </button>
    </div>

    <div v-if="alertState" class="alert-wrap">
      <div :class="['alert', alertState.type === 'success' ? 'ok' : 'bad']">
        <div><b>{{ alertState.type === 'success' ? 'Success' : 'Error' }}:</b> {{ alertState.message }}</div>
        <button type="button" class="x" @click="alertState = null">×</button>
      </div>
    </div>

    <div class="card">
      <div class="toolbar">
        <div class="search">
          <span class="ic">⌕</span>
          <input v-model="q" :placeholder="searchPlaceholder" />
        </div>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col.key" :style="headerStyle(col)">
                {{ col.label }}
              </th>
              <th style="width: 220px; text-align: right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td :colspan="columns.length + 1" class="empty">
                <div class="empty-title">No {{ itemNamePlural.toLowerCase() }} found</div>
                <div class="empty-sub">Click “{{ addLabel }}” to create one.</div>
              </td>
            </tr>

            <tr v-for="row in filtered" :key="rowId(row)">
              <td
                v-for="col in columns"
                :key="`${rowId(row)}-${col.key}`"
                :style="cellStyle(col)"
                :class="{ muted: col.key === 'Id' || col.key.endsWith('Id'), name: col.key === primaryKey }"
              >
                {{ renderValue(row[col.key]) }}
              </td>
              <td style="text-align: right">
                <button class="chip" type="button" @click="openEdit(row)">Edit</button>
                <button class="chip danger" type="button" @click="removeItem(row)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <HrCrudModal
      v-if="showModal"
      :title="selected ? `Edit ${itemNameSingular}` : `Add ${itemNameSingular}`"
      :subtitle="modalSubtitle"
      :save-label="selected ? 'Update' : 'Save'"
      :fields="fields"
      :model="selected ? toFormModel(selected) : null"
      :initial-state="initialState"
      :saving="saving"
      @close="closeModal"
      @save="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import HrCrudModal from './HrCrudModal.vue'
import type { CrudColumn, CrudField, FormModel, UnknownRecord } from '../hr-crud.types'
import { formatCellValue } from '../hr-crud.utils'

type AlertType = 'success' | 'error'
type AlertState = { type: AlertType; message: string }

type PagedResult<T> = {
  items?: T[]
  Items?: T[]
  totalCount?: number
  TotalCount?: number
}

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    addLabel: string
    itemNameSingular: string
    itemNamePlural: string
    modalSubtitle?: string
    searchPlaceholder?: string
    primaryKey?: string
    columns: CrudColumn[]
    fields: CrudField[]
    initialState: FormModel
    listApi: (params?: { page?: number; pageSize?: number }) => Promise<PagedResult<UnknownRecord> | UnknownRecord[]>
    createApi: (payload: FormModel) => Promise<void>
    updateApi: (id: number, payload: FormModel) => Promise<void>
    deleteApi: (id: number) => Promise<void>
    toForm?: (row: never) => FormModel
  }>(),
  {
    modalSubtitle: '',
    searchPlaceholder: 'Search...',
    primaryKey: 'Name',
    toForm: (row: never) => ({ ...(row as FormModel) }),
  },
)

const q = ref('')
const alertState = ref<AlertState | null>(null)
const rows = ref<UnknownRecord[]>([])
const showModal = ref(false)
const selected = ref<UnknownRecord | null>(null)
const saving = ref(false)

function toast(type: AlertType, message: string) {
  alertState.value = { type, message }
}

function normalizeList<T>(res: PagedResult<T> | T[]): T[] {
  if (Array.isArray(res)) return res
  if (!res || typeof res !== 'object') return []
  const items = (res as PagedResult<T>).items ?? (res as PagedResult<T>).Items
  return Array.isArray(items) ? items : []
}

async function load() {
  try {
    const res = await props.listApi({ page: 1, pageSize: 500 })
    rows.value = normalizeList(res)
  } catch (e) {
    console.error(e)
    rows.value = []
    toast('error', `Failed to load ${props.itemNamePlural.toLowerCase()}`)
  }
}

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return rows.value
  return rows.value.filter((row) => {
    return Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(s))
  })
})

function rowId(row: UnknownRecord) {
  return Number(row['Id'] ?? 0)
}

function renderValue(value: unknown) {
  return formatCellValue(value)
}

function toFormModel(row: UnknownRecord): FormModel {
  return props.toForm(row as never)
}

function headerStyle(col: CrudColumn) {
  return {
    width: col.width || undefined,
    textAlign: col.align || 'left',
  }
}

function cellStyle(col: CrudColumn) {
  return {
    textAlign: col.align || 'left',
  }
}

function openAdd() {
  selected.value = null
  showModal.value = true
}

function openEdit(row: UnknownRecord) {
  selected.value = row
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selected.value = null
}

async function onSave(payload: FormModel) {
  saving.value = true
  try {
    if (selected.value) {
      await props.updateApi(rowId(selected.value), payload)
      toast('success', `${props.itemNameSingular} updated successfully`)
    } else {
      await props.createApi(payload)
      toast('success', `${props.itemNameSingular} created successfully`)
    }
    closeModal()
    await load()
  } catch (e) {
    console.error(e)
    toast('error', `Failed to save ${props.itemNameSingular.toLowerCase()}`)
  } finally {
    saving.value = false
  }
}

async function removeItem(row: UnknownRecord) {
  if (!confirm(`Delete this ${props.itemNameSingular.toLowerCase()}?`)) return
  try {
    await props.deleteApi(rowId(row))
    toast('success', `${props.itemNameSingular} deleted`)
    await load()
  } catch (e) {
    console.error(e)
    toast('error', `Failed to delete ${props.itemNameSingular.toLowerCase()}`)
  }
}

onMounted(load)
</script>

<style scoped>
.page {
  padding: 18px;
}

.top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.h {
  margin: 0;
  font-size: 22px;
  font-weight: 950;
}

.sub {
  margin: 6px 0 0;
  color: #6b7280;
  font-weight: 700;
  font-size: 12px;
}

.card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.05);
}

.toolbar {
  padding: 12px;
  border-bottom: 1px solid #eef2f7;
}

.search {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
}

.ic {
  opacity: 0.55;
  font-weight: 900;
}

.search input {
  border: 0;
  outline: none;
  width: 100%;
  font-weight: 800;
}

.table-wrap {
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  text-align: left;
  font-size: 12px;
  font-weight: 950;
  padding: 12px;
  background: #f9fafb;
  border-bottom: 1px solid #eef2f7;
  white-space: nowrap;
}

.table tbody td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  vertical-align: top;
}

.name {
  font-weight: 950;
}

.muted {
  color: #6b7280;
  font-weight: 800;
}

.chip {
  height: 32px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
}

.chip.danger {
  border-color: #fecaca;
  color: #b91c1c;
}

.btn {
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn-primary {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
}

.alert-wrap {
  margin-bottom: 12px;
}

.alert {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 800;
}

.alert.ok {
  background: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.alert.bad {
  background: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

.alert .x {
  border: 0;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
}

.alert .x:hover {
  opacity: 1;
}

.empty {
  padding: 18px;
}

.empty-title {
  font-weight: 950;
}

.empty-sub {
  margin-top: 4px;
  color: #6b7280;
  font-weight: 700;
}
</style>
