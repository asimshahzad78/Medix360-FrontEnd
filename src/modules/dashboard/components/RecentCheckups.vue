<template>
  <div class="card">
    <h3>Recent Checkups</h3>

    <p v-if="loading" class="state">Loading checkups...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="checkups.length === 0" class="state">No recent checkups yet.</p>

    <div v-for="c in checkups" v-else :key="c.patientName" class="item">
      <div>
        <strong>{{ c.patientName }}</strong>
        <div class="doctor">{{ c.doctorName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { dashboardService } from '../dashboard.service'
import type { CheckupItem } from '../dashboard.types'

const checkups = ref<CheckupItem[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    checkups.value = await dashboardService.getRecentCheckups()
  } catch {
    error.value = 'Could not load recent checkups.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.item {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

h3 {
  margin: 0 0 14px;
  color: var(--text-main);
  font-size: 18px;
}

.doctor {
  font-size: 13px;
  color: var(--primary-dark);
}

.state {
  color: var(--text-muted);
  margin: 8px 0 0;
}

.state.error {
  color: #991b1b;
}
</style>
