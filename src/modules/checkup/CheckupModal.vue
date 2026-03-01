<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2>New Checkup</h2>

      <!-- ALERT WRAPPER -->
      <div v-if="alertState" class="alert-wrapper">
        <div :class="[
          'alert',
          alertState.type === 'success' ? 'alert-success' : 'alert-danger',
          'fade',
          'show',
        ]">
          <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
          {{ alertState.message }}
          <button type="button" class="btn-close" @click="alertState = null"></button>
        </div>
      </div>

      <form @submit.prevent="save">
        <!-- TABS -->
        <div class="tabs">
          <button :class="{ active: tab === 'info' }" @click.prevent="tab = 'info'">Info</button>
          <button :class="{ active: tab === 'vitals' }" @click.prevent="tab = 'vitals'">
            Vitals
          </button>
          <button :class="{ active: tab === 'medicine' }" @click.prevent="tab = 'medicine'">
            Medicine
          </button>
          <button :class="{ active: tab === 'tests' }" @click.prevent="tab = 'tests'">Labs</button>
        </div>

        <!-- ================= INFO TAB ================= -->
        <div v-if="tab === 'info'" class="grid">
          <div>
            <label>Patient</label>
            <input type="text" :value="patient.firstName + ' ' + patient.lastName" disabled />
          </div>

          <div>
            <label>Patient Type</label>
            <select v-model="form.patientType">
              <option value="Out Patient">Out Patient</option>
              <option value="In Patient">In Patient</option>
            </select>
          </div>

          <div>
            <label>Doctor</label>
            <select v-model.number="form.doctorId">
              <option :value="null">--- SELECT ---</option>
              <option v-for="d in doctors" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>

          <div>
            <label>Checkup Date</label>
            <input type="date" v-model="form.checkupDate" />
          </div>

          <div>
            <label>Payment Mode</label>
            <select v-model="form.paymentMode">
              <option value="">--- SELECT ---</option>
              <option value="Free">Free</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Wallet">Wallet</option>
              <option value="Online Transfer">Online Transfer</option>
            </select>
          </div>

          <div>
            <label>Payment Account</label>
            <select v-model="selectedAccountId">
              <option :value="null">--- SELECT ---</option>
              <option v-for="a in paymentAccounts" :key="a.Id" :value="a.Id">
                {{ a.Name }}
              </option>
            </select>
          </div>
        </div>

        <!-- ================= VITALS TAB ================= -->
        <div v-if="tab === 'vitals'" class="grid">
          <div>
            <label>BP Systolic</label>
            <input type="number" v-model="form.bpSystolic" />
          </div>

          <div>
            <label>BP Diastolic</label>
            <input type="number" v-model="form.bpDiastolic" />
          </div>

          <div>
            <label>Respiration Rate</label>
            <input type="number" v-model="form.respirationRate" />
          </div>

          <div>
            <label>Temperature</label>
            <input type="number" v-model="form.temperature" />
          </div>

          <div class="full">
            <label>Symptoms</label>
            <textarea v-model="form.symptoms"></textarea>
          </div>

          <div class="full">
            <label>Diagnosis</label>
            <textarea v-model="form.diagnosis"></textarea>
          </div>

          <div class="full">
            <label>HPI</label>
            <textarea v-model="form.hpi"></textarea>
          </div>

          <div class="full">
            <label>Physical Examination</label>
            <textarea v-model="form.physicalExamination"></textarea>
          </div>

          <div class="full">
            <label>Nursing Notes</label>
            <textarea v-model="form.nursingNotes"></textarea>
          </div>

          <div class="full">
            <label>Advice</label>
            <textarea v-model="form.advice"></textarea>
          </div>

          <div class="full">
            <label>Comments</label>
            <textarea v-model="form.comments"></textarea>
          </div>
        </div>

        <!-- ================= MEDICINE TAB ================= -->
        <div v-if="tab === 'medicine'">
          <div class="grid">
            <div>
              <label>Medicine Name</label>
              <input v-model="newMed.name" />
            </div>

            <div>
              <label>No of Days</label>
              <input type="number" v-model="newMed.noOfDays" />
            </div>

            <div>
              <label>When To Take</label>
              <input v-model="newMed.whenToTake" />
            </div>

            <div>
              <label>
                <input type="checkbox" v-model="newMed.isBeforeMeal" />
                Before Meal
              </label>
            </div>

            <div class="full">
              <button type="button" class="btn-primary" @click="addMedicine">Add Medicine</button>
            </div>
          </div>

          <table class="simple-table">
            <tr v-for="(m, i) in form.medicines" :key="i">
              <td>{{ m.name }}</td>
              <td>{{ m.noOfDays }}</td>
              <td>{{ m.whenToTake }}</td>
              <td>
                <button class="btn-danger-sm" @click="removeMedicine(i)">X</button>
              </td>
            </tr>
          </table>
        </div>

        <!-- ================= LABS TAB ================= -->
        <div v-if="tab === 'tests'">
          <div class="grid">
            <div>
              <label>Test Name</label>
              <input v-model="newTest.name" />
            </div>

            <div>
              <label>Price</label>
              <input type="number" v-model="newTest.price" />
            </div>

            <div class="full">
              <button type="button" class="btn-primary" @click="addTest">Add Test</button>
            </div>
          </div>

          <table class="simple-table">
            <tr v-for="(t, i) in form.labTests" :key="i">
              <td>{{ t.name }}</td>
              <td>{{ t.price }}</td>
              <td>
                <button class="btn-danger-sm" @click="removeTest(i)">X</button>
              </td>
            </tr>
          </table>
        </div>

        <!-- ACTIONS -->
        <div class="actions">
          <button class="btn-primary">Save</button>
          <button type="button" class="btn-secondary" @click="$emit('close')">Close</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { doctorService } from '../doctor/doctor.service'
import { checkupService } from './checkup.service'
import { financeService } from '../finance/finance.service'
import type { AxiosError } from 'axios'

type TabType = 'info' | 'vitals' | 'medicine' | 'tests'
type AlertType = 'success' | 'error'

interface AlertState {
  type: AlertType
  message: string
}

interface ApiErrorResponse {
  message?: string
}

interface DoctorItem {
  id: number
  name: string
  fee: number
}

interface PaymentAccountItem {
  Id: string
  Name: string
  Code: string
}

interface MedicineItem {
  medicineId: number | null
  name: string
  noOfDays: number
  whenToTake: string
  isBeforeMeal: boolean
}

interface LabTestItem {
  testId: number | null
  name: string
  price: number
}

interface CheckupForm {
  patientId: number
  doctorId: number | null
  patientType: string
  checkupDate: string
  paymentMode: string

  bpSystolic: number | null
  bpDiastolic: number | null
  respirationRate: number | null
  temperature: number | null
  symptoms: string
  diagnosis: string
  hpi: string
  physicalExamination: string
  advice: string
  comments: string
  nursingNotes: string
  medicines: MedicineItem[]
  labTests: LabTestItem[]
}

/** ✅ This matches your API after backend fix: DocId = DoctorsInfo.Id */
interface DoctorApiItem {
  DocId: number
  FirstName: string
  LastName: string
  DoctorFee: number | null
}

interface DoctorPagedResponse {
  items: DoctorApiItem[]
  totalCount: number
}

export default defineComponent({
  props: {
    patient: {
      type: Object as () => { id: number; firstName: string; lastName: string },
      required: true,
    },
  },
  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const tab = ref<TabType>('info')
    const alertState = ref<AlertState | null>(null)

    const doctors = ref<DoctorItem[]>([])
    const paymentAccounts = ref<PaymentAccountItem[]>([])

    const selectedAccountId = ref<string | null>(null)
    const selectedDoctorFee = ref<number>(0)

    const form = reactive<CheckupForm>({
      patientId: props.patient.id,
      doctorId: null,
      patientType: 'Out Patient',
      checkupDate: new Date().toISOString().slice(0, 10),
      paymentMode: 'Cash',

      bpSystolic: null,
      bpDiastolic: null,
      respirationRate: null,
      temperature: null,
      symptoms: '',
      diagnosis: '',
      hpi: '',
      physicalExamination: '',
      advice: '',
      comments: '',
      nursingNotes: '',
      medicines: [],
      labTests: [],
    })

    const isCashAccountSelected = (): boolean => {
      const acc = paymentAccounts.value.find((a) => a.Id === selectedAccountId.value)
      return acc ? acc.Name.toLowerCase().includes('cash') : false
    }

    watch(
      () => form.doctorId,
      (doctorId) => {
        const doc = doctors.value.find((d) => d.id === doctorId)
        selectedDoctorFee.value = doc?.fee ?? 0
      },
    )

    const newMed = reactive<MedicineItem>({
      medicineId: null,
      name: '',
      noOfDays: 1,
      whenToTake: '',
      isBeforeMeal: false,
    })

    const newTest = reactive<LabTestItem>({
      testId: null,
      name: '',
      price: 0,
    })

    const addMedicine = (): void => {
      form.medicines.push({ ...newMed })
    }

    const removeMedicine = (i: number): void => {
      form.medicines.splice(i, 1)
    }

    const addTest = (): void => {
      form.labTests.push({ ...newTest })
    }

    const removeTest = (i: number): void => {
      form.labTests.splice(i, 1)
    }

    onMounted(async () => {
      const res = (await doctorService.getAll()) as DoctorPagedResponse

      doctors.value = (res.items ?? []).map((d): DoctorItem => ({
        id: d.DocId,
        name: `${d.FirstName} ${d.LastName}`.trim(),
        fee: d.DoctorFee ?? 0,
      }))

      paymentAccounts.value = await financeService.getPaymentAccounts()

      const cash = paymentAccounts.value.find((a) => a.Name.toLowerCase().includes('cash in'))
      if (cash) selectedAccountId.value = cash.Id
    })

    const save = async (): Promise<void> => {
      try {
        if (!form.doctorId) {
          alertState.value = { type: 'error', message: 'Please select a doctor.' }
          return
        }

        if (!form.paymentMode) {
          alertState.value = { type: 'error', message: 'Please select payment mode.' }
          return
        }

        if (!selectedAccountId.value) {
          alertState.value = { type: 'error', message: 'Please select a payment account.' }
          return
        }

        if (form.paymentMode !== 'Cash' && form.paymentMode !== 'Free' && isCashAccountSelected()) {
          alertState.value = {
            type: 'error',
            message: 'Selected payment mode is not Cash. Please select a suitable payment account.',
          }
          return
        }

        const res = await checkupService.create({
          patientId: form.patientId,
          doctorId: form.doctorId,
          patientType: form.patientType,
          checkupDate: form.checkupDate,
          paymentMode: form.paymentMode,
          doctorFee: selectedDoctorFee.value,
          symptoms: form.symptoms,
          diagnosis: form.diagnosis,
          hpi: form.hpi,
          vitalSigns: '',
          physicalExamination: form.physicalExamination,
          advice: form.advice,
          comments: form.comments,
          nursingNotes: form.nursingNotes,

          bpSystolic: form.bpSystolic,
          bpDiastolic: form.bpDiastolic,
          respirationRate: form.respirationRate,
          temperature: form.temperature,

          medicines: form.medicines
            .filter((m) => m.medicineId !== null)
            .map((m) => ({
              medicineId: m.medicineId as number,
              noOfDays: m.noOfDays,
              whenToTake: m.whenToTake,
              isBeforeMeal: m.isBeforeMeal,
            })),

          labTests: form.labTests
            .filter((t) => t.testId !== null)
            .map((t) => ({
              testId: t.testId as number,
              price: t.price,
            })),

          paymentAccountId: selectedAccountId.value,
        })

        alertState.value = { type: 'success', message: 'Checkup saved successfully.' }

        setTimeout(() => {
          emit('saved', res.PaymentId)
          emit('close')
        }, 1200)
      } catch (e) {
        const err = e as AxiosError<ApiErrorResponse>
        alertState.value = {
          type: 'error',
          message: err.response?.data?.message ?? 'Failed to save checkup. Please check required fields.',
        }
      }
    }

    return {
      tab,
      alertState,
      selectedAccountId,
      doctors,
      paymentAccounts,
      form,
      newMed,
      newTest,
      addMedicine,
      removeMedicine,
      addTest,
      removeTest,
      save,
    }
  },
})
</script>

<style scoped>
/* COPIED STYLES FROM REFERENCE */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
}

.modal-card {
  width: 800px;
  max-width: 92vw;
  max-height: 90vh;
  background: #fff;
  border-radius: 14px;
  padding: 22px 26px 18px;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tabs button {
  padding: 6px 18px;
  border-radius: 18px;
  border: none;
  background: #f0f0f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.tabs .active {
  background: #34c759;
  color: #fff;
}

form {
  overflow-y: auto;
  padding-right: 6px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.grid .full {
  grid-column: span 2;
}

label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  display: inline-block;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  min-height: 40px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  font-size: 13px;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #34c759;
  outline: none;
}

textarea {
  min-height: 70px;
  resize: vertical;
}

.actions {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding-top: 14px;
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

.btn-primary {
  background: linear-gradient(135deg, #34c759, #28a745);
  color: #fff;
  padding: 8px 22px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(52, 199, 89, 0.25);
}

.btn-secondary {
  background: #f3f3f3;
  color: #333;
  padding: 8px 22px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 13px;
  cursor: pointer;
}

/* TABLE STYLES */
.simple-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
}

.simple-table th {
  text-align: left;
  background: #f0f0f0;
  padding: 8px;
  border-bottom: 2px solid #ddd;
}

.simple-table td {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.btn-danger-sm {
  background: #ff3b30;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

/* ALERT STYLES */
.alert-wrapper {
  margin: 12px 0 16px;
}

.alert {
  position: relative;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-success {
  color: #0f5132;
  background-color: #d1e7dd;
  border: 1px solid #badbcc;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  opacity: 0.5;
  cursor: pointer;
  padding-left: 10px;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close::before {
  content: '\00d7';
}
</style>
