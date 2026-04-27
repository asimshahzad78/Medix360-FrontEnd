<template>
  <dl class="audit-meta">
    <div v-if="meta.createdAt || meta.createdBy" class="audit-meta__item">
      <dt>Created</dt>
      <dd>{{ formatActorDate(meta.createdBy, meta.createdAt) }}</dd>
    </div>

    <div v-if="meta.updatedAt || meta.updatedBy" class="audit-meta__item">
      <dt>Updated</dt>
      <dd>{{ formatActorDate(meta.updatedBy, meta.updatedAt) }}</dd>
    </div>

    <div v-if="meta.rowVersion" class="audit-meta__item">
      <dt>Version</dt>
      <dd>{{ meta.rowVersion }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { AuditMeta } from '@/types/audit'

defineProps<{
  meta: AuditMeta
}>()

const formatActorDate = (actor?: string | null, value?: string | null): string => {
  const parts = [actor, value ? new Date(value).toLocaleString() : null].filter(Boolean)
  return parts.join(' - ')
}
</script>

<style scoped>
.audit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin: 0;
  padding: 10px 12px;
  color: #4b5563;
  background: #f9fafb;
  border: 1px solid #eef2f7;
  border-radius: 8px;
}

.audit-meta__item {
  min-width: 160px;
}

.audit-meta dt {
  margin: 0 0 2px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #6b7280;
}

.audit-meta dd {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}
</style>

