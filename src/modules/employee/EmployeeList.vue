<template>
  <div class="employee-page">
    <!-- Header -->
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" @click="openAddModal">+ Add New</button>
      </div>

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
        <table class="employee-table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-name">Name</th>
              <th class="col-type">Type</th>
              <th class="col-phone">Phone</th>
              <th class="col-email">Email</th>
              <th class="col-hasuser">Has User</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="e in filteredEmployees" :key="e.userProfileId">
              <td class="col-id">{{ e.userProfileId }}</td>
              <td class="col-name">{{ buildFullName(e) }}</td>
              <td class="col-type">{{ userTypeLabel(e.userType) }}</td>
              <td class="col-phone">{{ e.phoneNumber }}</td>
              <td class="col-email">{{ e.email }}</td>
              <td class="col-hasuser">{{ e.hasUser ? 'Yes' : 'No' }}</td>

              <td class="actions col-actions">
                <button class="icon-btn" type="button" title="Edit" @click="openEditModal(e)">
                  ✏️
                </button>
                <button class="icon-btn" type="button" title="Delete" @click="askDelete(e)">
                  🗑️
                </button>
              </td>
            </tr>

            <tr v-if="filteredEmployees.length === 0">
              <td colspan="7" class="no-records">No records</td>
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

    <!-- MODALS -->
    <Teleport to="body">
      <EmployeeFormModal v-if="showForm" :employeeId="selectedEmployee?.userProfileId" @saved="reload"
        @close="closeModals" />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { employeeService, type EmployeeApiDto } from './employee.service'
import EmployeeFormModal from './EmployeeFormModal.vue'

interface EmployeeRow {
  userProfileId: number
  employeeId: string | null
  firstName: string
  lastName: string
  phoneNumber: string | null
  email: string | null
  userType: number
  roleId: number
  applicationUserId: string | null
  hasUser: boolean
}

export default defineComponent({
  components: { EmployeeFormModal },

  setup() {
    const employees = ref<EmployeeRow[]>([])
    const search = ref('')
    const loading = ref(false)

    const page = ref(1)
    const pageSize = ref(25)
    const totalCount = ref(0)

    const showForm = ref(false)
    const selectedEmployee = ref<EmployeeRow | null>(null)

    const mapEmployee = (x: EmployeeApiDto): EmployeeRow => {
      return {
        userProfileId: x.UserProfileId,
        employeeId: x.EmployeeId ?? null,
        firstName: x.FirstName ?? '',
        lastName: x.LastName ?? '',
        phoneNumber: x.PhoneNumber ?? null,
        email: x.Email ?? null,
        userType: x.UserType ?? 0,
        roleId: x.RoleId ?? 0,
        applicationUserId: x.ApplicationUserId ?? null,
        hasUser: x.hasUser ?? !!x.ApplicationUserId,
      }
    }

    const loadEmployees = async (): Promise<void> => {
      loading.value = true

      const res = await employeeService.getPaged(page.value, pageSize.value, null, search.value)
      totalCount.value = res.totalCount
      employees.value = res.items.map(mapEmployee)

      loading.value = false
    }

    const buildFullName = (e: EmployeeRow) => `${e.firstName} ${e.lastName}`.trim()

    const userTypeLabel = (t: number) => {
      const map: Record<number, string> = {
        1: 'Doctor',
        2: 'Nurse',
        3: 'Laboratory',
        4: 'Pharmacist',
        5: 'Accountant',
        6: 'Admin',
        7: 'Patient',
      }
      return map[t] ?? `Type ${t}`
    }

    const filteredEmployees = computed(() => {
      const list = employees.value

      const filtered = !search.value
        ? list
        : (() => {
          const t = search.value.toLowerCase()
          return list.filter((e) =>
            (buildFullName(e) + (e.employeeId ?? '') + (e.phoneNumber ?? '') + (e.email ?? ''))
              .toLowerCase()
              .includes(t),
          )
        })()

      return [...filtered].sort((a, b) => a.userProfileId - b.userProfileId)
    })

    const startRecord = computed(() =>
      totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
    )
    const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

    const changePage = (p: number) => {
      page.value = p
      void loadEmployees()
    }

    const openAddModal = () => {
      selectedEmployee.value = null
      showForm.value = true
    }

    const openEditModal = (e: EmployeeRow) => {
      selectedEmployee.value = e
      showForm.value = true
    }

    const closeModals = () => {
      showForm.value = false
      selectedEmployee.value = null
    }

    const reload = () => {
      closeModals()
      void loadEmployees()
    }

    const askDelete = async (e: EmployeeRow) => {
      const ok = window.confirm(`Delete employee ${buildFullName(e)}?`)
      if (!ok) return
      await employeeService.delete(e.userProfileId)
      await loadEmployees()
    }

    watch(search, () => {
      page.value = 1
      void loadEmployees()
    })

    onMounted(() => {
      void loadEmployees()
    })

    return {
      search,
      loading,
      filteredEmployees,
      buildFullName,
      userTypeLabel,
      page,
      pageSize,
      totalCount,
      startRecord,
      endRecord,
      changePage,
      openAddModal,
      openEditModal,
      askDelete,
      showForm,
      selectedEmployee,
      closeModals,
      reload,
    }
  },
})
</script>

<style scoped>
.employee-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

/* ✅ header layout */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.action-bar {
  margin: 0;
}

/* ✅ Search pill (fixed icon alignment) */
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
  padding: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* ✅ wrapper prevents overflow on mobile */
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.employee-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

.employee-table th,
.employee-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.employee-table th {
  font-weight: 800;
}

.no-records {
  text-align: center;
  padding: 18px;
  color: #6b7280;
}

/* ✅ actions as touch-friendly buttons */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
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
  margin-top: 12px;
  flex-wrap: wrap;
  font-size: 13px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination button {
  border: none;
  background: #eee;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add {
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  background: #172d30;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.loader-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

/* ✅ Mobile tuning */
@media (max-width: 640px) {
  .employee-page {
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
    padding: 10px;
  }

  /* Optional: hide email + hasUser on very small screens */
  .col-email,
  .col-hasuser {
    display: none;
  }

  th.col-email,
  th.col-hasuser {
    display: none;
  }

  .employee-table {
    min-width: 560px;
  }
}
</style>
