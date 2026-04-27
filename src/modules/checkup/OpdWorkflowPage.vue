<template>
  <div class="opd-page">
    <div class="page-header">
      <div>
        <h2>OPD Workflow</h2>
        <p>Start an encounter, capture vitals and diagnosis, add prescription/orders, then collect payment.</p>
      </div>
      <RouterLink class="secondary-link" to="/checkups">Encounter List</RouterLink>
    </div>

    <section class="workspace">
      <div class="search-panel">
        <h3>Find Patient</h3>
        <input v-model.trim="patientSearch" type="search" placeholder="Search by name or phone" />

        <div v-if="searching" class="muted">Searching...</div>

        <button
          v-for="patient in patients"
          :key="patient.Id"
          type="button"
          class="patient-row"
          @click="selectPatient(patient)"
        >
          <strong>{{ patient.Title }} {{ patient.FirstName }} {{ patient.LastName }}</strong>
          <span>{{ patient.Phone }} · {{ patient.Gender }} · {{ patient.AgeDisplay || patient.Age || 'Age not set' }}</span>
        </button>

        <div v-if="!searching && patientSearch.length >= 3 && patients.length === 0" class="muted">
          No matching patients found.
        </div>
      </div>

      <div class="encounter-panel">
        <template v-if="selectedPatient">
          <div class="selected-card">
            <span>Selected patient</span>
            <strong>{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</strong>
            <small>{{ selectedPatient.phone }} · {{ selectedPatient.gender }}</small>
          </div>

          <button type="button" class="primary-action" @click="showEncounter = true">
            Start OPD Encounter
          </button>
        </template>

        <template v-else>
          <div class="empty-state">
            <h3>Select a patient to begin</h3>
            <p>Use the search panel to find an existing registration before creating the encounter.</p>
          </div>
        </template>
      </div>
    </section>

    <section class="recent-section">
      <div class="section-title">
        <h3>Recent Encounters</h3>
        <button type="button" @click="loadRecent">Refresh</button>
      </div>

      <div v-if="recentLoading" class="muted card">Loading encounters...</div>

      <div v-else class="recent-grid">
        <article v-for="encounter in recentEncounters" :key="encounter.id" class="card">
          <span>Visit {{ encounter.visitId }}</span>
          <strong>{{ encounter.patientName }}</strong>
          <small>{{ encounter.doctorName }} · {{ formatDate(encounter.checkupDate) }}</small>
        </article>
      </div>
    </section>

    <Teleport to="body">
      <CheckupModal
        v-if="showEncounter && selectedPatient"
        :patient="selectedPatient"
        @saved="onEncounterSaved"
        @close="showEncounter = false"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CheckupModal from './CheckupModal.vue'
import { checkupService, type CheckupListDto } from './checkup.service'
import { patientService, type PatientApiDto } from '@/modules/patient/patient.service'

type SelectedPatient = {
  id: number
  firstName: string
  lastName: string
  phone: string
  gender: string
}

const router = useRouter()
const patientSearch = ref('')
const patients = ref<PatientApiDto[]>([])
const searching = ref(false)
const selectedPatient = ref<SelectedPatient | null>(null)
const showEncounter = ref(false)
const recentEncounters = ref<CheckupListDto[]>([])
const recentLoading = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(patientSearch, () => {
  selectedPatient.value = null
  if (searchTimer) clearTimeout(searchTimer)

  searchTimer = setTimeout(async () => {
    if (patientSearch.value.length < 3) {
      patients.value = []
      return
    }

    searching.value = true
    try {
      patients.value = await patientService.search(patientSearch.value)
    } finally {
      searching.value = false
    }
  }, 300)
})

const selectPatient = (patient: PatientApiDto) => {
  selectedPatient.value = {
    id: patient.Id,
    firstName: patient.FirstName ?? '',
    lastName: patient.LastName ?? '',
    phone: patient.Phone ?? '',
    gender: patient.Gender ?? '',
  }
}

const loadRecent = async () => {
  recentLoading.value = true
  try {
    const result = await checkupService.getPaged(1, 8)
    recentEncounters.value = result.items
  } finally {
    recentLoading.value = false
  }
}

const onEncounterSaved = (paymentId?: number) => {
  showEncounter.value = false
  loadRecent()

  if (typeof paymentId === 'number' && paymentId > 0) {
    router.push({ name: 'PaymentPrint', params: { id: paymentId } })
  }
}

const formatDate = (value: string) => (value ? new Date(value).toLocaleString() : 'Not dated')

onMounted(loadRecent)
</script>

<style scoped>
.opd-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

.page-header,
.section-title {
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

p,
.muted,
small {
  color: #64748b;
  font-size: 13px;
}

.secondary-link,
.primary-action,
.section-title button {
  border: none;
  border-radius: 6px;
  background: #166534;
  color: #fff;
  cursor: pointer;
  padding: 10px 14px;
  text-decoration: none;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.search-panel,
.encounter-panel,
.card,
.empty-state,
.selected-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.search-panel,
.encounter-panel {
  padding: 16px;
}

.search-panel input {
  width: 100%;
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 12px;
  margin: 12px 0;
}

.patient-row {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 8px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.patient-row:hover {
  border-color: #16a34a;
}

.encounter-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.selected-card,
.empty-state,
.card {
  padding: 14px;
}

.selected-card span,
.card span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 4px;
}

.selected-card strong,
.card strong {
  display: block;
  color: #0f172a;
  font-size: 18px;
}

.primary-action {
  align-self: flex-start;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1000px) {
  .workspace,
  .recent-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .opd-page {
    padding: 14px;
  }

  .page-header,
  .section-title {
    flex-direction: column;
  }
}
</style>
