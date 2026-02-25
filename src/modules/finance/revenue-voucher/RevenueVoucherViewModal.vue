<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <h3>Revenue Voucher</h3>

      <div v-if="loading">Loading…</div>

      <div v-else>
        <p><strong>Date:</strong> {{ formatDate(v.VoucherDate) }}</p>
        <p><strong>Invoice:</strong> {{ v.InvoiceNumber ?? '-' }}</p>
        <p><strong>Status:</strong> {{ statusLabel(v.Status) }}</p>
        <p><strong>Net Amount:</strong> {{ v.NetAmount.toFixed(2) }}</p>

        <div class="actions">
          <button @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { revenueVoucherService } from './revenueVoucher.service'
import { RevenueVoucherStatus, type RevenueVoucherApiDto } from './revenueVoucher.types'
import { systemContext } from '@/services/systemContext'

export default defineComponent({
  props: {
    voucherId: { type: String, required: true },
  },
  emits: ['close'],

  setup(props) {
    const loading = ref(false)
    const v = ref<RevenueVoucherApiDto>({} as RevenueVoucherApiDto)

    const load = async () => {
      loading.value = true
      v.value = await revenueVoucherService.getById(
        props.voucherId,
        systemContext.tenantId,
        systemContext.propertyId,
      )
      loading.value = false
    }

    const statusLabel = (s: RevenueVoucherStatus) => RevenueVoucherStatus[s]
    const formatDate = (d: string) => new Date(d).toLocaleDateString()

    onMounted(load)

    return { v, loading, statusLabel, formatDate }
  },
})
</script>
