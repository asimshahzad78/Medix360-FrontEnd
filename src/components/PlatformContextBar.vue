<template>
  <section class="context-bar" aria-label="Active hospital context">
    <label class="context-field">
      <span>Tenant</span>
      <input v-model.trim="draft.tenantId" placeholder="Tenant ID" @change="commit" />
    </label>

    <label class="context-field">
      <span>Facility</span>
      <AppLookupSelect
        v-model="draft.facilityId"
        kind="facility"
        placeholder="Search facility"
        @selected="commit"
      />
    </label>

    <label class="context-field optional">
      <span>Department</span>
      <AppLookupSelect
        v-model="draft.departmentId"
        kind="department"
        placeholder="Any department"
        @selected="commit"
      />
    </label>

    <label class="context-field optional">
      <span>Doctor</span>
      <AppLookupSelect v-model="draft.doctorId" kind="doctor" placeholder="Any doctor" @selected="commit" />
    </label>

    <label class="context-field optional">
      <span>Ward</span>
      <AppLookupSelect v-model="draft.wardId" kind="ward" placeholder="Any ward" @selected="commit" />
    </label>

    <label class="context-field optional">
      <span>Store</span>
      <AppLookupSelect v-model="draft.storeId" kind="store" placeholder="Any store" @selected="commit" />
    </label>

    <label class="context-field optional">
      <span>Counter</span>
      <AppLookupSelect v-model="draft.counterId" kind="counter" placeholder="Any counter" @selected="commit" />
    </label>

    <label class="context-field optional">
      <span>Shift</span>
      <AppLookupSelect v-model="draft.shiftId" kind="shift" placeholder="Any shift" @selected="commit" />
    </label>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import AppLookupSelect from '@/components/ui/AppLookupSelect.vue'
import { usePlatformContextStore } from '@/store/platform-context.store'

const contextStore = usePlatformContextStore()

const draft = reactive({ ...contextStore.active })

const commit = () => {
  contextStore.update({
    tenantId: String(draft.tenantId ?? ''),
    facilityId: String(draft.facilityId ?? ''),
    propertyId: String(draft.facilityId ?? ''),
    departmentId: String(draft.departmentId ?? ''),
    doctorId: String(draft.doctorId ?? ''),
    wardId: String(draft.wardId ?? ''),
    storeId: String(draft.storeId ?? ''),
    counterId: String(draft.counterId ?? ''),
    shiftId: String(draft.shiftId ?? ''),
  })
}

watch(
  () => contextStore.active,
  (next) => {
    Object.assign(draft, next)
  },
)
</script>

<style scoped>
.context-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
  gap: 10px;
  padding: 10px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.context-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.context-field span {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.context-field input {
  width: 100%;
  height: 34px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  font-size: 13px;
  padding: 0 9px;
}

.context-field input:focus {
  border-color: #16a34a;
  outline: 2px solid rgba(22, 163, 74, 0.12);
}

@media (max-width: 1280px) {
  .context-bar {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }
}

@media (max-width: 760px) {
  .context-bar {
    grid-template-columns: 1fr 1fr;
    padding: 10px 14px;
  }

  .context-field.optional {
    display: none;
  }
}
</style>
