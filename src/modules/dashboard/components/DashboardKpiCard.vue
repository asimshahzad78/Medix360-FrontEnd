<template>
  <div class="kpi-card" :class="variant">
    <div class="left">
      <p class="label">{{ label }}</p>
      <h2>{{ value }}</h2>

      <div v-if="trend" class="trend">
        <span :class="trend > 0 ? 'up' : 'down'">{{ trend > 0 ? '+' : '' }}{{ trend }}%</span>
      </div>
    </div>

    <div class="icon">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  variant: 'red' | 'green' | 'blue' | 'purple' | 'teal'
  trend?: number
}>()
</script>

<style scoped>
.kpi-card {
  position: relative;
  display: flex;
  min-height: 116px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: var(--shadow-soft);
  color: var(--text-main);
  padding: 20px;
}

.kpi-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--card-accent);
}

.red {
  --card-accent: #dc2626;
}

.green {
  --card-accent: #16a34a;
}

.blue {
  --card-accent: #2563eb;
}

.purple {
  --card-accent: #7c3aed;
}

.teal {
  --card-accent: #0f766e;
}

.label {
  margin: 0 0 6px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
}

h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0;
}

.trend {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 700;
}

.trend .up {
  color: var(--success);
}

.trend .down {
  color: var(--danger);
}

.icon {
  display: flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--card-accent), white 72%);
  border-radius: 8px;
  background: color-mix(in srgb, var(--card-accent), white 88%);
  color: var(--card-accent);
  font-size: 16px;
  font-weight: 800;
}
</style>
