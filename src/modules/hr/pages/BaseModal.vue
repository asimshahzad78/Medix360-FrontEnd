<template>
  <div class="backdrop" @click.self="emit('close')">
    <div class="card" role="dialog" aria-modal="true" @click.stop>
      <header class="header">
        <div>
          <h2 class="title">{{ title }}</h2>
          <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
        </div>

        <button class="x" type="button" @click="emit('close')" aria-label="Close">×</button>
      </header>

      <div class="body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

defineProps<{ title: string; subtitle?: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>


<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 16px;
  overflow: auto;
}

.card {
  width: 980px;
  max-width: 95vw;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #eef2f7;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 950;
}

.subtitle {
  margin-top: 6px;
  color: #6b7280;
  font-weight: 700;
  font-size: 12px;
}

.x {
  height: 36px;
  width: 36px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 20px;
  cursor: pointer;
}

.body {
  padding: 16px 18px;
}

.footer {
  padding: 14px 18px;
  border-top: 1px solid #eef2f7;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
