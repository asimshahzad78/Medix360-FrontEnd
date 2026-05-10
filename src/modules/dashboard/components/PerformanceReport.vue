<template>
  <div class="card performance-card">
    <div class="card-head">
      <div>
        <p class="eyebrow">Executive Report</p>
        <h3>Service Performance</h3>
      </div>
      <span class="badge">Live KPIs</span>
    </div>

    <div class="report-list">
      <div v-for="metric in metrics" :key="metric.label" class="metric-row">
        <div class="metric-copy">
          <strong>{{ metric.label }}</strong>
          <span>{{ metric.detail }}</span>
        </div>
        <div class="metric-value">{{ metric.value }}</div>
        <div class="track">
          <span :style="{ width: metric.score + '%' }" :class="metric.tone" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const metrics = [
  {
    label: 'Bed Occupancy',
    detail: 'ICU, ward and observation utilization',
    value: '78%',
    score: 78,
    tone: 'primary',
  },
  {
    label: 'Lab TAT Compliance',
    detail: 'Reports released within target time',
    value: '91%',
    score: 91,
    tone: 'success',
  },
  {
    label: 'Claim Clean Rate',
    detail: 'Insurance claims accepted first pass',
    value: '84%',
    score: 84,
    tone: 'accent',
  },
  {
    label: 'Critical Alerts Closed',
    detail: 'Closed by clinician acknowledgement',
    value: '67%',
    score: 67,
    tone: 'warning',
  },
]
</script>

<style scoped>
.performance-card {
  min-width: 0;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
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
  background: #fff7ed;
  color: #9a3412;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  white-space: nowrap;
}

.report-list {
  display: grid;
  gap: 14px;
}

.metric-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 14px;
}

.metric-copy {
  min-width: 0;
}

.metric-copy strong {
  display: block;
  color: var(--text-main);
  font-size: 14px;
}

.metric-copy span {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.metric-value {
  color: var(--text-main);
  font-size: 18px;
  font-weight: 800;
}

.track {
  grid-column: 1 / -1;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.primary {
  background: var(--primary);
}

.success {
  background: var(--success);
}

.accent {
  background: var(--accent);
}

.warning {
  background: var(--warning);
}
</style>
