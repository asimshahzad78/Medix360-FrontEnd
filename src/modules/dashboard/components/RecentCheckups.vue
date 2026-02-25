<template>
  <div class="card">
    <h3>Recent Checkups</h3>

    <div v-for="c in checkups" :key="c.patientName" class="item">
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

onMounted(async () => {
  checkups.value = await dashboardService.getRecentCheckups()
})
</script>

<style scoped>
.item {
  background: #ecfdf5;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.doctor {
  font-size: 13px;
  color: #16a34a;
}
</style>
