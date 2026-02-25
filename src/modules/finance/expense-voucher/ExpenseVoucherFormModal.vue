<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2>{{ isEdit ? 'Edit Expense Voucher' : 'Add Expense Voucher' }}</h2>

      <!-- ALERT -->
      <div v-if="alertState" class="alert-wrapper">
        <div :class="[
          'alert',
          alertState.type === 'success' ? 'alert-success' : 'alert-danger',
          'alert-dismissible',
          'fade',
          'show',
        ]">
          <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
          {{ alertState.message }}
          <button type="button" class="btn-close" @click="alertState = null"></button>
        </div>
      </div>

      <form @submit.prevent="save">
        <div class="grid">
          <div>
            <label>Date *</label>
            <input type="date" v-model="form.date" />
          </div>

          <div>
            <label>Amount *</label>
            <input type="number" min="0" step="0.01" v-model.number="form.amount" />
          </div>

          <div>
            <label>Expense Head *</label>
            <select v-model="form.expenseAccountId">
              <option value="">Select</option>
              <option v-for="a in expenseAccounts" :key="a.id" :value="a.id">
                {{ a.name }}
              </option>
            </select>
          </div>

          <div>
            <label>Paid From (Cash/Bank) *</label>
            <select v-model="form.paymentAccountId">
              <option value="">Select</option>
              <option v-for="a in paymentAccounts" :key="a.id" :value="a.id">
                {{ a.name }}
              </option>
            </select>
            <small class="hint">For counter cash closing, choose “Cash in Hand”.</small>
          </div>

          <div class="full">
            <label>Description *</label>
            <textarea v-model="form.description"
              placeholder="e.g., generator fuel, stationery, maintenance..."></textarea>
          </div>

          <div v-if="isEdit" class="full">
            <label>Status</label>
            <input :value="statusLabel" disabled />
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary">Save</button>
          <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { expenseVoucherService } from './expense-voucher.service'
import { coaService } from '../coa/coa.service'
import type { ChartOfAccountUiDto } from '../coa/coa.types'

type AlertType = 'success' | 'error'
interface AlertState {
  type: AlertType
  message: string
}

function todayIsoDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default defineComponent({
  props: {
    voucherId: {
      type: String,
      default: null,
    },
  },
  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const alertState = ref<AlertState | null>(null)
    const accounts = ref<ChartOfAccountUiDto[]>([])
    const statusLabel = ref('Draft')

    const form = reactive({
      date: todayIsoDate(),
      amount: 0,
      description: '',
      expenseAccountId: '',
      paymentAccountId: '',
    })

    const isEdit = computed(() => !!props.voucherId)

    const expenseAccounts = computed((): ChartOfAccountUiDto[] =>
      accounts.value.filter(
        (a: ChartOfAccountUiDto) => a.isLeaf && a.isActive && a.typeLabel === 'Expense',
      ),
    )

    const paymentAccounts = computed((): ChartOfAccountUiDto[] =>
      accounts.value.filter(
        (a: ChartOfAccountUiDto) => a.isLeaf && a.isActive && a.typeLabel === 'Asset',
      ),
    )

    const load = async () => {
      // ✅ use UI-enriched accounts
      accounts.value = await coaService.getAllUi()

      if (!props.voucherId) return

      const v = await expenseVoucherService.getById(props.voucherId)

      form.date = (v.Date ?? '').slice(0, 10)
      form.amount = v.Amount ?? 0
      form.description = v.Description ?? ''
      form.expenseAccountId = v.ExpenseAccountId ?? ''
      form.paymentAccountId = v.BankAccountId ?? ''
      statusLabel.value = v.Status ?? 'Draft'
    }

    onMounted(load)

    const validate = (): string | null => {
      if (!form.date) return 'Date is required.'
      if (!Number.isFinite(form.amount) || form.amount <= 0) return 'Amount must be greater than 0.'
      if (!form.expenseAccountId) return 'Expense Head is required.'
      if (!form.paymentAccountId) return 'Payment Account (Cash/Bank) is required.'
      if (!form.description.trim()) return 'Description is required.'
      return null
    }

    const save = async () => {
      const err = validate()
      if (err) {
        alertState.value = { type: 'error', message: err }
        return
      }

      try {
        const payload = {
          date: form.date,
          amount: form.amount,
          description: form.description,
          expenseAccountId: form.expenseAccountId,
          paymentAccountId: form.paymentAccountId,
        }

        if (isEdit.value) {
          // props.voucherId is string | null; safe because isEdit true
          await expenseVoucherService.update(props.voucherId as string, payload)
          alertState.value = { type: 'success', message: 'Expense voucher updated successfully.' }
        } else {
          await expenseVoucherService.create(payload)
          alertState.value = { type: 'success', message: 'Expense voucher created successfully.' }
        }

        setTimeout(() => {
          emit('saved')
          emit('close')
        }, 900)
      } catch {
        alertState.value = { type: 'error', message: 'Operation failed. Please check data.' }
      }
    }

    return {
      form,
      isEdit,
      save,
      alertState,
      expenseAccounts,
      paymentAccounts,
      statusLabel,
    }
  },
})
</script>

<style scoped>
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
  width: 900px;
  max-width: 92vw;
  max-height: 85vh;
  background: #fff;
  border-radius: 14px;
  padding: 22px 26px 18px;
  display: flex;
  flex-direction: column;
}

form {
  overflow-y: auto;
  padding-right: 6px;
}

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px 24px;
}

.grid>div {
  min-width: 0;
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

textarea {
  min-height: 80px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #34c759;
  outline: none;
}

.hint {
  display: block;
  font-size: 12px;
  opacity: 0.7;
  margin-top: 6px;
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

.alert-wrapper {
  margin: 12px 0 16px;
}

.alert {
  position: relative;
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-success {
  color: #0f5132;
  background-color: #d1e7dd;
  border-color: #badbcc;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  padding: 0 0 0 10px;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close::before {
  content: '\00d7';
}

.fade {
  transition: opacity 0.15s linear;
}

.show {
  opacity: 1;
}
</style>
