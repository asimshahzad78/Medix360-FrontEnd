<template>
  <div class="card">
    <h3 class="card-title">Revenue</h3>

    <apexchart type="bar" height="300" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { dashboardService } from '../dashboard.service'
import type { RevenueChartItem } from '../dashboard.types'

// -----------------------------
// STATE
// -----------------------------
const categories = ref<string[]>([])

const series = ref([
  {
    name: 'Income',
    data: [] as number[],
  },
])

// -----------------------------
// CHART OPTIONS
// -----------------------------
const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    animations: {
      enabled: true,
      speed: 600,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 600,
      },
    },
  },
  colors: ['#16a34a'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: categories.value,
    labels: { rotate: -45 },
  },
})

// -----------------------------
// LOAD DATA
// -----------------------------
onMounted(async () => {
  const data: RevenueChartItem[] = await dashboardService.getRevenueChart()

  // X-axis labels
  categories.value = data.map((d) => d.label)

  // Bar values
  series.value = [
    {
      name: 'Income',
      data: data.map((d) => d.income),
    },
  ]
})
</script>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
}

.card-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}
</style>
