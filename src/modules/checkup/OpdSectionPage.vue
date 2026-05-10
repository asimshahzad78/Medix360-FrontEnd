<template>
  <div class="opd-section-page">
    <div class="page-header">
      <div>
        <h2>{{ config.title }}</h2>
        <p>{{ config.subtitle }}</p>
      </div>
      <RouterLink class="secondary-link" to="/opd/workflow">OPD Workflow</RouterLink>
    </div>

    <section class="section-grid">
      <article class="panel">
        <h3>{{ config.formTitle }}</h3>
        <div class="encounter-picker">
          <label class="autocomplete-field">
            <span>Patient</span>
            <input
              v-model.trim="patientSearch"
              type="search"
              placeholder="Search patient by name or mobile"
              autocomplete="off"
              @focus="focusPatientSearch"
            />
            <div v-if="showPatientResults" class="autocomplete-menu">
              <button
                v-for="patient in patientResults"
                :key="patient.Id ?? patient.id"
                type="button"
                @mousedown.prevent="selectPatient(patient)"
              >
                <strong>{{ fullName(patient) }}</strong>
                <small>{{ patient.Phone || patient.phone || 'No mobile' }} - {{ patient.Gender || patient.gender || 'Gender not set' }}</small>
              </button>
              <div v-if="patientSearching" class="autocomplete-empty">Searching...</div>
              <div v-else-if="patientResults.length === 0" class="autocomplete-empty">
                Type at least 3 characters to find a patient.
              </div>
            </div>
          </label>

          <label>
            <span>Visit ID</span>
            <select v-model="selectedVisitId" :disabled="!selectedPatient || visitLoading">
              <option value="">{{ visitPlaceholder }}</option>
              <option v-for="visit in visitOptions" :key="visit.id" :value="visit.visitId">
                {{ visit.visitId }} - {{ formatDate(visit.checkupDate) }} - {{ visit.doctorName || 'No doctor' }}
              </option>
            </select>
          </label>
        </div>

        <div class="form-grid">
          <label v-for="field in config.fields" :key="field.key">
            <span>{{ field.label }}</span>
            <textarea
              v-if="field.type === 'textarea'"
              v-model="formValues[field.key]"
              :placeholder="field.placeholder"
            />
            <input v-else v-model="formValues[field.key]" :type="field.type" :placeholder="field.placeholder" />
          </label>
        </div>
        <div class="actions">
          <button type="button" disabled>Save</button>
          <RouterLink to="/checkups">Encounter List</RouterLink>
        </div>
      </article>

      <article class="panel compact">
        <h3>{{ config.sideTitle }}</h3>
        <ul>
          <li v-for="item in config.steps" :key="item">{{ item }}</li>
        </ul>
      </article>
    </section>

    <section class="panel">
      <div class="section-title">
        <h3>{{ config.tableTitle }}</h3>
        <button type="button" @click="loadRecent">Refresh</button>
      </div>

      <div v-if="loading" class="muted">Loading encounters...</div>
      <div v-else-if="recentEncounters.length === 0" class="muted">No recent encounters found.</div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Visit</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th v-for="column in config.columns" :key="column.key">{{ column.label }}</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="encounter in recentEncounters" :key="encounter.id">
              <td>{{ encounter.visitId }}</td>
              <td>{{ encounter.patientName || '-' }}</td>
              <td>{{ encounter.doctorName || '-' }}</td>
              <td v-for="column in config.columns" :key="column.key">
                {{ column.value(encounter) }}
              </td>
              <td>{{ formatDate(encounter.checkupDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { checkupService, type CheckupListDto } from './checkup.service'
import { patientService, type PatientApiDto } from '@/modules/patient/patient.service'

type SectionKey = 'prescriptions' | 'diagnosis' | 'vitalSigns' | 'procedures' | 'followUps'

type FieldConfig = {
  key: string
  label: string
  type: 'date' | 'number' | 'text' | 'textarea'
  placeholder?: string
}

type ColumnConfig = {
  key: string
  label: string
  value: (encounter: CheckupListDto) => string
}

type SectionConfig = {
  title: string
  subtitle: string
  formTitle: string
  sideTitle: string
  tableTitle: string
  fields: FieldConfig[]
  columns: ColumnConfig[]
  steps: string[]
}

const props = defineProps<{ section: SectionKey }>()

const text = (value: string | null | undefined, fallback = '-') => value?.trim() || fallback

const sectionConfigs: Record<SectionKey, SectionConfig> = {
  prescriptions: {
    title: 'Prescriptions',
    subtitle: 'Medicine instructions and patient prescription notes.',
    formTitle: 'Prescription Entry',
    sideTitle: 'Prescription Checks',
    tableTitle: 'Recent Prescription Encounters',
    fields: [
      { key: 'medicine', label: 'Medicine', type: 'text', placeholder: 'Medicine name' },
      { key: 'days', label: 'No. of Days', type: 'number', placeholder: '0' },
      { key: 'instructions', label: 'Instructions', type: 'textarea', placeholder: 'Dose, timing, meal instructions' },
    ],
    columns: [
      { key: 'advice', label: 'Advice', value: (encounter) => text(encounter.advice) },
      { key: 'symptoms', label: 'Symptoms', value: (encounter) => text(encounter.symptoms) },
    ],
    steps: ['Select encounter', 'Add medicines', 'Set dosage', 'Review instructions', 'Print prescription'],
  },
  diagnosis: {
    title: 'Diagnosis',
    subtitle: 'Symptoms, clinical impression, advice, and diagnostic notes.',
    formTitle: 'Diagnosis Entry',
    sideTitle: 'Diagnosis Flow',
    tableTitle: 'Recent Diagnosis Notes',
    fields: [
      { key: 'symptoms', label: 'Symptoms', type: 'textarea', placeholder: 'Patient symptoms' },
      { key: 'diagnosis', label: 'Diagnosis', type: 'textarea', placeholder: 'Clinical diagnosis' },
      { key: 'advice', label: 'Advice', type: 'textarea', placeholder: 'Advice and plan' },
    ],
    columns: [
      { key: 'symptoms', label: 'Symptoms', value: (encounter) => text(encounter.symptoms) },
      { key: 'diagnosis', label: 'Diagnosis', value: (encounter) => text(encounter.diagnosis) },
      { key: 'advice', label: 'Advice', value: (encounter) => text(encounter.advice) },
    ],
    steps: ['Review complaint', 'Capture symptoms', 'Record diagnosis', 'Add advice', 'Send to billing'],
  },
  vitalSigns: {
    title: 'Vital Signs',
    subtitle: 'Temperature, respiration, blood pressure, and vitals summary.',
    formTitle: 'Vitals Entry',
    sideTitle: 'Vitals Checklist',
    tableTitle: 'Recent Vitals Encounters',
    fields: [
      { key: 'bpSystolic', label: 'BP Systolic', type: 'number', placeholder: '120' },
      { key: 'bpDiastolic', label: 'BP Diastolic', type: 'number', placeholder: '80' },
      { key: 'temperature', label: 'Temperature', type: 'number', placeholder: '98.6' },
      { key: 'respiration', label: 'Respiration Rate', type: 'number', placeholder: '16' },
      { key: 'summary', label: 'Vital Signs Summary', type: 'textarea', placeholder: 'Vitals summary' },
    ],
    columns: [
      { key: 'symptoms', label: 'Symptoms', value: (encounter) => text(encounter.symptoms) },
      { key: 'diagnosis', label: 'Diagnosis', value: (encounter) => text(encounter.diagnosis) },
    ],
    steps: ['Measure BP', 'Record temperature', 'Capture respiration', 'Review alerts', 'Save vitals'],
  },
  procedures: {
    title: 'Procedures',
    subtitle: 'OPD procedures, treatment notes, and procedure billing context.',
    formTitle: 'Procedure Entry',
    sideTitle: 'Procedure Flow',
    tableTitle: 'Recent Procedure Encounters',
    fields: [
      { key: 'procedure', label: 'Procedure', type: 'text', placeholder: 'Procedure name' },
      { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
      { key: 'notes', label: 'Procedure Notes', type: 'textarea', placeholder: 'Procedure details' },
    ],
    columns: [
      { key: 'diagnosis', label: 'Diagnosis', value: (encounter) => text(encounter.diagnosis) },
      { key: 'advice', label: 'Advice', value: (encounter) => text(encounter.advice) },
    ],
    steps: ['Select procedure', 'Confirm quantity', 'Add notes', 'Attach billing', 'Complete procedure'],
  },
  followUps: {
    title: 'Follow-ups',
    subtitle: 'Follow-up planning, next visit notes, and patient instructions.',
    formTitle: 'Follow-up Entry',
    sideTitle: 'Follow-up Flow',
    tableTitle: 'Recent Follow-up Encounters',
    fields: [
      { key: 'nextVisit', label: 'Next Visit Date', type: 'date' },
      { key: 'reason', label: 'Reason', type: 'text', placeholder: 'Review reason' },
      { key: 'instructions', label: 'Instructions', type: 'textarea', placeholder: 'Follow-up instructions' },
    ],
    columns: [
      { key: 'advice', label: 'Advice', value: (encounter) => text(encounter.advice) },
      { key: 'diagnosis', label: 'Diagnosis', value: (encounter) => text(encounter.diagnosis) },
    ],
    steps: ['Choose date', 'Add reason', 'Write instructions', 'Notify patient', 'Close visit'],
  },
}

const config = computed(() => sectionConfigs[props.section])
const recentEncounters = ref<CheckupListDto[]>([])
const loading = ref(false)
const patientSearch = ref('')
const patientResults = ref<PatientApiDto[]>([])
const patientSearching = ref(false)
const selectedPatient = ref<PatientApiDto | null>(null)
const visitOptions = ref<CheckupListDto[]>([])
const visitLoading = ref(false)
const selectedVisitId = ref('')
const formValues = ref<Record<string, string | number>>({})

let patientSearchTimer: ReturnType<typeof setTimeout> | null = null
let suppressPatientSearch = false

const showPatientResults = computed(() => patientSearch.value.length >= 3 && !selectedPatient.value)

const visitPlaceholder = computed(() => {
  if (!selectedPatient.value) return 'Select patient first'
  if (visitLoading.value) return 'Loading visits...'
  if (visitOptions.value.length === 0) return 'No visits found'
  return 'Select latest visit'
})

const fullName = (patient: PatientApiDto) =>
  `${patient.Title ?? patient.title ?? ''} ${patient.FirstName ?? patient.firstName ?? ''} ${patient.LastName ?? patient.lastName ?? ''}`.replace(/\s+/g, ' ').trim()

const focusPatientSearch = () => {
  if (!selectedPatient.value) searchPatients()
}

const searchPatients = async () => {
  const term = patientSearch.value.trim()
  selectedPatient.value = null
  selectedVisitId.value = ''
  visitOptions.value = []

  if (term.length < 3) {
    patientResults.value = []
    return
  }

  patientSearching.value = true
  try {
    patientResults.value = await patientService.search(term)
  } finally {
    patientSearching.value = false
  }
}

watch(patientSearch, () => {
  if (suppressPatientSearch) {
    suppressPatientSearch = false
    return
  }

  if (patientSearchTimer) clearTimeout(patientSearchTimer)
  patientSearchTimer = setTimeout(searchPatients, 250)
})

watch(
  () => props.section,
  () => {
    formValues.value = {}
  },
)

const selectPatient = async (patient: PatientApiDto) => {
  selectedPatient.value = patient
  suppressPatientSearch = true
  const phone = patient.Phone ?? patient.phone ?? ''
  patientSearch.value = phone ? `${fullName(patient)} - ${phone}` : fullName(patient)
  patientResults.value = []
  selectedVisitId.value = ''
  visitOptions.value = []

  const patientId = patient.Id ?? patient.id ?? 0
  if (!patientId) return

  visitLoading.value = true
  try {
    const history = await checkupService.getPatientHistory(patientId)
    visitOptions.value = [...history].sort((a, b) => {
      const dateDiff = new Date(b.checkupDate || 0).getTime() - new Date(a.checkupDate || 0).getTime()
      return dateDiff || b.id - a.id
    })
    selectedVisitId.value = visitOptions.value[0]?.visitId ?? ''
  } finally {
    visitLoading.value = false
  }
}

const loadRecent = async () => {
  loading.value = true
  try {
    const result = await checkupService.getPaged(1, 10)
    recentEncounters.value = result.items
  } finally {
    loading.value = false
  }
}

const formatDate = (value: string) => (value ? new Date(value).toLocaleDateString() : '-')

onMounted(loadRecent)
</script>

<style scoped>
.opd-section-page {
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
li {
  color: #64748b;
  font-size: 13px;
}

.section-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  margin-bottom: 16px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
}

.compact ul {
  margin: 12px 0 0;
  padding-left: 18px;
}

.compact li + li {
  margin-top: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
  margin-top: 18px;
}

label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
}

input,
select,
textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  font-size: 13px;
  padding: 10px 12px;
}

select {
  min-height: 42px;
  background: #fff;
}

textarea {
  min-height: 90px;
  resize: vertical;
}

.encounter-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
  margin-top: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.autocomplete-field {
  position: relative;
}

.autocomplete-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 280px;
  overflow: auto;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
}

.autocomplete-menu button {
  display: grid;
  gap: 4px;
  width: 100%;
  border: 0;
  border-radius: 0;
  background: #fff;
  color: #0f172a;
  padding: 10px 12px;
  text-align: left;
}

.autocomplete-menu button:hover {
  background: #ecfdf5;
}

.autocomplete-menu small,
.autocomplete-empty {
  color: #64748b;
  font-size: 12px;
}

.autocomplete-empty {
  padding: 12px;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 14px;
}

button,
.secondary-link,
.actions a {
  border: none;
  border-radius: 6px;
  background: #166534;
  color: #fff;
  cursor: pointer;
  padding: 10px 14px;
  text-decoration: none;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th,
td {
  border-bottom: 1px solid #e5e7eb;
  padding: 11px 10px;
  text-align: left;
  vertical-align: top;
}

th {
  color: #334155;
  font-size: 12px;
  text-transform: uppercase;
}

td {
  color: #0f172a;
}

@media (max-width: 1000px) {
  .section-grid,
  .encounter-picker,
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .opd-section-page {
    padding: 14px;
  }

  .page-header,
  .section-title {
    flex-direction: column;
  }
}
</style>
