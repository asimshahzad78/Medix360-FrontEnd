<template>
  <div class="app-modal-backdrop" @click.self="emit('close')">
    <section class="app-modal" :style="{ maxWidth }" role="dialog" aria-modal="true">
      <header v-if="$slots.header || title" class="app-modal__header">
        <slot name="header">
          <div>
            <h2 class="app-modal__title">{{ title }}</h2>
            <p v-if="subtitle" class="app-modal__subtitle">{{ subtitle }}</p>
          </div>
        </slot>

        <button class="app-modal__close" type="button" aria-label="Close" @click="emit('close')">
          &times;
        </button>
      </header>

      <div class="app-modal__body">
        <slot />
      </div>

      <footer v-if="$slots.footer" class="app-modal__footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    maxWidth?: string
  }>(),
  {
    maxWidth: '980px',
  },
)

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<style scoped>
.app-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 30px 16px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.55);
}

.app-modal {
  width: 100%;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
}

.app-modal__header,
.app-modal__footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
}

.app-modal__header {
  border-bottom: 1px solid #eef2f7;
}

.app-modal__footer {
  border-top: 1px solid #eef2f7;
}

.app-modal__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.app-modal__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
}

.app-modal__close {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 20px;
}

.app-modal__body {
  padding: 14px 18px;
}

@media (max-width: 700px) {
  .app-modal-backdrop {
    padding: 10px;
  }

  .app-modal {
    max-height: calc(100vh - 20px);
    display: flex;
    flex-direction: column;
    border-radius: 8px;
  }

  .app-modal__header,
  .app-modal__footer {
    padding: 12px;
  }

  .app-modal__body {
    overflow: auto;
    padding: 12px;
  }

  .app-modal__title {
    font-size: 17px;
  }
}
</style>
