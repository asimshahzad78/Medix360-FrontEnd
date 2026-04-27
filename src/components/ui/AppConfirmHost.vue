<template>
  <Teleport to="body">
    <AppModal
      v-if="confirmation.current"
      :title="confirmation.current.title"
      max-width="520px"
      @close="confirmation.cancel"
    >
      <p class="message">{{ confirmation.current.message }}</p>

      <template #footer>
        <button class="btn-secondary" type="button" @click="confirmation.cancel">
          {{ confirmation.current.cancelLabel }}
        </button>
        <button
          class="btn-primary"
          :class="{ danger: confirmation.current.variant === 'danger' }"
          type="button"
          @click="confirmation.confirm"
        >
          {{ confirmation.current.confirmLabel }}
        </button>
      </template>
    </AppModal>
  </Teleport>
</template>

<script setup lang="ts">
import AppModal from './AppModal.vue'
import { useConfirmationStore } from '@/store/confirmation.store'

const confirmation = useConfirmationStore()
</script>

<style scoped>
.message {
  margin: 0;
  color: #334155;
  line-height: 1.55;
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

.btn-primary.danger {
  border-color: #dc2626;
  background: #dc2626;
}

.btn-secondary {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
}
</style>
