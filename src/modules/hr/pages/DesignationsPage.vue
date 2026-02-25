<template>
  <div class="page">
    <div class="top">
      <div>
        <h1 class="h">Designations</h1>
        <p class="sub">Manage designations used in Employee Job Info.</p>
      </div>

      <button class="btn btn-primary" type="button" @click="openAdd">
        + Add Designation
      </button>
    </div>

    <!-- ALERT -->
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
          <input v-model="q" placeholder="Search designation..." />
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th style="width: 90px">ID</th>
            <th>Name</th>
            <th style="width: 160px">Code</th>
            <th style="width: 220px; text-align: right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="4" class="empty">
              <div class="empty-title">No designations found</div>
              <div class="empty-sub">Click “Add Designation” to create one.</div>
            </td>
          </tr>

          <tr v-for="d in filtered" :key="d.Id">
            <td class="muted">#{{ d.Id }}</td>
            <td class="name">{{ d.Name }}</td>
            <td class="muted">{{ d.Code || '-' }}</td>
            <td style="text-align: right">
              <button class="chip" type="button" @click="openEdit(d)">Edit</button>
              <button class="chip danger" type="button" @click="remove(d.Id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <DesignationModal v-if="showModal" :model="selected" @close="closeModal" @saved="onSaved" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DesignationModal from '../components/DesignationModal.vue'
import { hrLookupsService } from '../hr-lookups.service'

type AlertType = 'success' | 'error'
type AlertState = { type: AlertType; message: string }

type DesignationDto = { Id: number; Name: string; Code?: string | null; IsActive?: boolean }

type UnknownRecord = Record<string, unknown>
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}
function normalizeList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (!isRecord(res)) return []
  const itemsCandidate = res['items'] ?? res['Items']
  return Array.isArray(itemsCandidate) ? (itemsCandidate as T[]) : []
}

const q = ref('')
const alertState = ref<AlertState | null>(null)

const designations = ref<DesignationDto[]>([])
const showModal = ref(false)
const selected = ref<DesignationDto | null>(null)

function toast(type: AlertType, message: string) {
  alertState.value = { type, message }
}

async function load() {
  try {
    const res = await hrLookupsService.getDesignations({ page: 1, pageSize: 500 })
    designations.value = normalizeList<DesignationDto>(res)
  } catch (e) {
    console.error(e)
    toast('error', 'Failed to load designations')
    designations.value = []
  }
}

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return designations.value
  return designations.value.filter((d) => {
    const name = (d.Name ?? '').toLowerCase()
    const code = (d.Code ?? '').toLowerCase()
    return name.includes(s) || code.includes(s) || String(d.Id).includes(s)
  })
})

function openAdd() {
  selected.value = null
  showModal.value = true
}
function openEdit(d: DesignationDto) {
  selected.value = d
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  selected.value = null
}

async function onSaved() {
  toast('success', 'Saved successfully')
  closeModal()
  await load()
}

async function remove(id: number) {
  if (!confirm('Delete this designation?')) return
  try {
    await hrLookupsService.deleteDesignation(id)
    toast('success', 'Designation deleted')
    await load()
  } catch (e) {
    console.error(e)
    toast('error', 'Delete failed')
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
}

.table tbody td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
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
  margin-top: 6px;
  color: #6b7280;
  font-weight: 700;
}
</style>
