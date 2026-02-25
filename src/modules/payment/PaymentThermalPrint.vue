<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { PaymentService } from './payment.service'
import { companyInfoService } from '@/modules/company-info/company-info.service'
import type { PaymentPrintResponse } from './payment.types'

interface CompanyInfo {
  Name: string
  Address: string
  Phone: string
  CompanyLogoImagePath: string
}

const route = useRoute()

const payment = ref<PaymentPrintResponse | null>(null)
const company = ref<CompanyInfo | null>(null)

const displayStatus = computed(() => {
  if (!payment.value) return ''
  const s = String(payment.value.status ?? '').toLowerCase()
  if (s === 'paid' || s === 'posted') return 'Paid'
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled'
  return String(payment.value.status ?? '')
})

const load = async (): Promise<void> => {
  const id = Number(route.params.id)

  // ✅ same API as A4 print: includes doctorName/doctorMobile
  payment.value = await PaymentService.getInvoiceForPrint(id)

  try {
    company.value = await companyInfoService.get()
  } catch {
    company.value = null
  }
}

onMounted(() => {
  load().then(() => {
    window.print()
  })
})
</script>

<template>
  <div v-if="payment" class="thermal">
    <div class="center">
      <strong>{{ company?.Name ?? 'Clinic' }}</strong>
      <div v-if="company?.Phone">Phone: {{ company.Phone }}</div>
      <div v-if="company?.Address">{{ company.Address }}</div>
      <div>--------------------</div>
    </div>

    <div>
      Receipt: {{ payment.receiptNo }}<br />
      Date: {{ payment.paymentDate }}<br />
      Status: {{ displayStatus }}<br />
      Patient: {{ payment.patient.fullName }}
      <template v-if="payment.patient.mrNo"><br />MR No: {{ payment.patient.mrNo }}</template>
      <template v-if="payment.patient.age"><br />Age: {{ payment.patient.age }} {{ payment.patient.gender }}</template>
    </div>

    <div>--------------------</div>

    <div v-if="payment.doctorName">
      Doctor: {{ payment.doctorName }}<br />
      Mobile: {{ payment.doctorMobile?.trim() ? payment.doctorMobile : '-' }}
      <div>--------------------</div>
    </div>

    <div v-for="row in payment.details" :key="row.id">
      {{ row.description }}<br />
      {{ row.netAmount }}
      <div>--------------------</div>
    </div>

    <div>
      TOTAL: {{ payment.netAmount }}<br />
      PAID: {{ payment.paidAmount }}<br />
      BAL: {{ payment.balanceAmount }}
    </div>

    <div>--------------------</div>

    <div class="center">Thank You</div>
  </div>
</template>

<style scoped>
@media print {
  body {
    margin: 0;
  }
}

.thermal {
  width: 80mm;
  font-family: monospace;
  font-size: 12px;
}

.center {
  text-align: center;
}
</style>
