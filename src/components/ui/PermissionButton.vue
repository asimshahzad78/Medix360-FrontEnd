<template>
  <button
    v-if="visible"
    class="permission-button"
    :class="`permission-button--${variant}`"
    :type="buttonType"
    :disabled="isDisabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { hasAllPermissions, hasAnyPermission } from '@/security/permissions'

const props = withDefaults(
  defineProps<{
    permissions?: string[]
    requireAll?: boolean
    mode?: 'disable' | 'hide'
    disabled?: boolean
    buttonType?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'danger'
  }>(),
  {
    permissions: () => [],
    requireAll: false,
    mode: 'disable',
    disabled: false,
    buttonType: 'button',
    variant: 'primary',
  },
)

const emit = defineEmits<{
  (event: 'click', value: MouseEvent): void
}>()

const auth = useAuthStore()

const allowed = computed(() =>
  props.requireAll
    ? hasAllPermissions(auth.permissions, props.permissions)
    : hasAnyPermission(auth.permissions, props.permissions),
)

const visible = computed(() => props.mode !== 'hide' || allowed.value)
const isDisabled = computed(() => props.disabled || !allowed.value)

const onClick = (event: MouseEvent) => {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<style scoped>
.permission-button {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid transparent;
}

.permission-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.permission-button--primary {
  color: #fff;
  background: #16a34a;
}

.permission-button--secondary {
  color: #111827;
  background: #fff;
  border-color: #d1d5db;
}

.permission-button--danger {
  color: #fff;
  background: #dc2626;
}
</style>

