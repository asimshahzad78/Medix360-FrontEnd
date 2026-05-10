<template>
  <div class="card report-card">
    <div class="card-head">
      <div>
        <p class="eyebrow">Operations</p>
        <h3>Department Load</h3>
      </div>
      <span class="badge">Today</span>
    </div>

    <apexchart type="radialBar" height="302" :options="options" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ApexOptions } from 'apexcharts'

const series = ref([76, 63, 58, 41])

const options = ref<ApexOptions>({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  colors: ['#0f766e', '#2563eb', '#f59e0b', '#7c3aed'],
  labels: ['OPD', 'Diagnostics', 'IPD', 'Pharmacy'],
  plotOptions: {
    radialBar: {
      hollow: { size: '34%' },
      track: { background: '#e2e8f0' },
      dataLabels: {
        name: {
          fontSize: '13px',
          color: '#64748b',
        },
        value: {
          fontSize: '20px',
          fontWeight: 800,
          color: '#0f172a',
          formatter: (value) => `${Math.round(value)}%`,
        },
        total: {
          show: true,
          label: 'Utilization',
          color: '#64748b',
          formatter: () => '60%',
        },
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom',
    markers: { shape: 'square' },
  },
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
  margin-bottom: 4px;
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
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
}
</style>
