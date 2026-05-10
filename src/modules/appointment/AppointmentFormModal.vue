<template>
  <teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ appointment ? 'Edit Appointment' : 'Add Appointment' }}</h2>
          <button class="close-btn" type="button" aria-label="Close" @click="$emit('close')">x</button>
        </div>

        <div v-if="alertState" :class="['alert', alertState.type === 'success' ? 'alert-success' : 'alert-danger']">
          <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
          <span>{{ alertState.message }}</span>
          <button type="button" class="alert-close" @click="alertState = null">x</button>
        </div>

        <form @submit.prevent="save">
          <div class="grid">
            <div>
              <label>Patient *</label>
              <div class="autocomplete">
                <input
                  v-model="patientSearch"
                  type="search"
                  placeholder="Search patient by name or mobile"
                  autocomplete="off"
                  :disabled="loadingLookups"
                  @focus="showPatientResults = true"
                  @input="onPatientSearchInput"
                  @keydown.down.prevent="movePatientHighlight(1)"
                  @keydown.up.prevent="movePatientHighlight(-1)"
                  @keydown.enter.prevent="selectHighlightedPatient"
                  @keydown.esc="showPatientResults = false"
                />
                <div v-if="showPatientResults" class="autocomplete-menu">
                  <button
                    v-for="(patient, index) in patientResults"
                    :key="patient.id"
                    :class="['autocomplete-option', { highlighted: highlightedPatientIndex === index }]"
                    type="button"
                    @mousedown.prevent="selectPatient(patient)"
                  >
                    <span>{{ patient.name }}</span>
                    <small>{{ patient.mobile || 'No mobile number' }}</small>
                  </button>
                  <div v-if="patientSearching" class="autocomplete-empty">Searching...</div>
                  <div v-else-if="patientResults.length === 0" class="autocomplete-empty">
                    Type a name or mobile number
                  </div>
                </div>
              </div>
              <p v-if="errors.patientId" class="field-error">{{ errors.patientId }}</p>
            </div>

            <div>
              <label>Doctor *</label>
              <select v-model.number="form.doctorId" :disabled="loadingLookups" @change="clearError('doctorId')">
                <option :value="null">Select doctor</option>
                <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }}
                </option>
              </select>
              <p v-if="errors.doctorId" class="field-error">{{ errors.doctorId }}</p>
            </div>

            <div>
              <label>Patient Type *</label>
              <select v-model="form.patientType" @change="clearError('patientType')">
                <option value="">Select type</option>
                <option value="1">Out Patient</option>
                <option value="2">In Patient</option>
              </select>
              <p v-if="errors.patientType" class="field-error">{{ errors.patientType }}</p>
            </div>

            <div>
              <label>Serial No *</label>
              <input v-model.number="form.serialNo" type="number" min="1" @input="clearError('serialNo')" />
              <p v-if="errors.serialNo" class="field-error">{{ errors.serialNo }}</p>
            </div>

            <div>
              <label>Appointment Date *</label>
              <input v-model="form.appointmentDate" type="date" @input="clearError('appointmentDate')" />
              <p v-if="errors.appointmentDate" class="field-error">{{ errors.appointmentDate }}</p>
            </div>

            <div>
              <label>Appointment Time *</label>
              <input v-model="form.appointmentTime" type="time" @input="clearError('appointmentTime')" />
              <p v-if="errors.appointmentTime" class="field-error">{{ errors.appointmentTime }}</p>
            </div>

            <div class="full">
              <label>Note</label>
              <textarea v-model="form.note" rows="3" placeholder="Reason, instructions, or scheduling notes"></textarea>
            </div>
          </div>

          <div class="actions">
            <button class="btn-primary" type="submit" :disabled="saving || loadingLookups">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button class="btn-secondary" type="button" @click="$emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { appointmentService, type AppointmentListDto } from './appointment.service'
import { patientService, type PatientApiDto } from '@/modules/patient/patient.service'
import { doctorService } from '@/modules/doctor/doctor.service'
import { getApiErrorMessage } from '@/services/api-response'

interface LookupOption {
  id: number
  name: string
}

interface PatientLookupOption extends LookupOption {
  mobile: string
}

type AlertState = {
  type: 'success' | 'error'
  message: string
}

const toDateInput = (value?: string) => {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.includes('T') ? value.slice(0, 10) : value.slice(0, 10)
}

const toTimeInput = (value?: string) => {
  if (!value) return new Date().toTimeString().slice(0, 5)
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5)

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toTimeString().slice(0, 5)
}

export default defineComponent({
  props: {
    appointment: {
      type: Object as () => AppointmentListDto | null,
      default: null,
    },
    nextSerialNo: {
      type: Number,
      default: 1,
    },
  },
  emits: ['saved', 'close'],
  setup(props, { emit }) {
    const loadingLookups = ref(false)
    const patientSearching = ref(false)
    const saving = ref(false)
    const alertState = ref<AlertState | null>(null)
    const patientResults = ref<PatientLookupOption[]>([])
    const patientSearch = ref('')
    const showPatientResults = ref(false)
    const highlightedPatientIndex = ref(-1)
    const doctors = ref<LookupOption[]>([])
    let patientSearchTimer: ReturnType<typeof setTimeout> | null = null

    const form = reactive({
      patientId: null as number | null,
      patientType: '1',
      doctorId: null as number | null,
      serialNo: props.nextSerialNo as number | null,
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: new Date().toTimeString().slice(0, 5),
      note: '',
    })

    const errors = reactive({
      patientId: '',
      patientType: '',
      doctorId: '',
      serialNo: '',
      appointmentDate: '',
      appointmentTime: '',
    })

    const isEdit = computed(() => Boolean(props.appointment?.id))

    const clearError = (key: keyof typeof errors) => {
      errors[key] = ''
    }

    const toPatientOption = (patient: PatientApiDto): PatientLookupOption => {
      const id = patient.Id ?? patient.id ?? 0
      const name = `${patient.Title ?? ''} ${patient.FirstName ?? ''} ${patient.LastName ?? ''}`.trim()
      const mobile = patient.Phone ?? patient.phone ?? ''

      return {
        id,
        name: name || `Patient #${id}`,
        mobile,
      }
    }

    const searchPatients = async (term = patientSearch.value) => {
      const query = term.trim()
      patientSearching.value = true
      try {
        const items =
          query.length >= 2
            ? await patientService.search(query)
            : (await patientService.getPaged(1, 12)).items

        patientResults.value = items.map(toPatientOption).filter((patient) => patient.id > 0)
        highlightedPatientIndex.value = patientResults.value.length > 0 ? 0 : -1
      } catch (error: unknown) {
        patientResults.value = []
        alertState.value = {
          type: 'error',
          message: getApiErrorMessage(error, 'Could not search patients.'),
        }
      } finally {
        patientSearching.value = false
      }
    }

    const onPatientSearchInput = () => {
      form.patientId = null
      clearError('patientId')
      showPatientResults.value = true
      if (patientSearchTimer) clearTimeout(patientSearchTimer)
      patientSearchTimer = setTimeout(() => searchPatients(), 250)
    }

    const selectPatient = (patient: PatientLookupOption) => {
      form.patientId = patient.id
      patientSearch.value = patient.mobile ? `${patient.name} - ${patient.mobile}` : patient.name
      showPatientResults.value = false
      clearError('patientId')
    }

    const movePatientHighlight = (direction: number) => {
      if (patientResults.value.length === 0) return

      const nextIndex = highlightedPatientIndex.value + direction
      if (nextIndex < 0) {
        highlightedPatientIndex.value = patientResults.value.length - 1
      } else if (nextIndex >= patientResults.value.length) {
        highlightedPatientIndex.value = 0
      } else {
        highlightedPatientIndex.value = nextIndex
      }
    }

    const selectHighlightedPatient = () => {
      const patient = patientResults.value[highlightedPatientIndex.value]
      if (patient) selectPatient(patient)
    }

    const loadLookups = async () => {
      loadingLookups.value = true
      try {
        const [patientResult, doctorResult] = await Promise.all([
          patientService.getPaged(1, 12),
          doctorService.getAll(),
        ])

        patientResults.value = patientResult.items.map(toPatientOption).filter((patient) => patient.id > 0)

        doctors.value = doctorResult.items.map((doctor) => ({
          id: doctor.DocId ?? doctor.docId ?? doctor.Id ?? doctor.id ?? 0,
          name: `Dr ${doctor.FirstName ?? doctor.firstName ?? ''} ${doctor.LastName ?? doctor.lastName ?? ''}`.trim(),
        }))
      } catch (error: unknown) {
        alertState.value = {
          type: 'error',
          message: getApiErrorMessage(error, 'Could not load patients and doctors.'),
        }
      } finally {
        loadingLookups.value = false
      }
    }

    const hydrateForm = () => {
      if (!props.appointment) {
        form.patientId = null
        patientSearch.value = ''
        showPatientResults.value = false
        form.patientType = '1'
        form.doctorId = null
        form.serialNo = props.nextSerialNo
        form.appointmentDate = new Date().toISOString().slice(0, 10)
        form.appointmentTime = new Date().toTimeString().slice(0, 5)
        form.note = ''
        return
      }

      form.patientId = props.appointment.patientId || null
      patientSearch.value =
        props.appointment.patientName || (props.appointment.patientId ? `Patient #${props.appointment.patientId}` : '')
      showPatientResults.value = false
      form.patientType = props.appointment.patientType || '1'
      form.doctorId = props.appointment.doctorId || null
      form.serialNo = props.appointment.serialNo || props.nextSerialNo
      form.appointmentDate = toDateInput(props.appointment.appointmentDate)
      form.appointmentTime = toTimeInput(props.appointment.appointmentTime || props.appointment.appointmentTimeDisplay)
      form.note = props.appointment.note
    }

    const validate = () => {
      errors.patientId = ''
      errors.patientType = ''
      errors.doctorId = ''
      errors.serialNo = ''
      errors.appointmentDate = ''
      errors.appointmentTime = ''

      let ok = true

      if (!form.patientId) {
        errors.patientId = 'Patient is required.'
        ok = false
      }
      if (!form.doctorId) {
        errors.doctorId = 'Doctor is required.'
        ok = false
      }
      if (!form.patientType) {
        errors.patientType = 'Patient type is required.'
        ok = false
      }
      if (!form.serialNo || form.serialNo < 1) {
        errors.serialNo = 'Serial number must be 1 or higher.'
        ok = false
      }
      if (!form.appointmentDate) {
        errors.appointmentDate = 'Appointment date is required.'
        ok = false
      }
      if (!form.appointmentTime) {
        errors.appointmentTime = 'Appointment time is required.'
        ok = false
      }

      return ok
    }

    const save = async () => {
      if (!validate()) {
        alertState.value = { type: 'error', message: 'Please fix the highlighted fields.' }
        return
      }

      saving.value = true
      try {
        const payload = {
          id: props.appointment?.id,
          patientId: form.patientId,
          patientType: form.patientType,
          doctorId: form.doctorId,
          serialNo: form.serialNo,
          appointmentDate: form.appointmentDate,
          appointmentTime: `${form.appointmentDate}T${form.appointmentTime}:00`,
          note: form.note,
        }

        if (isEdit.value && props.appointment?.id) {
          await appointmentService.update(props.appointment.id, payload)
          alertState.value = { type: 'success', message: 'Appointment updated successfully.' }
        } else {
          await appointmentService.create(payload)
          alertState.value = { type: 'success', message: 'Appointment added successfully.' }
        }

        setTimeout(() => {
          emit('saved')
        }, 600)
      } catch (error: unknown) {
        alertState.value = {
          type: 'error',
          message: getApiErrorMessage(error, 'Could not save appointment.'),
        }
      } finally {
        saving.value = false
      }
    }

    watch(() => props.appointment, hydrateForm, { immediate: true })
    watch(() => props.nextSerialNo, hydrateForm)
    onMounted(loadLookups)
    onBeforeUnmount(() => {
      if (patientSearchTimer) clearTimeout(patientSearchTimer)
    })

    return {
      alertState,
      clearError,
      doctors,
      errors,
      form,
      highlightedPatientIndex,
      loadingLookups,
      movePatientHighlight,
      onPatientSearchInput,
      patientResults,
      patientSearch,
      patientSearching,
      selectHighlightedPatient,
      selectPatient,
      save,
      saving,
      showPatientResults,
    }
  },
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(15, 23, 42, 0.52);
}

.modal-card {
  width: 760px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  padding: 22px 24px 18px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.close-btn,
.alert-close {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.alert span {
  flex: 1;
}

.alert-success {
  color: #0f5132;
  background: #d1e7dd;
  border: 1px solid #badbcc;
}

.alert-danger {
  color: #842029;
  background: #f8d7da;
  border: 1px solid #f5c2c7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}

.full {
  grid-column: span 2;
}

label {
  display: inline-block;
  margin-bottom: 5px;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

input,
select,
textarea {
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 9px 11px;
  color: #111827;
  font-size: 13px;
}

.autocomplete {
  position: relative;
}

.autocomplete-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.16);
}

.autocomplete-option {
  display: flex;
  width: 100%;
  border: none;
  border-bottom: 1px solid #edf2f7;
  background: #fff;
  padding: 9px 11px;
  color: #111827;
  cursor: pointer;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.autocomplete-option:last-child {
  border-bottom: none;
}

.autocomplete-option:hover,
.autocomplete-option.highlighted {
  background: #f0fdf4;
}

.autocomplete-option span {
  font-size: 13px;
  font-weight: 700;
}

.autocomplete-option small,
.autocomplete-empty {
  color: #64748b;
  font-size: 12px;
}

.autocomplete-empty {
  padding: 10px 11px;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #34c759;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.16);
}

.field-error {
  margin: 6px 0 0;
  color: #b42318;
  font-size: 12px;
}

.actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  background: #fff;
  border-top: 1px solid #eef2f7;
}

.btn-primary,
.btn-secondary {
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  border: none;
  background: #34c759;
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .full {
    grid-column: span 1;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
