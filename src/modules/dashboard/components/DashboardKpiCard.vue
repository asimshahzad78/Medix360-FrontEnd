<template>
  <div class="kpi-card" :class="variant">
    <div class="left">
      <p class="label">{{ label }}</p>
      <h2>{{ value }}</h2>

      <div v-if="trend" class="trend">
        <span :class="trend > 0 ? 'up' : 'down'"> {{ trend > 0 ? '+' : '' }}{{ trend }}% </span>
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
  variant: 'red' | 'green' | 'blue' | 'purple'
  trend?: number
}>()
</script>

<style scoped>
.kpi-card {
  border-radius: 16px;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  min-height: 120px;
}

/* 🎨 GRADIENTS (MATCHING ERES) */
.red {
  background: linear-gradient(135deg, #ee338d, #ff9a9e);
}

.green {
  background: linear-gradient(135deg, #56ab2f, #a8e063);
}

.blue {
  background: linear-gradient(135deg, #5b86e5, #36d1dc);
}

.purple {
  background: linear-gradient(135deg, #a12fda, #f64f59);
}

.label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 6px;
}

h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.trend {
  margin-top: 8px;
  font-size: 13px;
}

.trend .up {
  color: #eaffea;
}

.trend .down {
  color: #ffecec;
}

/* Icon circle */
.icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
</style>
