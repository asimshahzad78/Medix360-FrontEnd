<template>
  <BaseModal :title="model ? 'Edit Department' : 'Add Department'"
    subtitle="Keep names short & consistent (e.g. OPD, Radiology)." @close="emit('close')">
    <div class="grid">
      <div>
        <label>Name *</label>
        <input class="input" v-model="name" placeholder="e.g. OPD / Radiology" />
      </div>
      <div>
        <label>Code (optional)</label>
        <input class="input" v-model="code" placeholder="e.g. OPD" />
      </div>
    </div>

    <div class="row">
      <button class="btn btn-primary" :disabled="saving" @click="save">
        {{ model ? 'Update' : 'Save' }}
      </button>
      <button class="btn" :disabled="saving" @click="emit('close')">Cancel</button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '../pages/BaseModal.vue'
import { hrLookupsService } from '../hr-lookups.service'

type DepartmentDto = { Id: number; Name: string; Code?: string | null }

const props = defineProps<{ model: DepartmentDto | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const name = ref('')
const code = ref('')
const saving = ref(false)

watch(
  () => props.model,
  (m) => {
    name.value = (m?.Name ?? '').trim()
    code.value = (m?.Code ?? '').trim()
  },
  { immediate: true },
)

async function save() {
  const n = name.value.trim()
  if (!n) return alert('Name is required')

  saving.value = true
  try {
    const payload = { name: n, code: code.value.trim() || undefined }
    if (props.model) await hrLookupsService.updateDepartment(props.model.Id, payload)
    else await hrLookupsService.createDepartment(payload)

    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 14px;
  row-gap: 12px;
}

/* important: prevent overflow inside grid columns */
.grid>div {
  min-width: 0;
}

.input {
  box-sizing: border-box;
  /* ✅ this is the main fix */
  width: 100%;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  font-weight: 800;
}

label {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 6px;
  display: block;
}


.row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn {
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  font-weight: 900;
  cursor: pointer;
}

.btn-primary {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
}
</style>
