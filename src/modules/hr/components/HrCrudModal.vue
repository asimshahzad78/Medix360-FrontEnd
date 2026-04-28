<template>
  <BaseModal :title="title" :subtitle="subtitle" @close="emit('close')">
    <div class="grid">
      <div v-for="field in fields" :key="field.key" :class="['field', { span2: field.type === 'textarea' }]">
        <label>
          {{ field.label }}<span v-if="field.required"> *</span>
        </label>

        <AppLookupSelect
          v-if="field.type === 'lookup' && field.lookupKind"
          class="lookup-input"
          :model-value="lookupValue(field.key)"
          :kind="field.lookupKind"
          :placeholder="field.placeholder || `Search ${field.label}`"
          @update:model-value="(value) => updateLookupField(field.key, value)"
        />

        <textarea
          v-else-if="field.type === 'textarea'"
          class="input textarea"
          :rows="field.rows ?? 4"
          :placeholder="field.placeholder || ''"
          :value="String(form[field.key] ?? '')"
          @input="updateField(field.key, field.type, $event)"
        />

        <select
          v-else-if="field.type === 'select'"
          class="input"
          :value="String(form[field.key] ?? '')"
          @change="updateField(field.key, field.type, $event)"
        >
          <option value="">Select {{ field.label }}</option>
          <option v-for="opt in field.options || []" :key="`${field.key}-${opt.value}`" :value="String(opt.value)">
            {{ opt.label }}
          </option>
        </select>

        <label v-else-if="field.type === 'checkbox'" class="check-row">
          <input
            type="checkbox"
            :checked="Boolean(form[field.key])"
            @change="updateField(field.key, field.type, $event)"
          />
          <span>Yes</span>
        </label>

        <input
          v-else
          class="input"
          :type="field.type || 'text'"
          :placeholder="field.placeholder || ''"
          :min="field.min"
          :max="field.max"
          :step="field.step"
          :value="stringValue(field.key)"
          @input="updateField(field.key, field.type, $event)"
        />
      </div>
    </div>

    <template #footer>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="onSave">
        {{ saveLabel }}
      </button>
      <button class="btn" type="button" :disabled="saving" @click="emit('close')">
        Cancel
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import BaseModal from '../pages/BaseModal.vue'
import AppLookupSelect from '@/components/ui/AppLookupSelect.vue'
import type { CrudField, FormModel } from '../hr-crud.types'
import { toDateInputValue, toDateTimeLocalValue, toTimeInputValue } from '../hr-crud.utils'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    saveLabel?: string
    fields: CrudField[]
    model: FormModel | null
    initialState: FormModel
    saving?: boolean
  }>(),
  {
    subtitle: '',
    saveLabel: 'Save',
    saving: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', value: FormModel): void
}>()

const form = reactive<FormModel>({})

function buildState(source: FormModel | null) {
  const next: FormModel = { ...props.initialState, ...(source || {}) }
  for (const field of props.fields) {
    const raw = next[field.key]
    if (field.type === 'date') next[field.key] = toDateInputValue(raw)
    else if (field.type === 'datetime-local') next[field.key] = toDateTimeLocalValue(raw)
    else if (field.type === 'time') next[field.key] = toTimeInputValue(raw)
    else if (field.type === 'checkbox') next[field.key] = Boolean(raw)
    else if ((field.type || 'text') === 'number') next[field.key] = raw ?? ''
    else next[field.key] = raw ?? ''
  }
  return next
}

watch(
  () => props.model,
  (model) => {
    const next = buildState(model)
    for (const key of Object.keys(form)) delete form[key]
    Object.assign(form, next)
  },
  { immediate: true, deep: true },
)

function stringValue(key: string) {
  const value = form[key]
  return value === null || value === undefined ? '' : String(value)
}

function lookupValue(key: string): string | number | null {
  const value = form[key]
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

function updateLookupField(key: string, value: string | number | null) {
  form[key] = value
}

function updateField(key: string, type: CrudField['type'], event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  if (!target) return

  if (type === 'checkbox' && target instanceof HTMLInputElement) {
    form[key] = target.checked
    return
  }

  const raw = target.value
  if (type === 'number') {
    form[key] = raw === '' ? null : Number(raw)
    return
  }

  form[key] = raw
}

function onSave() {
  for (const field of props.fields) {
    if (!field.required || field.type === 'checkbox') continue
    const value = form[field.key]
    if (value === null || value === undefined || String(value).trim() === '') {
      alert(`${field.label} is required`)
      return
    }
  }

  const error = validateForm()
  if (error) {
    alert(error)
    return
  }

  emit('save', { ...form })
}

function asDate(value: FormModel[string]) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function validateDateOrder(fromKey: string, toKey: string, message: string): string | null {
  const from = asDate(form[fromKey])
  const to = asDate(form[toKey])
  if (from && to && from > to) return message
  return null
}

function validateForm(): string | null {
  for (const field of props.fields) {
    const value = form[field.key]
    if (field.type === 'number' && value !== null && value !== undefined && value !== '') {
      const parsed = Number(value)
      if (!Number.isFinite(parsed)) return `${field.label} must be a valid number`
      if (field.key.toLowerCase().endsWith('id') && parsed <= 0) return `${field.label} must be selected`
    }

    if (field.type === 'select' && value && field.options?.length) {
      const allowed = new Set(field.options.map((option) => String(option.value)))
      if (!allowed.has(String(value))) return `${field.label} has an invalid value`
    }
  }

  return (
    validateDateOrder('fromDate', 'toDate', 'From Date must be before To Date') ||
    validateDateOrder('startDate', 'endDate', 'Start Date must be before End Date') ||
    validateDateOrder('issueDate', 'expiryDate', 'Issue Date must be before Expiry Date') ||
    validateDateOrder('reviewPeriodFrom', 'reviewPeriodTo', 'Review period start must be before review period end')
  )
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  min-width: 0;
}

.field.span2 {
  grid-column: 1 / -1;
}

label {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 6px;
  display: block;
}

.input {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  font-weight: 800;
  background: #fff;
}

.lookup-input {
  min-height: 44px;
}

.textarea {
  height: auto;
  padding: 12px;
  resize: vertical;
}

.check-row {
  min-height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
}

.check-row input {
  width: 16px;
  height: 16px;
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
