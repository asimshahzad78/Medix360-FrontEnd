<template>
  <div class="lookup-select">
    <Multiselect
      :model-value="modelValue"
      :options="options"
      value-prop="id"
      label="label"
      track-by="label"
      :searchable="true"
      :filter-results="false"
      :close-on-select="true"
      :clear-on-select="true"
      :can-clear="clearable"
      :disabled="disabled"
      :loading="loading"
      :placeholder="placeholder"
      :min-chars="minChars"
      @search-change="search"
      @open="loadInitial"
      @update:model-value="updateValue"
    >
      <template #option="{ option }">
        <div class="lookup-option">
          <strong>{{ option.label }}</strong>
          <small v-if="option.code || option.description">
            {{ [option.code, option.description].filter(Boolean).join(' - ') }}
          </small>
        </div>
      </template>
      <template #singlelabel="{ value }">
        <div class="multiselect-single-label">
          {{ value.label }}
        </div>
      </template>
    </Multiselect>

    <p v-if="error" class="lookup-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'
import { getApiErrorMessage } from '@/services/api-response'
import { lookupService, type LookupKind, type LookupOption } from '@/services/lookup.service'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    kind: LookupKind
    placeholder?: string
    params?: Record<string, unknown>
    disabled?: boolean
    clearable?: boolean
    minChars?: number
    preload?: boolean
  }>(),
  {
    modelValue: null,
    placeholder: 'Search...',
    params: () => ({}),
    disabled: false,
    clearable: true,
    minChars: 0,
    preload: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  selected: [option: LookupOption | null]
}>()

const options = ref<LookupOption[]>([])
const loading = ref(false)
const error = ref('')
let searchTimer: number | undefined

const findSelected = (value: string | number | null | undefined): LookupOption | null =>
  options.value.find((option) => String(option.id) === String(value)) ?? null

const load = async (term = '') => {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    options.value = await lookupService.search(props.kind, term, props.params)
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Lookup failed')
    options.value = []
  } finally {
    loading.value = false
  }
}

const search = (term: string) => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => load(term), 250)
}

const loadInitial = () => {
  if (!options.value.length) void load()
}

const updateValue = (value: string | number | null) => {
  emit('update:modelValue', value)
  emit('selected', findSelected(value))
}

watch(
  () => props.params,
  () => {
    options.value = []
    if (props.preload) void load()
  },
  { deep: true },
)

onMounted(() => {
  if (props.preload) void load()
})
</script>

<style scoped>
.lookup-select {
  min-width: 0;
}

.lookup-option {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.lookup-option strong {
  color: #0f172a;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lookup-option small {
  color: #64748b;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lookup-error {
  margin: 5px 0 0;
  color: #b91c1c;
  font-size: 12px;
}

:deep(.multiselect) {
  min-height: 34px;
  border-color: #cbd5e1;
  border-radius: 6px;
  box-shadow: none;
  color: #0f172a;
  font-size: 13px;
}

:deep(.multiselect.is-active) {
  border-color: #16a34a;
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.12);
}

:deep(.multiselect-search),
:deep(.multiselect-single-label),
:deep(.multiselect-placeholder) {
  font-size: 13px;
}
</style>
