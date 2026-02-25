<template>
  <BaseModal :title="`Sub Departments - ${department.Name}`"
    subtitle="Create and manage sub departments for this department." @close="emit('close')">
    <div class="top">
      <input class="input" v-model="search" placeholder="Search sub departments..." />
      <button class="btn" @click="load">Refresh</button>
    </div>

    <div class="split">
      <div class="list">
        <table class="table">
          <thead>
            <tr>
              <th style="width:90px">ID</th>
              <th>Name</th>
              <th style="width:140px">Code</th>
              <th style="width:170px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="4" class="empty">No sub departments found.</td>
            </tr>
            <tr v-for="s in filtered" :key="s.Id">
              <td class="muted">#{{ s.Id }}</td>
              <td class="name">{{ s.Name }}</td>
              <td class="muted">{{ s.Code || '-' }}</td>
              <td class="actions">
                <button class="btn btn-sm" @click="startEdit(s)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="remove(s.Id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="form">
        <h3 class="h3">{{ editing ? 'Edit Sub Department' : 'Add Sub Department' }}</h3>

        <label>Name *</label>
        <input class="input" v-model="name" placeholder="e.g. OPD - Reception" />

        <label style="margin-top:10px;">Code (optional)</label>
        <input class="input" v-model="code" placeholder="e.g. OPD-R" />

        <div class="row">
          <button class="btn btn-primary" :disabled="saving" @click="save">
            {{ editing ? 'Update' : 'Save' }}
          </button>
          <button class="btn" :disabled="saving" @click="reset">Clear</button>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn" @click="emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseModal from '../pages/BaseModal.vue'
import { hrLookupsService } from '../hr-lookups.service'

type DepartmentDto = { Id: number; Name: string }
type SubDepartmentDto = { Id: number; DepartmentId: number; Name: string; Code?: string | null }

type UnknownRecord = Record<string, unknown>
function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}
function normalizeList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (!isRecord(res)) return []
  const items = res['items'] ?? res['Items']
  return Array.isArray(items) ? (items as T[]) : []
}

const props = defineProps<{ department: DepartmentDto }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const list = ref<SubDepartmentDto[]>([])
const search = ref('')

const editing = ref<SubDepartmentDto | null>(null)
const name = ref('')
const code = ref('')
const saving = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return list.value
  return list.value.filter((s) => {
    return (
      (s.Name || '').toLowerCase().includes(q) ||
      (s.Code || '').toLowerCase().includes(q) ||
      String(s.Id).includes(q)
    )
  })
})

function reset() {
  editing.value = null
  name.value = ''
  code.value = ''
}

function startEdit(s: SubDepartmentDto) {
  editing.value = s
  name.value = (s.Name ?? '').trim()
  code.value = (s.Code ?? '').trim()
}

async function load() {
  const res = await hrLookupsService.getSubDepartments({
    departmentId: props.department.Id,
    page: 1,
    pageSize: 500,
  })
  list.value = normalizeList<SubDepartmentDto>(res)
}

async function save() {
  const n = name.value.trim()
  if (!n) return alert('Name is required')

  saving.value = true
  try {
    const payload = { departmentId: props.department.Id, name: n, code: code.value.trim() || undefined }

    if (editing.value) {
      await hrLookupsService.updateSubDepartment(editing.value.Id, payload)
    } else {
      await hrLookupsService.createSubDepartment(payload)
    }

    reset()
    await load()
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('Delete this sub department?')) return
  await hrLookupsService.deleteSubDepartment(id)
  await load()
}

onMounted(load)
</script>

<style scoped>
.top {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.split {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 14px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  font-size: 12px;
  font-weight: 900;
  padding: 10px;
  background: #f9fafb;
  border-bottom: 1px solid #eef2f7;
}

.table td {
  padding: 10px;
  border-bottom: 1px solid #f1f5f9;
  font-weight: 700;
}

.actions {
  text-align: right;
  white-space: nowrap;
}

.name {
  font-weight: 900;
}

.muted {
  color: #6b7280;
}

.empty {
  padding: 16px;
  text-align: center;
  color: #6b7280;
}

.form {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  padding: 12px;
}

.h3 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 950;
}

label {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 6px;
  display: block;
}

.input {
  flex: 1;
  width: 100%;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  font-weight: 800;
}

.row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
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

.btn-danger {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
}

.btn-sm {
  height: 34px;
  padding: 0 10px;
  margin-left: 8px;
}
</style>
