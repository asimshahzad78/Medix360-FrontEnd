<template>
  <div class="card">
    <h3>Recent Payments</h3>

    <p v-if="loading" class="state">Loading payments...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="payments.length === 0" class="state">No recent payments yet.</p>

    <div v-for="p in payments" v-else :key="p.patientName" class="item">
      <span>{{ p.patientName }}</span>
      <strong>PKR {{ p.amount }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { dashboardService } from '../dashboard.service'
import type { PaymentItem } from '../dashboard.types'

const payments = ref<PaymentItem[]>([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  try {
    payments.value = await dashboardService.getRecentPayments()
  } catch {
    error.value = 'Could not load recent payments.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.item {
  background: #ecfdf5;
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.state {
  color: #64748b;
  margin: 8px 0 0;
}

.state.error {
  color: #991b1b;
}
</style>
