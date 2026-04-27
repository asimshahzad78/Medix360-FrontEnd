<template>
  <AppModal
    :title="title"
    :subtitle="subtitle"
    max-width="560px"
    @close="emit('cancel')"
  >
    <form class="reason-form" @submit.prevent="submit">
      <div class="summary">
        <span>Action</span>
        <strong>{{ actionLabel }}</strong>
      </div>

      <label for="audit-reason">Audit reason</label>
      <textarea
        id="audit-reason"
        ref="textareaRef"
        v-model.trim="reason"
        :placeholder="placeholder"
        rows="5"
        maxlength="500"
      />

      <p v-if="error" class="field-error">{{ error }}</p>
      <p class="hint">{{ reason.length }}/500 characters</p>
    </form>

    <template #footer>
      <button class="btn-secondary" type="button" @click="emit('cancel')">Cancel</button>
      <button class="btn-primary" type="button" :disabled="submitting" @click="submit">
        {{ submitting ? 'Working...' : confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import AppModal from './AppModal.vue'

const props = withDefaults(
  defineProps<{
    actionLabel: string
    title?: string
    subtitle?: string
    confirmLabel?: string
    placeholder?: string
    submitting?: boolean
    minLength?: number
  }>(),
  {
    title: 'Audit reason required',
    subtitle: 'This action will be stored in the audit trail.',
    confirmLabel: 'Continue',
    placeholder: 'Explain why this sensitive action is being performed.',
    submitting: false,
    minLength: 8,
  },
)

const emit = defineEmits<{
  (event: 'confirm', reason: string): void
  (event: 'cancel'): void
}>()

const reason = ref('')
const error = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const submit = () => {
  if (props.submitting) return

  if (reason.value.length < props.minLength) {
    error.value = `Please enter at least ${props.minLength} characters.`
    return
  }

  emit('confirm', reason.value)
}

onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
})
</script>

<style scoped>
.reason-form {
  display: grid;
  gap: 10px;
}

.summary {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #dcfce7;
  border-radius: 8px;
  background: #f0fdf4;
  padding: 10px 12px;
}

.summary span,
.hint {
  color: #64748b;
  font-size: 12px;
}

.summary strong {
  color: #166534;
}

label {
  color: #1f2937;
  font-size: 13px;
  font-weight: 800;
}

textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px 12px;
  box-sizing: border-box;
}

textarea:focus {
  border-color: #16a34a;
  outline: 2px solid rgba(22, 163, 74, 0.14);
}

.field-error {
  margin: 0;
  color: #b42318;
  font-size: 12px;
}

.hint {
  margin: 0;
  text-align: right;
}

.btn-primary,
.btn-secondary {
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  padding: 9px 14px;
}

.btn-primary {
  border: 1px solid #166534;
  background: #166534;
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-secondary {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}
</style>
