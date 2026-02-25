<template>
  <div class="page">
    <div class="header">
      <div class="controls card">
        <div class="row">
          <div class="field">
            <label>Date</label>
            <input type="date" v-model="date" />
          </div>

          <div class="field">
            <label>Cash Account</label>
            <select v-model="cashAccountId">
              <option v-for="a in cashAccounts" :key="a.id" :value="a.id">
                {{ a.name }}
              </option>
            </select>
          </div>

          <button class="btn" :disabled="loading" @click="load">
            {{ loading ? 'Loading...' : 'Load' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loader card">Loading report...</div>

    <div v-else-if="report" class="grid">
      <!-- Row 1 -->
      <div class="card kpi">
        <div class="kpi-title">Today New Patients</div>
        <div class="kpi-value">{{ report.newPatients }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Total Checkups</div>
        <div class="kpi-value">{{ report.totalCheckups }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Sum of Checkup Fee</div>
        <div class="kpi-value">{{ money(report.totalCheckupFee) }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Free Patients</div>
        <div class="kpi-value">{{ report.freePatients }}</div>
      </div>

      <!-- Row 2 -->
      <div class="card kpi">
        <div class="kpi-title">Discounted Patients</div>
        <div class="kpi-value">{{ report.discountedPatients }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Discount Amount</div>
        <div class="kpi-value">{{ money(report.discountAmount) }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Expenses (Cash in Hand)</div>
        <div class="kpi-value">{{ money(report.expensesFromCashInHand) }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Doctor Payout (Cash)</div>
        <div class="kpi-value">{{ money(report.doctorPayoutFromCashInHand) }}</div>
      </div>

      <!-- Highlight -->
      <div class="card kpi highlight">
        <div class="kpi-title">Amount Left (Fee - Expenses - Doctor Payout)</div>
        <div class="kpi-value big" :class="{ negative: report.amountLeft < 0 }">
          {{ money(report.amountLeft) }}
        </div>
        <div class="note">
          Owner doctor share is not deducted. Doctor payout is taken from ExpenseVoucher (cash in hand).
        </div>
      </div>

      <!-- Payment modes summary -->
      <div class="card table-card">
        <div class="title">Payment Summary</div>
        <table class="tbl">
          <thead>
            <tr>
              <th class="left">Mode</th>
              <th class="right">Transactions</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="left">Cash</td>
              <td class="right">{{ report.cashTransactions }}</td>
              <td class="right">{{ money(report.cashAmount) }}</td>
            </tr>
            <tr>
              <td class="left">Card</td>
              <td class="right">{{ report.cardTransactions }}</td>
              <td class="right">{{ money(report.cardAmount) }}</td>
            </tr>
            <tr>
              <td class="left">Online Transfer</td>
              <td class="right">{{ report.onlineTransactions }}</td>
              <td class="right">{{ money(report.onlineAmount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th class="left">Total</th>
              <th class="right">{{ totalTransactions }}</th>
              <th class="right">{{ money(totalAmount) }}</th>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Optional: quick explanation -->
      <div class="card table-card">
        <div class="title">Notes</div>
        <div class="note">
          This report is designed for counter staff. It shows: today's checkup totals (paid/free/discount),
          mode-wise totals, and cash in hand deductions (expenses + doctor payouts).
        </div>
      </div>
    </div>

    <div v-else class="card">No report loaded.</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { coaService } from '@/modules/finance/coa/coa.service'
import type { ChartOfAccountUiDto } from '@/modules/finance/coa/coa.types'
import { counterClosingService } from './counter-closing.service'
import type { CounterClosingReportDto } from './counter-closing.types'

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ---------- Wire (PascalCase) ----------
type CounterClosingWire = {
  Date?: string
  TenantId?: string
  PropertyId?: string

  NewPatients?: number
  TotalCheckups?: number
  TotalCheckupFee?: number

  FreePatients?: number
  DiscountedPatients?: number
  DiscountAmount?: number

  CashTransactions?: number
  CashAmount?: number

  CardTransactions?: number
  CardAmount?: number

  OnlineTransactions?: number
  OnlineAmount?: number

  ExpensesFromCashInHand?: number
  DoctorPayoutFromCashInHand?: number

  AmountLeft?: number
}

function n(v: unknown): number {
  const x = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0
  return Number.isFinite(x) ? x : 0
}
function s(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

function mapWireToUi(w: CounterClosingWire): CounterClosingReportDto {
  return {
    date: s(w.Date),
    tenantId: s(w.TenantId),
    propertyId: s(w.PropertyId),

    newPatients: n(w.NewPatients),
    totalCheckups: n(w.TotalCheckups),
    totalCheckupFee: n(w.TotalCheckupFee),

    freePatients: n(w.FreePatients),
    discountedPatients: n(w.DiscountedPatients),
    discountAmount: n(w.DiscountAmount),

    cashTransactions: n(w.CashTransactions),
    cashAmount: n(w.CashAmount),

    cardTransactions: n(w.CardTransactions),
    cardAmount: n(w.CardAmount),

    onlineTransactions: n(w.OnlineTransactions),
    onlineAmount: n(w.OnlineAmount),

    expensesFromCashInHand: n(w.ExpensesFromCashInHand),
    doctorPayoutFromCashInHand: n(w.DoctorPayoutFromCashInHand),

    amountLeft: n(w.AmountLeft),
  }
}

const loading = ref(false)
const date = ref<string>(todayIso())

const accounts = ref<ChartOfAccountUiDto[]>([])
const cashAccountId = ref<string>('')

const cashAccounts = computed<ChartOfAccountUiDto[]>(() =>
  accounts.value.filter(
    (a) => a.isLeaf && a.isActive && a.typeLabel === 'Asset' && a.code.startsWith('11'),
  ),
)

const report = ref<CounterClosingReportDto | null>(null)

const totalTransactions = computed(() => {
  if (!report.value) return 0
  return (
    report.value.cashTransactions +
    report.value.cardTransactions +
    report.value.onlineTransactions
  )
})

const totalAmount = computed(() => {
  if (!report.value) return 0
  return report.value.cashAmount + report.value.cardAmount + report.value.onlineAmount
})

function money(nv: number): string {
  const v = Number.isFinite(nv) ? nv : 0
  return `Rs ${v.toFixed(2)}`
}

async function loadCoa(): Promise<void> {
  accounts.value = await coaService.getAllUi()

  // default: Cash in Hand (1110) if exists
  const cashInHand = accounts.value.find((a) => a.code === '1110')
  cashAccountId.value = cashInHand ? cashInHand.id : (cashAccounts.value[0]?.id ?? '')
}

async function load(): Promise<void> {
  if (!cashAccountId.value) return

  loading.value = true
  try {
    const wire = (await counterClosingService.getReport(
      date.value,
      cashAccountId.value,
    )) as CounterClosingWire

    report.value = mapWireToUi(wire)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCoa()
  await load()
})
</script>

<style scoped>
.page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
  min-width: 0;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* ✅ Controls wrapper (fix: no forced min width) */
.controls {
  width: 100%;
  max-width: 920px;
  /* looks nice on desktop */
  padding: 18px;
}

/* ✅ Row alignment */
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

/* ✅ Field stack */
.field {
  min-width: 220px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 12px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
  color: #111;
}

/* ✅ Shared control styling */
input,
select {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #d7d7d7;
  font-size: 13px;
  line-height: 44px;
  padding: 0 14px;
  background: #fff;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: #34c759;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.15);
}

input[type='date'] {
  padding-right: 40px;
}

/* select arrow */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 42px;
  background-image: linear-gradient(45deg, transparent 50%, #666 50%),
    linear-gradient(135deg, #666 50%, transparent 50%);
  background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

/* button */
.btn {
  height: 44px;
  border: none;
  padding: 0 18px;
  border-radius: 12px;
  cursor: pointer;
  background: #34c759;
  color: #fff;
  font-weight: 800;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loader {
  margin-top: 12px;
}

/* ✅ KPI grid */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-title {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 800;
}

.kpi-value {
  font-size: 20px;
  font-weight: 900;
}

.table-card {
  grid-column: span 2;
}

.title {
  font-weight: 900;
  margin-bottom: 10px;
}

/* ✅ tables: allow horizontal scroll on mobile */
.table-card {
  min-width: 0;
}

.table-card .tbl {
  width: 100%;
  border-collapse: collapse;
  min-width: 520px;
  /* prevents squash */
}

.table-card {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tbl th,
.tbl td {
  border-bottom: 1px solid #eee;
  padding: 10px 8px;
  font-size: 13px;
  white-space: nowrap;
}

.left {
  text-align: left;
}

.right {
  text-align: right;
}

.note {
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.7;
}

.highlight {
  grid-column: span 4;
  border: 1px solid #c9f7d8;
}

.big {
  font-size: 26px;
}

.negative {
  color: #b42318;
}

/* ✅ Tablet */
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-card {
    grid-column: span 2;
  }

  .highlight {
    grid-column: span 2;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .row {
    align-items: stretch;
  }

  .field {
    min-width: 100%;
  }

  .btn {
    width: 100%;
  }
}

/* ✅ Mobile */
@media (max-width: 640px) {
  .page {
    padding: 14px;
  }

  .grid {
    grid-template-columns: 1fr;
    /* single column */
  }

  .table-card {
    grid-column: span 1;
  }

  .highlight {
    grid-column: span 1;
  }

  .big {
    font-size: 22px;
  }

  .table-card .tbl {
    min-width: 460px;
  }
}
</style>
