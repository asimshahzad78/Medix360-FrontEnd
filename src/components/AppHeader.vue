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
  background: rgba(255, 255, 255, 0.94);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(12px);
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.burger {
  display: none;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 8px;
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
  color: var(--primary-dark);
  font-size: 12px;
  font-weight: 700;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hello {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout {
  background: var(--danger);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
}

.logout:hover {
  background: #b91c1c;
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
