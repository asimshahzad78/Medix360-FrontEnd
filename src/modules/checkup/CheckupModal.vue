<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2>OPD Encounter</h2>

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
          <button :class="{ active: tab === 'encounter' }" @click.prevent="tab = 'encounter'">Encounter</button>
          <button :class="{ active: tab === 'vitals' }" @click.prevent="tab = 'vitals'">
            Vitals
          </button>
          <button :class="{ active: tab === 'diagnosis' }" @click.prevent="tab = 'diagnosis'">
            Diagnosis
          </button>
          <button :class="{ active: tab === 'prescription' }" @click.prevent="tab = 'prescription'">
            Prescription
          </button>
          <button :class="{ active: tab === 'orders' }" @click.prevent="tab = 'orders'">Orders</button>
          <button :class="{ active: tab === 'payment' }" @click.prevent="tab = 'payment'">Payment</button>
        </div>

        <!-- ================= ENCOUNTER TAB ================= -->
        <div v-if="tab === 'encounter'" class="grid">
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
            <label>Visit ID</label>
            <input v-model="form.visitId" />
          </div>

          <div>
            <label>Serial No</label>
            <input type="number" v-model.number="form.serialNo" />
          </div>

          <div>
            <label>Doctor</label>
            <AppLookupSelect
              v-model="form.doctorId"
              kind="doctor"
              placeholder="Search doctor"
              @selected="selectDoctor"
            />
          </div>

          <div>
            <label>Checkup Date</label>
            <input type="date" v-model="form.checkupDate" />
          </div>

          <div>
            <label>Next Visit Date</label>
            <input type="date" v-model="form.nextVisitDate" />
          </div>

          <div class="full">
            <label>Current URL</label>
            <input v-model="form.currentURL" readonly />
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
            <label>Vital Signs</label>
            <textarea v-model="form.vitalSigns" :placeholder="vitalSignsSummary"></textarea>
          </div>
        </div>

        <!-- ================= DIAGNOSIS TAB ================= -->
        <div v-if="tab === 'diagnosis'" class="grid">
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

        <!-- ================= PRESCRIPTION TAB ================= -->
        <div v-if="tab === 'prescription'">
          <div class="grid">
          <div>
            <label>Medicine Name</label>
            <AppLookupSelect
              v-model="newMed.medicineId"
              kind="medicine"
              placeholder="Search medicine"
              @selected="selectMedicine"
            />
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
              <label>Times / Day</label>
              <input type="number" v-model.number="newMed.whenToTakeDayCount" />
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
              <td>{{ m.whenToTakeDayCount }}</td>
              <td>
                <button class="btn-danger-sm" @click="removeMedicine(i)">X</button>
              </td>
            </tr>
          </table>
        </div>

        <!-- ================= ORDERS TAB ================= -->
        <div v-if="tab === 'orders'">
          <div class="grid">
          <div>
              <label>Lab / Radiology Order</label>
              <AppLookupSelect
                v-model="newTest.testId"
                kind="labTest"
                placeholder="Search lab test"
                @selected="(option) => selectDiagnosticOrder(option, 'Lab')"
              />
            </div>

            <div>
              <label>Radiology Study</label>
              <AppLookupSelect
                v-model="newTest.testId"
                kind="radiologyStudy"
                placeholder="Search study"
                @selected="(option) => selectDiagnosticOrder(option, 'Radiology')"
              />
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
              <td>{{ t.orderType }}</td>
              <td>{{ t.name }}</td>
              <td>{{ t.price }}</td>
              <td>
                <button class="btn-danger-sm" @click="removeTest(i)">X</button>
              </td>
            </tr>
          </table>
        </div>

        <!-- ================= PAYMENT TAB ================= -->
        <div v-if="tab === 'payment'" class="grid">
          <div>
            <label>Payment Mode</label>
            <AppLookupSelect
              v-model="form.paymentMode"
              kind="paymentMode"
              placeholder="Select payment mode"
              @selected="selectPaymentMode"
            />
          </div>

          <div>
            <label>Payment Type</label>
            <select v-model="form.paymentType">
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank">Bank</option>
              <option value="Online">Online</option>
              <option value="Insurance">Insurance</option>
              <option value="Free">Free</option>
            </select>
          </div>

          <div>
            <label>Payment Account</label>
            <AppLookupSelect
              v-model="selectedAccountId"
              kind="paymentAccount"
              placeholder="Search payment account"
              @selected="selectPaymentAccount"
            />
          </div>

          <div>
            <label>Doctor Fee</label>
            <input type="number" :value="selectedDoctorFee" disabled />
          </div>

          <div>
            <label>Lab / Order Amount</label>
            <input type="number" :value="orderTotal" disabled />
          </div>
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
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import AppLookupSelect from '@/components/ui/AppLookupSelect.vue'
import { lookupService, type LookupOption } from '@/services/lookup.service'
import { checkupService } from './checkup.service'
import type { AxiosError } from 'axios'

type TabType = 'encounter' | 'vitals' | 'diagnosis' | 'prescription' | 'orders' | 'payment'
type AlertType = 'success' | 'error'

interface AlertState {
  type: AlertType
  message: string
}

interface ApiErrorResponse {
  message?: string
}

interface MedicineItem {
  medicineId: string | number | null
  name: string
  noOfDays: number
  whenToTake: string
  whenToTakeDayCount: number | null
  isBeforeMeal: boolean
}

interface LabTestItem {
  testId: string | number | null
  name: string
  orderType: 'Lab' | 'Radiology'
  price: number
}

interface CheckupForm {
  visitId: string
  serialNo: number | null
  patientId: number
  doctorId: string | number | null
  patientType: string
  checkupDate: string
  nextVisitDate: string
  paymentMode: string
  paymentType: string

  bpSystolic: number | null
  bpDiastolic: number | null
  respirationRate: number | null
  temperature: number | null
  vitalSigns: string
  symptoms: string
  diagnosis: string
  hpi: string
  physicalExamination: string
  advice: string
  comments: string
  nursingNotes: string
  currentURL: string
  medicines: MedicineItem[]
  labTests: LabTestItem[]
}

/** ✅ This matches your API after backend fix: DocId = DoctorsInfo.Id */
export default defineComponent({
  components: { AppLookupSelect },
  props: {
    patient: {
      type: Object as () => { id: number; firstName: string; lastName: string },
      required: true,
    },
  },
  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const tab = ref<TabType>('encounter')
    const alertState = ref<AlertState | null>(null)

    const selectedAccountId = ref<string | null>(null)
    const selectedPaymentAccount = ref<LookupOption | null>(null)
    const selectedDoctorFee = ref<number>(0)
    const makeVisitId = (): string => `VIS-${Date.now().toString().slice(-8)}`
    const orderTotal = computed(() =>
      form.labTests.reduce((total, order) => total + Number(order.price || 0), 0),
    )
    const vitalSignsSummary = computed(() =>
      [
        form.bpSystolic !== null || form.bpDiastolic !== null
          ? `BP ${form.bpSystolic ?? '-'}/${form.bpDiastolic ?? '-'}`
          : '',
        form.respirationRate !== null ? `RR ${form.respirationRate}` : '',
        form.temperature !== null ? `Temp ${form.temperature}` : '',
      ]
        .filter(Boolean)
        .join(', '),
    )

    const form = reactive<CheckupForm>({
      visitId: makeVisitId(),
      serialNo: null,
      patientId: props.patient.id,
      doctorId: null,
      patientType: 'Out Patient',
      checkupDate: new Date().toISOString().slice(0, 10),
      nextVisitDate: '',
      paymentMode: 'Cash',
      paymentType: 'Cash',

      bpSystolic: null,
      bpDiastolic: null,
      respirationRate: null,
      temperature: null,
      vitalSigns: '',
      symptoms: '',
      diagnosis: '',
      hpi: '',
      physicalExamination: '',
      advice: '',
      comments: '',
      nursingNotes: '',
      currentURL: window.location.href,
      medicines: [],
      labTests: [],
    })

    const isCashAccountSelected = (): boolean =>
      [selectedPaymentAccount.value?.label, selectedPaymentAccount.value?.code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes('cash'))

    const newMed = reactive<MedicineItem>({
      medicineId: null,
      name: '',
      noOfDays: 1,
      whenToTake: '',
      whenToTakeDayCount: 1,
      isBeforeMeal: false,
    })

    const newTest = reactive<LabTestItem>({
      testId: null,
      name: '',
      orderType: 'Lab',
      price: 0,
    })

    const selectDoctor = (option: LookupOption | null): void => {
      selectedDoctorFee.value = option?.fee ?? 0
    }

    const selectMedicine = (option: LookupOption | null): void => {
      newMed.name = option?.label ?? ''
    }

    const selectDiagnosticOrder = (option: LookupOption | null, type: 'Lab' | 'Radiology'): void => {
      if (!option) {
        newTest.name = ''
        newTest.price = 0
        return
      }

      newTest.name = `${type}: ${option.label}`
      newTest.orderType = type
      newTest.price = option.price ?? 0
    }

    const selectPaymentMode = (option: LookupOption | null): void => {
      form.paymentMode = option ? String(option.id) : ''
      form.paymentType = option?.label ?? form.paymentType
    }

    const selectPaymentAccount = (option: LookupOption | null): void => {
      selectedPaymentAccount.value = option
    }

    const addMedicine = (): void => {
      form.medicines.push({ ...newMed })
      Object.assign(newMed, {
        medicineId: null,
        name: '',
        noOfDays: 1,
        whenToTake: '',
        whenToTakeDayCount: 1,
        isBeforeMeal: false,
      })
    }

    const removeMedicine = (i: number): void => {
      form.medicines.splice(i, 1)
    }

    const addTest = (): void => {
      form.labTests.push({ ...newTest })
      Object.assign(newTest, { testId: null, name: '', orderType: 'Lab', price: 0 })
    }

    const removeTest = (i: number): void => {
      form.labTests.splice(i, 1)
    }

    onMounted(async () => {
      const accounts = await lookupService.search('paymentAccount')
      const cash = accounts.find((a) => a.label.toLowerCase().includes('cash in') || a.label.toLowerCase() === 'cash')
      if (cash) {
        selectedAccountId.value = String(cash.id)
        selectedPaymentAccount.value = cash
      }
    })

    const save = async (): Promise<void> => {
      try {
        if (!form.doctorId) {
          alertState.value = { type: 'error', message: 'Please select a doctor.' }
          tab.value = 'encounter'
          return
        }

        if (!form.paymentMode) {
          alertState.value = { type: 'error', message: 'Please select payment mode.' }
          tab.value = 'payment'
          return
        }

        if (!selectedAccountId.value) {
          alertState.value = { type: 'error', message: 'Please select a payment account.' }
          tab.value = 'payment'
          return
        }

        if (form.paymentMode !== 'Cash' && form.paymentMode !== 'Free' && isCashAccountSelected()) {
          alertState.value = {
            type: 'error',
            message: 'Selected payment mode is not Cash. Please select a suitable payment account.',
          }
          tab.value = 'payment'
          return
        }

        const res = await checkupService.create({
          visitId: form.visitId,
          serialNo: form.serialNo,
          patientId: form.patientId,
          doctorId: Number(form.doctorId),
          patientType: form.patientType,
          checkupDate: form.checkupDate,
          nextVisitDate: form.nextVisitDate || null,
          paymentMode: form.paymentMode,
          paymentType: form.paymentType,
          doctorFee: selectedDoctorFee.value,
          symptoms: form.symptoms,
          diagnosis: form.diagnosis,
          hpi: form.hpi,
          vitalSigns: form.vitalSigns || vitalSignsSummary.value,
          physicalExamination: form.physicalExamination,
          advice: form.advice,
          comments: form.comments,
          nursingNotes: form.nursingNotes,
          currentURL: form.currentURL,

          bpSystolic: form.bpSystolic,
          bpDiastolic: form.bpDiastolic,
          respirationRate: form.respirationRate,
          temperature: form.temperature,

          medicines: form.medicines
            .filter((m) => m.medicineId !== null)
            .map((m) => ({
              medicineId: Number(m.medicineId),
              medicineName: m.name,
              noOfDays: m.noOfDays,
              whenToTake: m.whenToTake,
              whenToTakeDayCount: m.whenToTakeDayCount,
              isBeforeMeal: m.isBeforeMeal,
              visitId: form.visitId,
              checkupId: null,
              paymentId: null,
            })),

          labTests: form.labTests
            .filter((t) => t.testId !== null)
            .map((t) => ({
              testId: Number(t.testId),
              testName: t.name,
              orderType: t.orderType,
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
      selectedDoctorFee,
      orderTotal,
      vitalSignsSummary,
      form,
      newMed,
      newTest,
      selectDoctor,
      selectMedicine,
      selectDiagnosticOrder,
      selectPaymentMode,
      selectPaymentAccount,
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
