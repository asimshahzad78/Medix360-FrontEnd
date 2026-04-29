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
        <div class="form-grid">
          <label v-for="field in config.fields" :key="field.key">
            <span>{{ field.label }}</span>
            <textarea v-if="field.type === 'textarea'" :placeholder="field.placeholder" />
            <input v-else :type="field.type" :placeholder="field.placeholder" />
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
import { computed, onMounted, ref } from 'vue'
import { checkupService, type CheckupListDto } from './checkup.service'

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
      { key: 'visit', label: 'Visit ID', type: 'text', placeholder: 'Visit number' },
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
      { key: 'visit', label: 'Visit ID', type: 'text', placeholder: 'Visit number' },
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
      { key: 'visit', label: 'Visit ID', type: 'text', placeholder: 'Visit number' },
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
      { key: 'visit', label: 'Visit ID', type: 'text', placeholder: 'Visit number' },
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
      { key: 'visit', label: 'Visit ID', type: 'text', placeholder: 'Visit number' },
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
  gap: 12px;
  margin-top: 14px;
}

label {
  display: grid;
  gap: 6px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  font-size: 13px;
  padding: 10px 12px;
}

textarea {
  min-height: 90px;
  resize: vertical;
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
