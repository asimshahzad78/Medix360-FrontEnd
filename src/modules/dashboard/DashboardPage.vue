<template>
  <div class="dashboard">
    <section class="dashboard-hero">
      <div>
        <p class="eyebrow">Hospital Command Center</p>
        <h2>Enterprise operations snapshot</h2>
        <p class="subtitle">Clinical, revenue, diagnostics and service performance in one control surface.</p>
      </div>
      <div class="hero-actions">
        <span>Today</span>
        <strong>{{ currentDate }}</strong>
      </div>
    </section>

    <div class="kpi-grid">
      <DashboardKpiCard label="Total Patients" :value="summary.totalPatients" variant="teal" :trend="12">
        PT
      </DashboardKpiCard>

      <DashboardKpiCard label="Doctors On Roster" :value="summary.totalDoctors" variant="blue" :trend="4">
        DR
      </DashboardKpiCard>

      <DashboardKpiCard label="Appointments" :value="summary.totalAppointments" variant="purple" :trend="9">
        AP
      </DashboardKpiCard>

      <DashboardKpiCard label="Hospital Revenue" :value="formatCurrency(summary.totalRevenue)" variant="green" :trend="18">
        PKR
      </DashboardKpiCard>
    </div>

    <div class="grid-2">
      <RevenueChart />
      <PatientTrendChart />
    </div>

    <div class="grid-2">
      <OperationsMixChart />
      <PerformanceReport />
    </div>

    <div class="grid-2 compact">
      <RecentPayments />
      <RecentCheckups />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { dashboardService } from './dashboard.service'
import type { DashboardSummary } from './dashboard.types'

import DashboardKpiCard from './components/DashboardKpiCard.vue'
import RevenueChart from './components/RevenueChart.vue'
import PatientTrendChart from './components/PatientTrendChart.vue'
import OperationsMixChart from './components/OperationsMixChart.vue'
import PerformanceReport from './components/PerformanceReport.vue'
import RecentPayments from './components/RecentPayments.vue'
import RecentCheckups from './components/RecentCheckups.vue'

const summary = ref<DashboardSummary>({
  totalPatients: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  totalRevenue: 0,
})

const currentDate = computed(() =>
  new Intl.DateTimeFormat('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date()),
)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value)

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

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(37, 99, 235, 0.08)),
    #ffffff;
  box-shadow: var(--shadow-soft);
  padding: 22px;
}

.eyebrow {
  margin: 0 0 5px;
  color: var(--primary-dark);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: var(--text-main);
  font-size: 26px;
  letter-spacing: 0;
}

.subtitle {
  color: var(--text-muted);
  margin: 6px 0 0;
}

.hero-actions {
  min-width: 150px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  padding: 12px 14px;
  text-align: right;
}

.hero-actions span {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.hero-actions strong {
  display: block;
  color: var(--text-main);
  font-size: 16px;
  margin-top: 4px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.compact {
  align-items: start;
}

@media (max-width: 640px) {
  .dashboard {
    gap: 14px;
  }

  .dashboard-hero {
    align-items: stretch;
    flex-direction: column;
    padding: 16px;
  }

  .hero-actions {
    min-width: 0;
    text-align: left;
  }

  .kpi-grid,
  .grid-2 {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (min-width: 641px) and (max-width: 1023px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
