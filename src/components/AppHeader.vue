<template>
  <header class="header">
    <div class="left">
      <button class="burger" type="button" @click="$emit('toggleSidebar')" aria-label="Open menu">
        ☰
      </button>

      <h1 class="title">{{ title }}</h1>
    </div>

    <div class="right">
      <span class="hello">Hello 👋</span>
      <button class="logout" @click="logout">Logout</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

defineEmits<{ (e: 'toggleSidebar'): void }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const title = computed(() => (route.meta?.title as string) ?? 'Dashboard')

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<style scoped>
.header {
  height: 64px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 30;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* hamburger only on mobile/tablet */
.burger {
  display: none;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 10px;
  height: 38px;
  width: 42px;
  cursor: pointer;
}

@media (max-width: 1023px) {
  .burger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .header {
    padding: 0 14px;
  }
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hello {
  font-size: 14px;
  color: #6b7280;
}

.logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.logout:hover {
  background: #dc2626;
}
</style>
