<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite" aria-atomic="true">
      <article
        v-for="toast in toastStore.items"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
      >
        <div>
          <strong>{{ toast.title }}</strong>
          <p v-if="toast.message">{{ toast.message }}</p>
        </div>
        <button type="button" aria-label="Dismiss notification" @click="toastStore.dismiss(toast.id)">
          &times;
        </button>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/store/toast.store'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-host {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 1000000;
  display: grid;
  width: min(420px, calc(100vw - 32px));
  gap: 10px;
}

.toast {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #dbe7db;
  border-left-width: 5px;
  border-radius: 8px;
  background: #fff;
  color: #0f172a;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
  padding: 12px;
}

.toast--success {
  border-left-color: #16a34a;
}

.toast--error {
  border-left-color: #dc2626;
}

.toast--warning {
  border-left-color: #f59e0b;
}

.toast--info {
  border-left-color: #2563eb;
}

strong {
  display: block;
  font-size: 14px;
}

p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

button {
  align-self: flex-start;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px 8px;
}
</style>
