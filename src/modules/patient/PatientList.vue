<template>
  <div class="patient-page">
    <!-- Header -->
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" @click="openAddModal">+ Add New</button>
      </div>

      <div class="search-box">
        <input v-model="search" placeholder="Search here" />
        <span class="icon">🔍</span>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" />
    </div>

    <!-- Table -->
    <div v-else class="card">
      <!-- ✅ Responsive table wrapper -->
      <div class="table-wrap">
        <table class="patient-table">
          <thead>
            <tr>
              <th class="text-left">ID</th>
              <th class="text-left">Name</th>
              <th class="text-left col-gender">Gender</th>
              <th class="text-left col-age">Age</th>
              <th class="text-left">Phone</th>
              <th class="text-left">Panel</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="p in filteredPatients" :key="p.id">
              <td class="col-id">{{ p.id }}</td>
              <td class="col-name">{{ buildFullName(p) }}</td>
              <td class="col-gender">{{ p.gender }}</td>
              <td class="col-age">
                {{ p.ageDisplay || (p.age ? `${p.age} ${p.ageUnit || ''}`.trim() : '') }}
              </td>
              <td class="col-phone">{{ p.phone }}</td>
              <td class="col-phone">{{ p.panel }}</td>
              <td class="actions">
                <button class="icon-btn" type="button" title="Checkup" @click="openCheckupModal(p)">
                  🩺
                </button>
                <button class="icon-btn" type="button" title="Edit" @click="openEditModal(p)">
                  ✏️
                </button>
                <button class="icon-btn" type="button" title="History" @click="openHistoryModal(p)">
                  📜
                </button>
              </td>
            </tr>

            <tr v-if="filteredPatients.length === 0">
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
      <PatientFormModal v-if="showForm" :patientId="selectedPatient?.id" @saved="reload" @close="closeModals" />

      <PatientHistoryModal v-if="showHistory && selectedPatient" :patientId="selectedPatient.id" @close="closeModals" />

      <CheckupModal v-if="showCheckup && selectedPatient" :patient="selectedPatient" @saved="onCheckupSaved"
        @close="closeModals" />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { patientService, type PatientApiDto } from './patient.service'
import { useRouter } from 'vue-router'

import PatientFormModal from './PatientFormModal.vue'
import PatientHistoryModal from './PatientHistoryModal.vue'
import CheckupModal from '../checkup/CheckupModal.vue'

interface Patient {
  id: number
  title: string
  firstName: string
  lastName: string
  gender: string
  maritalStatus: string
  phone: string
  panel?: string
  age: number
  ageDisplay?: string      // ✅ add
  ageUnit?: string

}

export default defineComponent({
  components: {
    PatientFormModal,
    PatientHistoryModal,
    CheckupModal,
  },

  setup() {
    const patients = ref<Patient[]>([])
    const search = ref('')
    const loading = ref(false)

    const page = ref(1)
    const pageSize = ref(25)
    const totalCount = ref(0)

    const showForm = ref(false)
    const showHistory = ref(false)
    const showCheckup = ref(false)

    const selectedPatient = ref<Patient | null>(null)

    const loadPatients = async () => {
      loading.value = true
      const res = await patientService.getPaged(page.value, pageSize.value, search.value) // ✅ pass search
      totalCount.value = res.totalCount
      patients.value = res.items.map((p: PatientApiDto) => ({
        id: p.Id,
        title: p.Title ?? '',
        firstName: p.FirstName ?? '',
        lastName: p.LastName ?? '',
        gender: p.Gender ?? '',
        maritalStatus: p.MaritalStatus ?? '',
        phone: p.Phone ?? '',
        panel: p.Panel ?? '',
        age: p.Age ?? 0,
        ageDisplay: p.AgeDisplay ?? '',
        ageUnit: p.AgeUnit ?? '',
      }))
      loading.value = false
    }

    const buildFullName = (p: Patient) => `${p.title} ${p.firstName} ${p.lastName}`.trim()

    const filteredPatients = computed(() => patients.value)

    const startRecord = computed(() =>
      totalCount.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1,
    )
    const endRecord = computed(() => Math.min(page.value * pageSize.value, totalCount.value))

    const changePage = (p: number) => {
      page.value = p
      loadPatients()
    }

    const openAddModal = () => {
      selectedPatient.value = null
      showForm.value = true
    }

    const openEditModal = (p: Patient) => {
      selectedPatient.value = p
      showForm.value = true
    }

    const openHistoryModal = (p: Patient) => {
      selectedPatient.value = p
      showHistory.value = true
    }

    const openCheckupModal = (p: Patient) => {
      selectedPatient.value = p
      showCheckup.value = true
    }

    const closeModals = () => {
      showForm.value = false
      showHistory.value = false
      showCheckup.value = false
      selectedPatient.value = null
    }

    const reload = () => {
      closeModals()
      loadPatients()
    }

    const router = useRouter()

    /*  type CheckupSavedPayload =
       | number
       | { paymentId?: number; invoiceId?: number; id?: number } */

    const onCheckupSaved = (paymentId?: number) => {
      closeModals()

      if (typeof paymentId === 'number' && paymentId > 0) {
        router.push({ name: 'PaymentPrint', params: { id: paymentId } })
      } else {
        loadPatients()
      }
    }

    let tmr: ReturnType<typeof setTimeout> | null = null

    watch(search, () => {
      page.value = 1
      if (tmr) clearTimeout(tmr)
      tmr = setTimeout(() => {
        loadPatients()
      }, 300)
    })
    onMounted(loadPatients)

    return {
      search,
      loading,
      filteredPatients,
      buildFullName,
      page,
      pageSize,
      onCheckupSaved,
      totalCount,
      startRecord,
      endRecord,
      changePage,
      openAddModal,
      openEditModal,
      openHistoryModal,
      openCheckupModal,
      showForm,
      showHistory,
      showCheckup,
      selectedPatient,
      closeModals,
      reload,
    }
  },
})
</script>

<style scoped>
.patient-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

/* ✅ responsive header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.action-bar {
  margin: 0;
}

/* ✅ Search (fixed, mobile-perfect) */
.search-box {
  position: relative;
  width: 100%;
  max-width: 420px;
  /* desktop */
}

.search-box input {
  width: 100%;
  height: 44px;
  /* ✅ fixed height */
  line-height: 44px;
  padding: 0 44px 0 16px;
  /* ✅ space for icon */
  border-radius: 999px;
  border: 1px solid #d8e3d8;
  background: #ffffff;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  -webkit-appearance: none;
  /* ✅ iOS fix */
  appearance: none;
}

.search-box input:focus {
  border-color: #34c759;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.15);
}

/* icon centered perfectly */
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
  opacity: 0.8;
}

.btn-add {
  background: #34c759;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 30px;
  cursor: pointer;
  white-space: nowrap;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* ✅ horizontal scroll for mobile */
.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* keep table usable; allow scrolling instead of squeezing */
.patient-table {
  width: 100%;
  min-width: 820px;
  /* important: prevents ugly squeeze */
  border-collapse: collapse;
}

.patient-table th,
.patient-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.patient-table tbody tr:hover {
  background: #f7fbf7;
}

.text-left {
  text-align: left;
}

.no-records {
  text-align: center;
  padding: 18px;
  color: #6b7280;
}

/* ✅ actions as buttons (better on mobile) */
.actions {
  display: flex;
  align-items: center;
  gap: 6px;
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
  margin-top: 16px;
  font-size: 13px;
  flex-wrap: wrap;
  /* ✅ allows wrap on small screens */
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
  align-items: center;
  padding: 40px;
}

/* ✅ Mobile tuning */
@media (max-width: 640px) {
  .patient-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    flex: 1;
    max-width: 100%;
  }

  .btn-add {
    width: 100%;
  }

  .card {
    padding: 8px;
  }

  /* Optional: hide some columns on very small screens */
  .col-gender,
  .col-marital,
  .col-age {
    display: none;
  }

  /* match headers */
  th.col-gender,
  th.col-marital,
  th.col-age {
    display: none;
  }

  /* reduce min-width when hiding columns */
  .patient-table {
    min-width: 520px;
  }
}
</style>
