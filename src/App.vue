<template>
  <router-view />
  <AppToastHost />
  <AppConfirmHost />
</template>

<script setup lang="ts">
import AppConfirmHost from '@/components/ui/AppConfirmHost.vue'
import AppToastHost from '@/components/ui/AppToastHost.vue'
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background: var(--color-bg-page);
  color: var(--color-text-main);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}
</style>
