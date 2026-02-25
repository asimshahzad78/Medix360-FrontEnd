<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-card" @click.stop>
      <!-- HEADER -->
      <div class="modal-header">
        <h3>{{ isCreate ? 'Add Payment' : 'Edit Payment' }}</h3>
        <button type="button" class="btn-close-header" @click="close">✕</button>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loader-container">Loading Payment Data...</div>

      <!-- FORM -->
      <form v-else @submit.prevent="save" class="modal-content-wrapper">
        <!-- BASIC INFO -->
        <div class="info-row">
          <span><strong>Visit Id:</strong> {{ master.visitId || '-' }}</span>
        </div>

        <!-- PATIENT -->
        <div class="info-row">
          <!-- CREATE -->
          <div v-if="isCreate">
            <label><strong>Patient *</strong></label>
            <Multiselect v-model="selectedPatient" :options="patientOptions" track-by="id" label="label" value-prop="id"
              :searchable="true" :filter-results="false" :close-on-select="true" :clear-on-select="false" :min-chars="2"
              placeholder="Search patient by name or mobile" @search-change="searchPatient" />
          </div>

          <!-- EDIT -->
          <div v-else><strong>Patient:</strong> {{ patientName }}</div>
        </div>

        <!-- ITEMS -->
        <h5 class="section-label">Payment Items: Rs. {{ subTotal.toFixed(2) }}</h5>

        <table class="custom-table green-theme">
          <thead>
            <tr>
              <th>#</th>
              <th>Payment Category</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in paymentItems" :key="i">
              <td>{{ i + 1 }}</td>
              <td>
                <select v-model="r.paymentItemCode" class="form-control">
                  <option value="">-- SELECT --</option>
                  <option v-for="c in categories" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
              </td>
              <td><input type="number" v-model.number="r.quantity" class="form-control" /></td>
              <td><input type="number" v-model.number="r.unitPrize" class="form-control" /></td>
              <td>{{ (r.quantity * r.unitPrize).toFixed(2) }}</td>
              <td>
                <button type="button" class="btn-red-sm" @click="removeItem(i)">Remove</button>
              </td>
            </tr>

            <!-- ADD ROW -->
            <tr>
              <td></td>
              <td>
                <select v-model="newItem.paymentItemCode" class="form-control">
                  <option value="">-- SELECT --</option>
                  <option v-for="c in categories" :key="c.code" :value="c.code">
                    {{ c.name }}
                  </option>
                </select>
              </td>
              <td>
                <input type="number" v-model.number="newItem.quantity" class="form-control" />
              </td>
              <td>
                <input type="number" v-model.number="newItem.unitPrize" class="form-control" />
              </td>
              <td></td>
              <td>
                <button type="button" class="btn-blue-sm" @click="addItem">Add Item</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- TOTALS + PAYMENT MODES -->
        <div class="split-layout">
          <div class="col-left">
            <table class="summary-table">
              <tr>
                <th>Sub Total</th>
                <td>{{ subTotal.toFixed(2) }}</td>
              </tr>
              <tr>
                <th>Discount</th>
                <td>{{ discountVal.toFixed(2) }}</td>
              </tr>
              <tr>
                <th>Tax</th>
                <td>{{ taxVal.toFixed(2) }}</td>
              </tr>
              <tr>
                <th>Grand Total</th>
                <td>{{ grandTotal.toFixed(2) }}</td>
              </tr>
              <tr>
                <th>Paid</th>
                <td>{{ paidAmount.toFixed(2) }}</td>
              </tr>
              <tr>
                <th>Due</th>
                <td>{{ dueAmount.toFixed(2) }}</td>
              </tr>
            </table>

            <table class="charges-table">
              <tr>
                <th>Common Charge</th>
                <td><input type="number" v-model.number="master.commonCharge" /></td>
              </tr>
              <tr>
                <th>Discount (%)</th>
                <td><input type="number" v-model.number="master.discount" /></td>
              </tr>
              <tr>
                <th>Tax (%)</th>
                <td><input type="number" v-model.number="master.tax" /></td>
              </tr>
            </table>
          </div>

          <div class="col-right">
            <h5>Payment Detail</h5>
            <table class="custom-table simple-theme">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in paymentModes" :key="i">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <select v-model="p.modeOfPayment">
                      <option v-for="a in accounts" :key="a.Id" :value="a.Name">
                        {{ a.Name }}
                      </option>
                    </select>
                  </td>
                  <td><input type="number" v-model.number="p.amount" /></td>
                  <td><input v-model="p.referenceNo" /></td>
                  <td>
                    <button v-if="i === paymentModes.length - 1" type="button" class="btn-blue-sm"
                      @click="addPaymentMode">
                      Add
                    </button>
                    <button v-else type="button" class="btn-red-sm" @click="removePaymentMode(i)">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="main-actions">
              <button type="submit" class="btn-save">Save</button>
              <button type="button" class="btn-close-footer" @click="close">Close</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import { PaymentService } from './payment.service'
import { financeService, type PaymentAccountDto } from '../finance/finance.service'
import { patientService, type PatientApiDto } from '../patient/patient.service'

import type {
  ManagePaymentsDto,
  PaymentCategoryDto,
  PaymentItemCrudDto,
  PaymentItemCrudRaw,
  PaymentModeHistoryDto,
} from './payment.types'

const props = defineProps<{ paymentId?: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const loading = ref(false)
const categories = ref<PaymentCategoryDto[]>([])
const accounts = ref<PaymentAccountDto[]>([])
const patientName = ref('')

const master = ref({
  id: 0,
  patientId: 0,
  visitId: '',
  commonCharge: 0,
  discount: 0,
  tax: 0,
  currencyId: 1,
  insuranceNo: '',
  insuranceCoverage: 0,
})

const paymentItems = ref<PaymentItemCrudDto[]>([])
const paymentModes = ref<PaymentModeHistoryDto[]>([])

const newItem = ref<PaymentItemCrudDto>({
  paymentItemCode: '',
  quantity: 1,
  unitPrize: 0,
  totalAmount: 0,
})

const isCreate = computed(() => !props.paymentId)

/* PATIENT AUTOCOMPLETE */
interface PatientOption {
  id: number
  label: string
}
const patientOptions = ref<PatientOption[]>([])
const selectedPatient = ref<number | null>(null)

const searchPatient = async (term: string) => {
  if (term.length < 2) return
  const res: PatientApiDto[] = await patientService.search(term)
  patientOptions.value = res.map((p) => ({
    id: p.Id,
    label: `${p.FirstName} ${p.LastName} (${p.Phone})`,
  }))
}

watch(selectedPatient, (id) => {
  if (id) master.value.patientId = id
})
/* TOTALS */
const subTotal = computed(() =>
  paymentItems.value.reduce((s, x) => s + x.quantity * x.unitPrize, 0),
)
const paidAmount = computed(() => paymentModes.value.reduce((s, x) => s + (x.amount || 0), 0))
const discountVal = computed(() => (subTotal.value * master.value.discount) / 100)
const taxVal = computed(() => ((subTotal.value - discountVal.value) * master.value.tax) / 100)
const grandTotal = computed(() => subTotal.value - discountVal.value + taxVal.value)
const dueAmount = computed(() => Math.max(0, grandTotal.value - paidAmount.value))

/* LOAD */
const loadData = async () => {
  loading.value = true
  const [cat, acc] = await Promise.all([
    PaymentService.getMvcPaymentCategories(),
    financeService.getPaymentAccounts(),
  ])
  categories.value = cat
  accounts.value = acc

  if (props.paymentId) {
    const data = await PaymentService.getManagePaymentById(props.paymentId)
    patientName.value = data.patientName

    const vm = data.paymentsCRUDViewModel
    master.value = {
      id: vm.id ?? 0,
      patientId: vm.patientId,
      visitId: vm.visitId,
      commonCharge: vm.commonCharge,
      discount: vm.discount,
      tax: vm.tax,
      currencyId: vm.currencyId,
      insuranceNo: vm.insuranceNo ?? '',
      insuranceCoverage: vm.insuranceCoverage ?? 0,
    }

    paymentItems.value = data.listPaymentsDetailsCRUDViewModel.map(
      (x: PaymentItemCrudRaw): PaymentItemCrudDto => ({
        id: x.Id,
        paymentItemCode: x.PaymentItemCode,
        quantity: x.Quantity,
        unitPrize: x.UnitPrize,
        totalAmount: x.TotalAmount,
      }),
    )

    paymentModes.value =
      data.listPaymentModeHistoryCRUDViewModel.length > 0
        ? data.listPaymentModeHistoryCRUDViewModel
        : [{ modeOfPayment: 'Cash', amount: 0 }]
  } else {
    paymentModes.value = [{ modeOfPayment: 'Cash', amount: 0 }]
  }
  loading.value = false
}

watch(() => props.paymentId, loadData, { immediate: true })

/* ACTIONS */
const addItem = () => {
  if (!newItem.value.paymentItemCode) return
  paymentItems.value.push({ ...newItem.value })
  newItem.value = { paymentItemCode: '', quantity: 1, unitPrize: 0, totalAmount: 0 }
}
const removeItem = (i: number) => paymentItems.value.splice(i, 1)
const addPaymentMode = () => paymentModes.value.push({ modeOfPayment: 'Cash', amount: 0 })
const removePaymentMode = (i: number) => paymentModes.value.splice(i, 1)

const save = async () => {
  if (!master.value.patientId) return alert('Select patient')

  const payload: ManagePaymentsDto = {
    paymentsCRUDViewModel: {
      id: master.value.id || undefined,
      patientId: master.value.patientId,
      visitId: master.value.visitId,
      commonCharge: master.value.commonCharge,
      discount: master.value.discount,
      discountAmount: discountVal.value,
      tax: master.value.tax,
      taxAmount: taxVal.value,
      subTotal: subTotal.value,
      grandTotal: grandTotal.value,
      paidAmount: paidAmount.value,
      dueAmount: dueAmount.value,
      changedAmount: 0,
      currencyId: master.value.currencyId,
    },
    listPaymentsDetailsCRUDViewModel: paymentItems.value,
    listPaymentModeHistoryCRUDViewModel: paymentModes.value,
  }

  await PaymentService.saveManagePayment(payload)
  emit('saved')
  emit('close')
}

const close = () => emit('close')
</script>

<style scoped>
/* ================== LAYOUT ================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  z-index: 1000;
}

.modal-card {
  background: white;
  width: 1100px;
  max-width: 95vw;
  border-radius: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.modal-content-wrapper {
  padding: 15px;
}

/* ================== GENERAL TYPOGRAPHY ================== */
.info-row {
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

.info-row span {
  margin-right: 15px;
}

.section-label {
  font-size: 14px;
  font-weight: 700;
  margin: 10px 0 5px 0;
}

/* ================== INPUTS & CONTROLS ================== */
.form-control {
  width: 100%;
  height: 30px;
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  box-sizing: border-box;
  /* Fix width issues */
}

.form-control:focus {
  border-color: #66afe9;
  outline: none;
}

.readonly-input {
  background-color: #f9f9f9;
  color: #555;
}

.plain-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #333;
  outline: none;
  padding: 4px;
}

/* ================== TABLES ================== */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.custom-table th,
.custom-table td {
  border: 1px solid #ddd;
  padding: 4px;
  vertical-align: middle;
}

/* Green Theme (Top Table) */
.green-theme thead th {
  background-color: #5cb85c;
  color: white;
  font-weight: 600;
  font-size: 13px;
  text-align: left;
}

/* Simple Theme (Bottom Right Table) */
.simple-theme thead th {
  background-color: #f5f5f5;
  color: #333;
  font-weight: 700;
  font-size: 13px;
  text-align: left;
}

/* ================== SPLIT LAYOUT ================== */
.split-layout {
  display: flex;
  gap: 20px;
}

.col-left {
  width: 38%;
}

/* Adjusted to match screenshot ratio */
.col-right {
  width: 62%;
}

/* Left Summary Tables */
.summary-table,
.charges-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.summary-table th,
.summary-table td,
.charges-table th,
.charges-table td {
  border: 1px solid #ccc;
  padding: 4px 8px;
}

.summary-table th,
.charges-table th {
  width: 45%;
  text-align: left;
  background-color: #fff;
  font-weight: 700;
}

.label-cyan {
  background-color: #00ffff !important;
}

/* Cyan Highlight */

.spacer {
  height: 10px;
}

.calc-val {
  float: right;
  font-weight: normal;
  font-size: 12px;
  color: #666;
}

/* Insurance */
.insurance-row {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
}

/* ================== FOOTER ACTIONS (Right Col) ================== */
.footer-options {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 10px;
}

.check-group {
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.currency-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 60%;
}

.currency-group label {
  font-weight: 700;
  font-size: 13px;
}

.main-actions {
  display: flex;
  gap: 5px;
  margin-top: 15px;
}

/* ================== BUTTONS ================== */
/* Header Close */
.btn-close-header {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-green-sm {
  background: #28a745;
  color: white;
  border: none;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.btn-red-sm {
  background: #dc3545;
  color: white;
  border: none;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.btn-blue-sm {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

/* Footer Buttons */
.btn-save {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
}

.btn-close-footer {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
}
</style>
