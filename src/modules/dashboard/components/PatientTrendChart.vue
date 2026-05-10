<template>
  <div class="card report-card">
    <div class="card-head">
      <div>
        <p class="eyebrow">Clinical Throughput</p>
        <h3>Patient Trend</h3>
      </div>
      <span class="badge">{{ recoveryRate }} recovery</span>
    </div>

    <apexchart type="area" height="318" :options="options" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { dashboardService } from '../dashboard.service'
import type { PatientTrendItem } from '../dashboard.types'

const rows = ref<PatientTrendItem[]>([])

const series = ref<{ name: string; data: number[] }[]>([
  { name: 'New Patients', data: [] },
  { name: 'Recovered', data: [] },
])

const recoveryRate = computed(() => {
  const newPatients = rows.value.reduce((total, row) => total + row.newPatients, 0)
  const recovered = rows.value.reduce((total, row) => total + row.recoveredPatients, 0)
  if (newPatients <= 0) return '0%'
  return `${Math.round((recovered / newPatients) * 100)}%`
})

const options = ref<ApexOptions>({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  colors: ['#2563eb', '#0f766e'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.35,
      opacityFrom: 0.28,
      opacityTo: 0.04,
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
    categories: [],
    labels: { style: { colors: '#64748b' } },
  },
  yaxis: {
    labels: { style: { colors: '#64748b' } },
  },
})

onMounted(async () => {
  const data = await dashboardService.getPatientTrend()
  rows.value = data
  options.value = {
    ...options.value,
    xaxis: {
      ...options.value.xaxis,
      categories: data.map((d) => d.month),
    },
  }
  series.value = [
    { name: 'New Patients', data: data.map((d) => d.newPatients) },
    { name: 'Recovered', data: data.map((d) => d.recoveredPatients) },
  ]
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
  color: var(--accent);
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
  background: var(--accent-soft);
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  white-space: nowrap;
}
</style>
