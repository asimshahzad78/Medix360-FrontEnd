<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2>{{ isEdit ? 'Edit Payment Category' : 'Add Payment Category' }}</h2>

      <!-- ALERT -->
      <div v-if="alertState" class="alert-wrapper">
        <div :class="[
          'alert',
          alertState.type === 'success' ? 'alert-success' : 'alert-danger',
          'show',
        ]">
          <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
          {{ alertState.message }}
          <button class="btn-close" @click="alertState = null"></button>
        </div>
      </div>

      <form @submit.prevent="save">
        <div class="grid">
          <div>
            <label>Item Code *</label>
            <input v-model="form.paymentItemCode" />
          </div>

          <div>
            <label>Name *</label>
            <input v-model="form.name" />
          </div>

          <div>
            <label>Unit Price *</label>
            <input type="number" v-model="form.unitPrice" />
          </div>

          <div>
            <label>Revenue Account *</label>
            <select v-model="form.revenueAccountId">
              <option value="">Select</option>
              <option v-for="a in revenueAccounts" :key="a.id" :value="a.id">
                {{ a.name }}
              </option>
            </select>
          </div>

          <div class="full">
            <label>Description</label>
            <textarea v-model="form.description"></textarea>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary">Save</button>
          <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { paymentCategoryService } from './paymentCategory.service'

type AlertType = 'success' | 'error'

export default defineComponent({
  props: {
    categoryId: {
      type: Number,
      default: null,
    },
  },
  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const alertState = ref<{ type: AlertType; message: string } | null>(null)
    const revenueAccounts = ref<{ id: string; name: string }[]>([])

    const form = reactive({
      paymentItemCode: '',
      name: '',
      unitPrice: 0,
      description: '',
      revenueAccountId: '',
    })

    const isEdit = computed(() => !!props.categoryId)

    const load = async () => {
      revenueAccounts.value = await paymentCategoryService.getRevenueAccounts()

      if (!props.categoryId) return
      const c = await paymentCategoryService.getById(props.categoryId)

      form.paymentItemCode = c.PaymentItemCode
      form.name = c.Name
      form.unitPrice = c.UnitPrice
      form.description = c.Description ?? ''
      form.revenueAccountId = c.RevenueAccountId
    }

    onMounted(load)

    const save = async () => {
      try {
        if (isEdit.value) {
          await paymentCategoryService.update(props.categoryId!, form)
          alertState.value = { type: 'success', message: 'Category updated successfully.' }
        } else {
          await paymentCategoryService.create(form)
          alertState.value = { type: 'success', message: 'Category added successfully.' }
        }

        setTimeout(() => {
          emit('saved')
          emit('close')
        }, 1000)
      } catch {
        alertState.value = { type: 'error', message: 'Operation failed.' }
      }
    }

    return { form, save, isEdit, alertState, revenueAccounts }
  },
})
</script>

<style scoped>
/* identical modal styles as PatientFormModal (reuse if global) */
</style>
