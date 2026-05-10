<template>
  <div class="card report-card">
    <div class="card-head">
      <div>
        <p class="eyebrow">Revenue Cycle</p>
        <h3>Income vs Expense</h3>
      </div>
      <span class="badge">{{ marginLabel }} margin</span>
    </div>

    <apexchart type="bar" height="318" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { dashboardService } from '../dashboard.service'
import type { RevenueChartItem } from '../dashboard.types'

const categories = ref<string[]>([])
const rows = ref<RevenueChartItem[]>([])

const series = ref([
  { name: 'Income', data: [] as number[] },
  { name: 'Expense', data: [] as number[] },
])

const marginLabel = computed(() => {
  const income = rows.value.reduce((total, row) => total + row.income, 0)
  const expense = rows.value.reduce((total, row) => total + row.expense, 0)
  if (income <= 0) return '0%'
  return `${Math.round(((income - expense) / income) * 100)}%`
})

const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  colors: ['#0f766e', '#f59e0b'],
  plotOptions: {
    bar: {
      borderRadius: 5,
      columnWidth: '46%',
    },
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#e2e8f0',
    strokeDashArray: 4,
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    markers: { shape: 'square' },
  },
  xaxis: {
    categories: categories.value,
    axisBorder: { color: '#cbd5e1' },
    labels: { style: { colors: '#64748b' } },
  },
  yaxis: {
    labels: {
      formatter: (value) => `PKR ${Math.round(value / 1000)}k`,
      style: { colors: '#64748b' },
    },
  },
  tooltip: {
    y: {
      formatter: (value) => `PKR ${value.toLocaleString()}`,
    },
  },
})

onMounted(async () => {
  const data = await dashboardService.getRevenueChart()
  rows.value = data
  categories.value = data.map((d) => d.label)
  series.value = [
    { name: 'Income', data: data.map((d) => d.income) },
    { name: 'Expense', data: data.map((d) => d.expense) },
  ]
  chartOptions.value = {
    ...chartOptions.value,
    xaxis: {
      ...chartOptions.value.xaxis,
      categories: categories.value,
    },
  }
})
</script>

<style scoped>
.report-card {
  min-width: 0;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--primary-dark);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  color: var(--text-main);
  font-size: 18px;
}

.badge {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary-dark);
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  white-space: nowrap;
}
</style>
