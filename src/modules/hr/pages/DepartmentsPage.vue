<template>
  <div class="page">
    <div class="head">
      <div>
        <h1>Departments</h1>
        <p class="muted">Manage departments and their sub departments.</p>
      </div>

      <button class="btn btn-primary" @click="openDeptModalForCreate">
        + Add Department
      </button>
    </div>

    <div class="card">
      <div class="toolbar">
        <input v-model="search" class="input" placeholder="Search departments..." />
        <button class="btn" @click="loadDepartments">Refresh</button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 90px">ID</th>
              <th>Name</th>
              <th style="width: 140px">Code</th>
              <th style="width: 220px; text-align:right;">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredDepartments.length === 0">
              <td colspan="4" class="empty">No departments found.</td>
            </tr>

            <tr v-for="d in filteredDepartments" :key="d.Id">
              <td class="muted">#{{ d.Id }}</td>
              <td class="name">{{ d.Name }}</td>
              <td class="muted">{{ d.Code || '-' }}</td>
              <td class="actions">
                <button class="btn btn-sm" @click="openDeptModalForEdit(d)">Edit</button>
                <button class="btn btn-sm" @click="openSubsModal(d)">Sub Departments</button>
                <button class="btn btn-sm btn-danger" @click="removeDepartment(d.Id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal 1: Add/Edit Department -->
    <DepartmentModal v-if="deptModalOpen" :model="deptEditing" @close="deptModalOpen = false" @saved="onDeptSaved" />

    <!-- Modal 2: Sub Departments -->
    <SubDepartmentsModal v-if="subsModalOpen && selectedDept" :department="selectedDept"
      @close="subsModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { hrLookupsService } from '../hr-lookups.service'
import DepartmentModal from '../components/DepartmentModal.vue'
import SubDepartmentsModal from '../components/SubDepartmentsModal.vue'

type DepartmentDto = {
  Id: number
  Name: string
  Code?: string | null
}



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

const departments = ref<DepartmentDto[]>([])
const search = ref('')

const deptModalOpen = ref(false)
const deptEditing = ref<DepartmentDto | null>(null)

const subsModalOpen = ref(false)
const selectedDept = ref<DepartmentDto | null>(null)

const filteredDepartments = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return departments.value
  return departments.value.filter((d) => {
    return (
      (d.Name || '').toLowerCase().includes(q) ||
      (d.Code || '').toLowerCase().includes(q) ||
      String(d.Id).includes(q)
    )
  })
})

async function loadDepartments() {
  const res = await hrLookupsService.getDepartments({ page: 1, pageSize: 500 })
  departments.value = normalizeList<DepartmentDto>(res)
}

function openDeptModalForCreate() {
  deptEditing.value = null
  deptModalOpen.value = true
}

function openDeptModalForEdit(d: DepartmentDto) {
  deptEditing.value = d
  deptModalOpen.value = true
}

function openSubsModal(d: DepartmentDto) {
  selectedDept.value = d
  subsModalOpen.value = true
}

async function onDeptSaved() {
  deptModalOpen.value = false
  await loadDepartments()
}

async function removeDepartment(id: number) {
  if (!confirm('Delete this department?')) return
  await hrLookupsService.deleteDepartment(id)
  await loadDepartments()
}

onMounted(loadDepartments)
</script>

<style scoped>
.page {
  padding: 18px;
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
}

.muted {
  color: #6b7280;
  font-weight: 700;
  margin: 6px 0 0;
}

.card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 14px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.input {
  flex: 1;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  font-weight: 700;
}

.table-wrap {
  overflow: auto;
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

.empty {
  padding: 18px;
  text-align: center;
  color: #6b7280;
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
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.20);
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
