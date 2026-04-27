<template>
  <span class="status-badge" :class="`status-badge--${tone}`">
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  }>(),
  {
    label: '',
    tone: 'neutral',
  },
)
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  border: 1px solid transparent;
}

.status-badge--neutral {
  color: #374151;
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.status-badge--success {
  color: #166534;
  background: #dcfce7;
  border-color: #bbf7d0;
}

.status-badge--warning {
  color: #92400e;
  background: #fef3c7;
  border-color: #fde68a;
}

.status-badge--danger {
  color: #991b1b;
  background: #fee2e2;
  border-color: #fecaca;
}

.status-badge--info {
  color: #1e40af;
  background: #dbeafe;
  border-color: #bfdbfe;
}
</style>

