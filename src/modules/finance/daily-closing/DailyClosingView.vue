<template>
  <div class="page">
    <div class="header">
      <!--  <h2>Daily Closing</h2> -->

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
      <div class="card kpi">
        <div class="kpi-title">Cash In</div>
        <div class="kpi-value">{{ money(cashIn) }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Cash Out</div>
        <div class="kpi-value">{{ money(cashOut) }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Net Cash</div>
        <div class="kpi-value">{{ money(netCash) }}</div>
      </div>

      <div class="card kpi">
        <div class="kpi-title">Profit</div>
        <div class="kpi-value">{{ money(report.profit) }}</div>
      </div>

      <div class="card table-card">
        <div class="title">Cash Accounts Summary</div>
        <table class="tbl">
          <thead>
            <tr>
              <th class="left">Code</th>
              <th class="left">Name</th>
              <th class="right">Opening</th>
              <th class="right">Inflow</th>
              <th class="right">Outflow</th>
              <th class="right">Closing</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in report.cashAccounts" :key="a.accountId">
              <td class="left">{{ a.code }}</td>
              <td class="left">{{ a.name }}</td>
              <td class="right">{{ money(a.openingBalance) }}</td>
              <td class="right">{{ money(a.inflow) }}</td>
              <td class="right">{{ money(a.outflow) }}</td>
              <td class="right">{{ money(a.closingBalance) }}</td>
            </tr>
            <tr v-if="report.cashAccounts.length === 0">
              <td colspan="6">No cash accounts</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card table-card">
        <div class="title">Top Expenses (Paid from Cash)</div>
        <table class="tbl">
          <thead>
            <tr>
              <th class="left">Expense Head</th>
              <th class="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in report.topExpenses" :key="x.accountId">
              <td class="left">{{ x.name }}</td>
              <td class="right">{{ money(x.amount) }}</td>
            </tr>
            <tr v-if="report.topExpenses.length === 0">
              <td colspan="2">No expenses found</td>
            </tr>
          </tbody>
        </table>

        <!-- NOTE -->
        <div class="note">
          “By Source Module / Entries Count” API me currently nahi aa raha, is liye yahan show nahi
          ho sakta without backend changes.
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
import { dailyClosingService } from './daily-closing.service'

function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

type CashAccountSummaryDto = {
  accountId: string
  code: string
  name: string
  openingBalance: number
  inflow: number
  outflow: number
  closingBalance: number
}

type TopExpenseDto = {
  accountId: string
  name: string
  amount: number
}

type DailyClosingReportUi = {
  date: string
  totalRevenue: number
  totalExpense: number
  profit: number
  cashAccounts: CashAccountSummaryDto[]
  topExpenses: TopExpenseDto[]
}

// PascalCase wire (backend is returning PascalCase)
type DailyClosingReportWire = {
  Date?: string
  TotalRevenue?: number
  TotalExpense?: number
  Profit?: number
  CashAccounts?: Array<{
    AccountId?: string
    Code?: string
    Name?: string
    OpeningBalance?: number
    Inflow?: number
    Outflow?: number
    ClosingBalance?: number
  }>
  TopExpenses?: Array<{
    AccountId?: string
    Name?: string
    Amount?: number
  }>
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function n(v: unknown): number {
  const x = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0
  return Number.isFinite(x) ? x : 0
}

function s(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
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

const report = ref<DailyClosingReportUi | null>(null)

const selectedCash = computed<CashAccountSummaryDto | null>(() => {
  if (!report.value) return null
  const id = cashAccountId.value
  return report.value.cashAccounts.find((x) => x.accountId === id) ?? null
})

const cashIn = computed<number>(() => selectedCash.value?.inflow ?? 0)
const cashOut = computed<number>(() => selectedCash.value?.outflow ?? 0)
const netCash = computed<number>(() => cashIn.value - cashOut.value)

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

function mapWireToUi(w: DailyClosingReportWire): DailyClosingReportUi {
  const cash = asArray<NonNullable<DailyClosingReportWire['CashAccounts']>[number]>(
    w.CashAccounts,
  ).map((x) => ({
    accountId: s(x.AccountId),
    code: s(x.Code),
    name: s(x.Name),
    openingBalance: n(x.OpeningBalance),
    inflow: n(x.Inflow),
    outflow: n(x.Outflow),
    closingBalance: n(x.ClosingBalance),
  }))

  const exp = asArray<NonNullable<DailyClosingReportWire['TopExpenses']>[number]>(
    w.TopExpenses,
  ).map((x) => ({
    accountId: s(x.AccountId),
    name: s(x.Name),
    amount: n(x.Amount),
  }))

  return {
    date: s(w.Date),
    totalRevenue: n(w.TotalRevenue),
    totalExpense: n(w.TotalExpense),
    profit: n(w.Profit),
    cashAccounts: cash,
    topExpenses: exp,
  }
}

async function load(): Promise<void> {
  if (!cashAccountId.value) return

  loading.value = true
  try {
    const wire = (await dailyClosingService.getReport(
      date.value,
      cashAccountId.value,
    )) as DailyClosingReportWire
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

h2 {
  margin: 0;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

/* ✅ Controls: remove forced min-width */
.controls {
  width: 100%;
  max-width: 920px;
  padding: 18px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

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

/* nicer select arrow */
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
  min-width: 0;
  overflow-x: auto;
  /* ✅ table scroll on small screens */
  -webkit-overflow-scrolling: touch;
}

.title {
  font-weight: 900;
  margin-bottom: 10px;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;
  /* ✅ prevents squish */
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

/* ✅ Tablet */
@media (max-width: 1100px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-card {
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
  }

  .table-card {
    grid-column: span 1;
  }

  .tbl {
    min-width: 520px;
  }
}
</style>
