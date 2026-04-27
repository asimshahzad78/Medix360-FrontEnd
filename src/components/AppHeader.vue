<template>
  <header class="header">
    <div class="left">
      <button class="burger" type="button" @click="$emit('toggleSidebar')" aria-label="Open menu">
        Menu
      </button>

      <h1 class="title">{{ title }}</h1>
    </div>

    <div class="right">
      <span class="context">{{ contextLabel }}</span>
      <span class="hello">{{ auth.user?.Email ?? 'Signed in' }}</span>
      <button class="logout" @click="logout">Logout</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { usePlatformContextStore } from '@/store/platform-context.store'

defineEmits<{ (e: 'toggleSidebar'): void }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const platformContext = usePlatformContextStore()

const title = computed(() => (route.meta?.title as string) ?? 'Dashboard')
const contextLabel = computed(() => `Facility: ${platformContext.displayFacility}`)

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

.burger {
  display: none;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 6px;
  height: 38px;
  padding: 0 12px;
  cursor: pointer;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.context {
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hello {
  font-size: 14px;
  color: #6b7280;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.logout:hover {
  background: #dc2626;
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

  .context {
    display: none;
  }
}

@media (max-width: 640px) {
  .hello {
    display: none;
  }
}
</style>
