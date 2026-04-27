<template>
  <section v-if="problem" class="problem" role="alert">
    <div class="problem-header">
      <div>
        <strong>{{ problem.title || fallbackTitle }}</strong>
        <p v-if="problem.detail">{{ problem.detail }}</p>
      </div>
      <span v-if="problem.status">{{ problem.status }}</span>
    </div>

    <AppValidationErrors v-if="problem.errors" :errors="problem.errors" title="Validation details" />

    <dl v-if="problem.correlationId || problem.traceId || problem.instance">
      <div v-if="problem.correlationId">
        <dt>Correlation ID</dt>
        <dd>{{ problem.correlationId }}</dd>
      </div>
      <div v-if="problem.traceId">
        <dt>Trace ID</dt>
        <dd>{{ problem.traceId }}</dd>
      </div>
      <div v-if="problem.instance">
        <dt>Instance</dt>
        <dd>{{ problem.instance }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { ProblemDetails } from '@/services/api-response'
import AppValidationErrors from './AppValidationErrors.vue'

withDefaults(
  defineProps<{
    problem: ProblemDetails | null
    fallbackTitle?: string
  }>(),
  {
    fallbackTitle: 'Request failed',
  },
)
</script>

<style scoped>
.problem {
  display: grid;
  gap: 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff7f7;
  color: #7f1d1d;
  padding: 12px;
}

.problem-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

strong {
  display: block;
  font-size: 14px;
}

p {
  margin: 4px 0 0;
  color: #991b1b;
  font-size: 13px;
}

.problem-header span {
  align-self: flex-start;
  border-radius: 999px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 12px;
  font-weight: 800;
  padding: 5px 8px;
}

dl {
  display: grid;
  gap: 6px;
  margin: 0;
}

dt {
  color: #991b1b;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

dd {
  margin: 2px 0 0;
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}
</style>
