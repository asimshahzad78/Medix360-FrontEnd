<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card" @click.stop>
      <form class="modal-form" @submit.prevent>
        <!-- Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Department Admin</h2>
            <div class="modal-subtitle">Manage Departments & Sub Departments used in Employee Job Info.</div>
          </div>

          <button type="button" class="icon-btn" @click="emit('close')" aria-label="Close">×</button>
        </div>

        <!-- Tabs -->
        <div class="tabs-wrap">
          <div class="tabs">
            <button type="button" class="tab" :class="{ active: activeTab === 'departments' }"
              @click="switchTab('departments')">
              Departments
            </button>
            <button type="button" class="tab" :class="{ active: activeTab === 'subdepartments' }"
              @click="switchTab('subdepartments')">
              Sub Departments
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Alerts -->
          <div v-if="alertState" class="alert-wrapper">
            <div :class="['alert', alertState.type === 'success' ? 'alert-success' : 'alert-danger']">
              <div class="alert-text">
                <b>{{ alertState.type === 'success' ? 'Success' : 'Error' }}:</b> {{ alertState.message }}
              </div>
              <button type="button" class="btn-close" @click="alertState = null"></button>
            </div>
          </div>

          <div class="split">
            <!-- LEFT: list -->
            <div class="panel">
              <div class="panel-head">
                <div>
                  <div class="panel-title">
                    {{ activeTab === 'departments' ? 'Department List' : 'Sub Department List' }}
                  </div>
                  <div class="panel-hint">
                    {{
                      activeTab === 'departments'
                        ? 'Create and maintain your master department list.'
                        : 'Select a department then manage its sub departments.'
                    }}
                  </div>
                </div>

                <!-- toolbar -->
                <div class="toolbar">
                  <!-- Departments -->
                  <template v-if="activeTab === 'departments'">
                    <div class="search">
                      <span class="search-ic">⌕</span>
                      <input v-model="deptSearch" placeholder="Search department..." />
                    </div>


                  </template>

                  <!-- SubDepartments -->
                  <template v-else>
                    <select class="select" v-model.number="selectedDepartmentId">
                      <option :value="0">Select Department</option>
                      <option v-for="d in departments" :key="d.Id" :value="d.Id">
                        {{ d.Name }}
                      </option>
                    </select>


                  </template>
                </div>
              </div>

              <!-- Sub search -->
              <div v-if="activeTab === 'subdepartments'" class="sub-toolbar">
                <div class="search">
                  <span class="search-ic">⌕</span>
                  <input v-model="subSearch" :disabled="!selectedDepartmentId" placeholder="Search sub department..." />
                </div>
              </div>

              <!-- Table -->
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr>
                      <th class="col-id">ID</th>
                      <th>Name</th>
                      <th class="col-code">Code</th>
                      <th class="col-actions">Actions</th>
                    </tr>
                  </thead>

                  <!-- Departments -->
                  <tbody v-if="activeTab === 'departments'">
                    <tr v-if="filteredDepartments.length === 0">
                      <td colspan="4">
                        <div class="empty">
                          <div class="empty-title">No departments found</div>
                          <div class="empty-sub">Click “Add” to create your first department.</div>
                        </div>
                      </td>
                    </tr>

                    <tr v-for="d in filteredDepartments" :key="d.Id" :class="{ selected: d.Id === editDeptId }"
                      @click="editDepartment(d.Id)">
                      <td class="muted">#{{ d.Id }}</td>
                      <td>
                        <div class="cell-main">{{ d.Name }}</div>
                      </td>
                      <td class="muted">{{ d.Code || '-' }}</td>
                      <td class="actions-cell" @click.stop>
                        <button type="button" class="chip" @click="editDepartment(d.Id)">Edit</button>
                        <button type="button" class="chip danger" @click="removeDepartment(d.Id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>

                  <!-- SubDepartments -->
                  <tbody v-else>
                    <tr v-if="!selectedDepartmentId">
                      <td colspan="4">
                        <div class="empty">
                          <div class="empty-title">Select a department first</div>
                          <div class="empty-sub">Choose a department from the dropdown to view sub departments.</div>
                        </div>
                      </td>
                    </tr>

                    <tr v-else-if="filteredSubDepartments.length === 0">
                      <td colspan="4">
                        <div class="empty">
                          <div class="empty-title">No sub departments found</div>
                          <div class="empty-sub">Click “Add” to create a sub department for this department.</div>
                        </div>
                      </td>
                    </tr>

                    <tr v-for="s in filteredSubDepartments" :key="s.Id" :class="{ selected: s.Id === editSubId }"
                      @click="editSubDepartment(s.Id)">
                      <td class="muted">#{{ s.Id }}</td>
                      <td>
                        <div class="cell-main">{{ s.Name }}</div>
                      </td>
                      <td class="muted">{{ s.Code || '-' }}</td>
                      <td class="actions-cell" @click.stop>
                        <button type="button" class="chip" @click="editSubDepartment(s.Id)">Edit</button>
                        <button type="button" class="chip danger" @click="removeSubDepartment(s.Id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- RIGHT: editor -->
            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">
                  {{
                    activeTab === 'departments'
                      ? editDeptId
                        ? 'Edit Department'
                        : 'Add Department'
                      : editSubId
                        ? 'Edit Sub Department'
                        : 'Add Sub Department'
                  }}
                </div>
                <div class="panel-hint">
                  {{
                    activeTab === 'departments'
                      ? 'Tip: Keep names short & consistent (e.g. OPD, Radiology).'
                      : 'Tip: Use clear naming (e.g. “OPD - Reception”, “Lab - Sample”).'
                  }}
                </div>
              </div>

              <div class="form-card">
                <div class="grid">
                  <div>
                    <label>Name *</label>
                    <input v-model="form.name" placeholder="e.g. OPD / Radiology" />
                  </div>

                  <div>
                    <label>Code (optional)</label>
                    <input v-model="form.code" placeholder="e.g. OPD" />
                  </div>
                </div>

                <div v-if="activeTab === 'subdepartments'" class="info-pill"
                  :class="{ disabled: !selectedDepartmentId }">
                  Department: <b>{{ selectedDepartmentName || 'Not selected' }}</b>
                </div>

                <div class="row-actions">
                  <button type="button" class="btn-primary"
                    :disabled="saving || (activeTab === 'subdepartments' && !selectedDepartmentId)" @click="save">
                    {{ (activeTab === 'departments' ? editDeptId : editSubId) ? 'Update' : 'Save' }}
                  </button>

                  <button type="button" class="btn-secondary" :disabled="saving" @click="reset">Clear</button>

                  <button v-if="activeTab === 'departments' ? editDeptId : editSubId" type="button" class="btn-danger"
                    :disabled="saving"
                    @click="activeTab === 'departments' ? removeDepartment(editDeptId) : removeSubDepartment(editSubId)">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="emit('close')">Close</button>
          <button type="button" class="btn-primary" @click="emit('updated'); emit('close')">Done</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { hrLookupsService } from '../hr-lookups.service'

type AlertType = 'success' | 'error'
type AlertState = { type: AlertType; message: string }

//type PagedCamel<T> = { items: T[]; totalCount?: number; total?: number }
//type PagedPascal<T> = { Items: T[]; TotalCount?: number; Total?: number }

type DepartmentDto = {
  Id: number
  Name: string
  Code?: string | null
  IsActive?: boolean
}

type SubDepartmentDto = {
  Id: number
  DepartmentId: number
  Name: string
  Code?: string | null
  IsActive?: boolean
}

type ActiveTab = 'departments' | 'subdepartments'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const activeTab = ref<ActiveTab>('departments')
const alertState = ref<AlertState | null>(null)
const saving = ref(false)

const toast = (type: AlertType, message: string) => {
  alertState.value = { type, message }
}

/** normalize API responses: array OR {items,totalCount} */
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

/* -----------------------------
   Departments
----------------------------- */
const departments = ref<DepartmentDto[]>([])
const deptSearch = ref('')
const editDeptIdRef = ref<number>(0)
const deptForm = ref<{ name: string; code: string }>({ name: '', code: '' })

const editDeptId = computed(() => editDeptIdRef.value)

const filteredDepartments = computed(() => {
  const q = deptSearch.value.trim().toLowerCase()
  if (!q) return departments.value
  return departments.value.filter(
    (d) =>
      (d.Name || '').toLowerCase().includes(q) ||
      (d.Code || '').toLowerCase().includes(q) ||
      String(d.Id).includes(q),
  )
})

function startAddDepartment() {
  editDeptIdRef.value = 0
  deptForm.value = { name: '', code: '' }
}

function editDepartment(id: number) {
  const d = departments.value.find((x) => x.Id === id)
  if (!d) return
  editDeptIdRef.value = d.Id
  deptForm.value = { name: d.Name ?? '', code: (d.Code ?? '') || '' }
}

async function reloadDepartments(): Promise<void> {
  try {
    const res = await hrLookupsService.getDepartments({ page: 1, pageSize: 500 })
    departments.value = normalizeList<DepartmentDto>(res)
  } catch (e) {
    console.error(e)
    toast('error', 'Failed to load departments')
    departments.value = []
  }
}

async function saveDepartment(): Promise<void> {
  const name = deptForm.value.name.trim()
  const code = deptForm.value.code.trim()
  if (!name) return toast('error', 'Department name is required')

  saving.value = true
  try {
    const payload = { name, code: code ? code : undefined }

    if (editDeptIdRef.value) {
      await hrLookupsService.updateDepartment(editDeptIdRef.value, payload)
      toast('success', 'Department updated')
    } else {
      await hrLookupsService.createDepartment(payload)
      toast('success', 'Department created')
    }

    startAddDepartment()
    await reloadDepartments()
    emit('updated')
  } catch (e) {
    console.error(e)
    toast('error', 'Save failed')
  } finally {
    saving.value = false
  }
}

async function removeDepartment(id: number): Promise<void> {
  if (!id) return
  if (!confirm('Delete this department?')) return

  saving.value = true
  try {
    await hrLookupsService.deleteDepartment(id)
    toast('success', 'Department deleted')
    if (editDeptIdRef.value === id) startAddDepartment()
    await reloadDepartments()
    emit('updated')
  } catch (e) {
    console.error(e)
    toast('error', 'Delete failed')
  } finally {
    saving.value = false
  }
}

/* -----------------------------
   SubDepartments
----------------------------- */
const selectedDepartmentId = ref<number>(0)
const subDepartments = ref<SubDepartmentDto[]>([])
const subSearch = ref('')
const editSubIdRef = ref<number>(0)
const subForm = ref<{ name: string; code: string }>({ name: '', code: '' })

const editSubId = computed(() => editSubIdRef.value)

const selectedDepartmentName = computed(() => {
  const d = departments.value.find((x) => x.Id === selectedDepartmentId.value)
  return d?.Name ?? ''
})

const filteredSubDepartments = computed(() => {
  const q = subSearch.value.trim().toLowerCase()
  if (!q) return subDepartments.value
  return subDepartments.value.filter(
    (s) =>
      (s.Name || '').toLowerCase().includes(q) ||
      (s.Code || '').toLowerCase().includes(q) ||
      String(s.Id).includes(q),
  )
})

function startAddSubDepartment() {
  editSubIdRef.value = 0
  subForm.value = { name: '', code: '' }
}

function editSubDepartment(id: number) {
  const s = subDepartments.value.find((x) => x.Id === id)
  if (!s) return
  editSubIdRef.value = s.Id
  subForm.value = { name: s.Name ?? '', code: (s.Code ?? '') || '' }
}

async function reloadSubDepartments(): Promise<void> {
  if (!selectedDepartmentId.value) {
    subDepartments.value = []
    return
  }

  try {
    const res = await hrLookupsService.getSubDepartments({
      departmentId: selectedDepartmentId.value,
      page: 1,
      pageSize: 500,
    })
    subDepartments.value = normalizeList<SubDepartmentDto>(res)
  } catch (e) {
    console.error(e)
    toast('error', 'Failed to load sub departments')
    subDepartments.value = []
  }
}

async function saveSubDepartment(): Promise<void> {
  if (!selectedDepartmentId.value) return toast('error', 'Select a department first')

  const name = subForm.value.name.trim()
  const code = subForm.value.code.trim()
  if (!name) return toast('error', 'Sub department name is required')

  saving.value = true
  try {
    const payload = { departmentId: selectedDepartmentId.value, name, code: code ? code : undefined }

    if (editSubIdRef.value) {
      await hrLookupsService.updateSubDepartment(editSubIdRef.value, payload)
      toast('success', 'Sub department updated')
    } else {
      await hrLookupsService.createSubDepartment(payload)
      toast('success', 'Sub department created')
    }

    startAddSubDepartment()
    await reloadSubDepartments()
    emit('updated')
  } catch (e) {
    console.error(e)
    toast('error', 'Save failed')
  } finally {
    saving.value = false
  }
}

async function removeSubDepartment(id: number): Promise<void> {
  if (!id) return
  if (!confirm('Delete this sub department?')) return

  saving.value = true
  try {
    await hrLookupsService.deleteSubDepartment(id)
    toast('success', 'Sub department deleted')
    if (editSubIdRef.value === id) startAddSubDepartment()
    await reloadSubDepartments()
    emit('updated')
  } catch (e) {
    console.error(e)
    toast('error', 'Delete failed')
  } finally {
    saving.value = false
  }
}

/* -----------------------------
   Template bridge
----------------------------- */
const form = computed({
  get() {
    return activeTab.value === 'departments' ? deptForm.value : subForm.value
  },
  set(v) {
    if (activeTab.value === 'departments') deptForm.value = v
    else subForm.value = v
  },
})

function switchTab(next: ActiveTab) {
  activeTab.value = next
  alertState.value = null
  if (next === 'departments') startAddDepartment()
  else startAddSubDepartment()
}

async function save() {
  if (activeTab.value === 'departments') return saveDepartment()
  return saveSubDepartment()
}

function reset() {
  if (activeTab.value === 'departments') startAddDepartment()
  else startAddSubDepartment()
}

/* -----------------------------
   Watchers
----------------------------- */
watch(selectedDepartmentId, async () => {
  startAddSubDepartment()
  await reloadSubDepartments()
})

/* -----------------------------
   Lifecycle
----------------------------- */
onMounted(async () => {
  await reloadDepartments()
})
</script>

<style scoped>
/* Backdrop fixed + dimmed (this was missing in your screenshot) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 18px;
  overflow: auto;
  pointer-events: auto;
}

.modal-card {
  position: relative;
  z-index: 2147483647;
  pointer-events: auto;
  width: 1120px;
  max-width: 95vw;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.modal-card * {
  pointer-events: auto;
}

.modal-form {
  display: flex;
  flex-direction: column;
  min-height: 540px;
}

.modal-header {
  padding: 18px 22px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #f2f4f7;
}

.modal-title {
  margin: 0;
  font-size: 28px;
  font-weight: 950;
  letter-spacing: -0.4px;
}

.modal-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 700;
}

.icon-btn {
  height: 36px;
  width: 36px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.tabs-wrap {
  padding: 10px 22px 14px;
  border-bottom: 1px solid #f2f4f7;
  background: linear-gradient(180deg, #fff, #fbfbfc);
}

.tabs {
  display: inline-flex;
  gap: 10px;
  padding: 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
}

.tab {
  border: 0;
  background: transparent;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  color: #111827;
}

.tab.active {
  background: #22c55e;
  color: #fff;
  box-shadow: 0 8px 18px rgba(34, 197, 94, 0.25);
}

.modal-body {
  padding: 16px 22px 18px;
  overflow: auto;
}

.split {
  display: grid;
  grid-template-columns: 1.25fr 0.85fr;
  gap: 14px;
}

.panel {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  overflow: hidden;
}

.panel-head {
  padding: 14px 14px 12px;
  border-bottom: 1px solid #f2f4f7;
  background: #fff;
}

.panel-title {
  font-weight: 950;
  font-size: 14px;
}

.panel-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.toolbar {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
}

.sub-toolbar {
  padding: 12px 14px 0;
}

.search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px 12px;
  min-height: 44px;
}

.search-ic {
  opacity: 0.55;
  font-weight: 900;
}

.search input {
  border: 0;
  outline: none;
  width: 100%;
  font-weight: 800;
  font-size: 13px;
}

.select {
  height: 44px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px 12px;
  font-weight: 800;
  font-size: 13px;
  background: #fff;
  width: 100%;
}

.table-wrap {
  padding: 12px 14px 14px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
}

.table thead th {
  text-align: left;
  font-size: 12px;
  font-weight: 950;
  padding: 12px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #eef2f7;
  color: #111827;
}

.table tbody td {
  padding: 12px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
}

.table tbody tr:hover {
  background: #fbfffd;
}

.table tbody tr.selected {
  background: #ecfdf5;
}

.col-id {
  width: 90px;
}

.col-code {
  width: 140px;
}

.col-actions {
  width: 190px;
  text-align: right;
}

.muted {
  color: #6b7280;
  font-weight: 800;
}

.cell-main {
  font-weight: 950;
  color: #111827;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
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

.empty {
  padding: 18px 14px;
}

.empty-title {
  font-weight: 950;
  color: #111827;
}

.empty-sub {
  margin-top: 6px;
  color: #6b7280;
  font-weight: 700;
  font-size: 13px;
}

.form-card {
  padding: 14px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 8px;
  display: inline-block;
}

/* ✅ Textbox fix (consistent, no weird focus overflow) */
input {
  box-sizing: border-box;
  width: 100%;
  height: 46px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 0 14px;
  outline: none;
  font-weight: 800;
  font-size: 13px;
  background: #fff;
}

input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.16);
}

.info-pill {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1e3a8a;
  font-weight: 900;
  font-size: 13px;
}

.info-pill.disabled {
  opacity: 0.55;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.modal-footer {
  padding: 14px 22px;
  border-top: 1px solid #f2f4f7;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 14px;
  background: #22c55e;
  color: #fff;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.22);
}

.btn-secondary {
  height: 42px;
  padding: 0 18px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  background: #fff;
  font-weight: 950;
  cursor: pointer;
}

.btn-danger {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 14px;
  background: #ef4444;
  color: #fff;
  font-weight: 950;
  cursor: pointer;
}

.btn-sm {
  height: 44px;
  border-radius: 14px;
  padding: 0 14px;
}

.alert-wrapper {
  margin: 0 0 12px;
}

.alert {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.alert-text {
  font-weight: 800;
}

.alert-success {
  background: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.alert-danger {
  background: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.65;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close::before {
  content: '\00d7';
}

@media (max-width: 980px) {
  .split {
    grid-template-columns: 1fr;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
