<template>
  <div class="layout">
    <!-- overlay (mobile only) -->
    <div class="overlay" :class="{ show: sidebarOpen }" @click="sidebarOpen = false" />

    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="main">
      <AppHeader @toggleSidebar="sidebarOpen = !sidebarOpen" />

      <main class="content">
        <router-view :key="$route.name" />
      </main>

      <!-- optional footer -->
      <!-- <AppFooter /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const sidebarOpen = ref(false)
const route = useRoute()

// auto-close sidebar when route changes (mobile UX)
watch(
  () => route.fullPath,
  () => (sidebarOpen.value = false)
)
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--bg-page);
}

/* Desktop: sidebar + main */
@media (min-width: 1024px) {
  .layout {
    display: flex;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}

/* Mobile: main takes full width; sidebar becomes drawer */
.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content {
  padding: 24px;
  background: #f3f7f5;
  min-width: 0;
  /* prevents overflow with wide tables */
}

/* smaller padding on small screens */
@media (max-width: 640px) {
  .content {
    padding: 14px;
  }
}

/* overlay for drawer */
.overlay {
  display: none;
}

@media (max-width: 1023px) {
  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;
    z-index: 40;
  }

  .overlay.show {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
