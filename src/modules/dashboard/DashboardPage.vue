<template>
  <div class="dashboard">
    <p class="subtitle">Welcome back 👋</p>

    <div class="kpi-grid">
      <DashboardKpiCard label="Total Patient" :value="summary.totalPatients" variant="red">
        ❤️
      </DashboardKpiCard>

      <DashboardKpiCard label="Doctor" :value="summary.totalDoctors" variant="green">
        🩺
      </DashboardKpiCard>

      <DashboardKpiCard label="Appointment" :value="summary.totalAppointments" variant="blue">
        📅
      </DashboardKpiCard>

      <DashboardKpiCard label="Hospital Earning" :value="`PKR ${summary.totalRevenue}`" variant="purple">
        💲
      </DashboardKpiCard>
    </div>

    <div class="grid-2">
      <RevenueChart />
      <PatientTrendChart />
    </div>

    <div class="grid-2">
      <RecentPayments />
      <RecentCheckups />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { dashboardService } from './dashboard.service'
import type { DashboardSummary } from './dashboard.types'

import DashboardKpiCard from './components/DashboardKpiCard.vue'
import RevenueChart from './components/RevenueChart.vue'
import PatientTrendChart from './components/PatientTrendChart.vue'
import RecentPayments from './components/RecentPayments.vue'
import RecentCheckups from './components/RecentCheckups.vue'

const summary = ref<DashboardSummary>({
  totalPatients: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  totalRevenue: 0,
})

onMounted(async () => {
  summary.value = await dashboardService.getSummary()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.subtitle {
  color: #6b7280;
  margin: 0;
}

/* KPI cards: already good, just slightly smaller min width for phones */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

/* Charts + lists: make min width smaller so it never overflows on mobile */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* ✅ Mobile tuning */
@media (max-width: 640px) {
  .dashboard {
    gap: 14px;
  }

  .kpi-grid,
  .grid-2 {
    grid-template-columns: 1fr;
    /* force single column */
    gap: 12px;
  }
}

/* ✅ Tablet tuning */
@media (min-width: 641px) and (max-width: 1023px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-2 {
    grid-template-columns: 1fr;
    /* charts stacked on tablet looks better */
  }
}
</style>
