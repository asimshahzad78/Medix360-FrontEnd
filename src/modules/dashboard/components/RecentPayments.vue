<template>
  <div class="card">
    <h3>Recent Payments</h3>

    <div v-for="p in payments" :key="p.patientName" class="item">
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

onMounted(async () => {
  payments.value = await dashboardService.getRecentPayments()
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
</style>
