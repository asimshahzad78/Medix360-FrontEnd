<template>
  <div class="card">
    <h3>Patient Statistics</h3>

    <apexchart type="area" height="300" :options="options" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { dashboardService } from '../dashboard.service'
import type { PatientTrendItem } from '../dashboard.types'

const series = ref<{ name: string; data: number[] }[]>([
  {
    name: 'Recovered Patient',
    data: [],
  },
  {
    name: 'New Patient',
    data: [],
  },
])

const options = ref<ApexOptions>({
  chart: {
    toolbar: { show: false },
  },
  colors: ['#f87171', '#22c55e'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.4,
      opacityFrom: 0.4,
      opacityTo: 0.1,
    },
  },
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
  },
  xaxis: {
    categories: [],
  },
})

onMounted(async () => {
  const data: PatientTrendItem[] = await dashboardService.getPatientTrend()

  options.value = {
    ...options.value,
    xaxis: {
      categories: data.map((d) => d.month),
    },
  }

  series.value = [
    {
      name: 'Recovered Patient',
      data: data.map((d) => d.recoveredPatients),
    },
    {
      name: 'New Patient',
      data: data.map((d) => d.newPatients),
    },
  ]
})
</script>
