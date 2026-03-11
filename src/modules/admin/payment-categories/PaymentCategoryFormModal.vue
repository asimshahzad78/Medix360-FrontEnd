<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <h2>{{ isEdit ? 'Edit Payment Category' : 'Add Payment Category' }}</h2>

      <!-- ALERT -->
      <div v-if="alertState" class="alert-wrapper">
        <div :class="[
          'alert',
          alertState.type === 'success' ? 'alert-success' : 'alert-danger',
        ]">
          <div class="alert-text">
            <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
            <span>{{ alertState.message }}</span>
          </div>
          <button class="btn-close" type="button" @click="alertState = null">✕</button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        Loading...
      </div>

      <form v-else @submit.prevent="save">
        <div class="grid">
          <div>
            <label>Item Code</label>
            <input v-model="form.paymentItemCode" placeholder="Leave empty for auto" />
          </div>

          <div>
            <label>Name *</label>
            <input v-model="form.name" />
          </div>

          <div>
            <label>Unit Price *</label>
            <input type="number" v-model.number="form.unitPrice" />
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

          <!-- ✅ Styled toggle -->
          <div class="full">
            <div class="toggle-row">
              <label class="switch">
                <input type="checkbox" v-model="form.includeInCounterClosing" />
                <span class="slider"></span>
              </label>
              <span class="toggle-text">Include in Counter Closing</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" type="submit">Save</button>
          <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { paymentCategoryService, type PaymentCategoryApiDto } from './paymentCategory.service'

type AlertType = 'success' | 'error'

type RevenueAccount = { id: string; name: string }

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
    const revenueAccounts = ref<RevenueAccount[]>([])
    const loading = ref(false)

    const form = reactive({
      paymentItemCode: '',
      name: '',
      unitPrice: 0,
      description: '',
      revenueAccountId: '',
      includeInCounterClosing: false,
    })

    const isEdit = computed(() => !!props.categoryId)

    const errorToMessage = (e: unknown): string => {
      if (axios.isAxiosError(e)) {
        const data = e.response?.data
        if (typeof data === 'string') return data
        if (data && typeof data === 'object' && 'message' in data) {
          const m = (data as { message?: unknown }).message
          if (typeof m === 'string') return m
        }
        return e.message || 'Operation failed.'
      }
      return e instanceof Error ? e.message : 'Operation failed.'
    }

    const load = async () => {
      loading.value = true
      alertState.value = null

      // 1) Revenue accounts (load separately, strongly typed)
      try {
        revenueAccounts.value = await paymentCategoryService.getRevenueAccounts()
      } catch (e: unknown) {
        alertState.value = {
          type: 'error',
          message: `Revenue accounts not loading: ${errorToMessage(e)}`,
        }
        revenueAccounts.value = []
      }

      // 2) Category (only in edit)
      if (props.categoryId) {
        try {
          const c: PaymentCategoryApiDto = await paymentCategoryService.getById(props.categoryId)

          form.paymentItemCode = c.PaymentItemCode ?? ''
          form.name = c.Name ?? ''
          form.unitPrice = c.UnitPrice ?? 0
          form.description = c.Description ?? ''
          form.revenueAccountId = c.RevenueAccountId ?? ''
          // backend might send undefined if old records; handle safely
          form.includeInCounterClosing = !!c.IncludeInCounterClosing
        } catch (e: unknown) {
          alertState.value = {
            type: 'error',
            message: `Category not loading: ${errorToMessage(e)}`,
          }
        }
      }

      loading.value = false
    }

    onMounted(load)

    const save = async () => {
      try {
        alertState.value = null

        if (!form.name.trim()) {
          alertState.value = { type: 'error', message: 'Name is required.' }
          return
        }
        if (!form.revenueAccountId) {
          alertState.value = { type: 'error', message: 'Revenue Account is required.' }
          return
        }

        const payload = {
          paymentItemCode: form.paymentItemCode,
          name: form.name,
          unitPrice: form.unitPrice,
          description: form.description,
          revenueAccountId: form.revenueAccountId,
          includeInCounterClosing: form.includeInCounterClosing, // ✅ correct
        }

        if (isEdit.value) {
          await paymentCategoryService.update(props.categoryId!, payload)
          alertState.value = { type: 'success', message: 'Category updated successfully.' }
        } else {
          await paymentCategoryService.create(payload)
          alertState.value = { type: 'success', message: 'Category added successfully.' }
        }

        setTimeout(() => {
          emit('saved')
          emit('close')
        }, 600)
      } catch (e: unknown) {
        alertState.value = { type: 'error', message: errorToMessage(e) }
      }
    }

    return { form, save, isEdit, alertState, revenueAccounts, loading }
  },
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 9999;
}

.modal-card {
  width: 100%;
  max-width: 860px;
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
}

.modal-card h2 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 800;
}

.loading {
  padding: 18px;
  color: #374151;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.full {
  grid-column: 1 / -1;
}

label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: #374151;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn-primary {
  background: #34c759;
  border: none;
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.btn-secondary {
  background: #efefef;
  border: none;
  color: #111827;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
}

/* ✅ Alert */
.alert-wrapper {
  margin: 10px 0 12px;
}

.alert {
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.alert-text {
  display: flex;
  gap: 10px;
  align-items: center;
}

.alert-success {
  background: rgba(52, 199, 89, 0.15);
}

.alert-danger {
  background: rgba(239, 68, 68, 0.12);
}

.btn-close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
}

/* ✅ Toggle switch */
.toggle-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 6px;
}

.toggle-text {
  font-size: 14px;
  color: #111827;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 999px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.switch input:checked+.slider {
  background-color: #34c759;
}

.switch input:checked+.slider:before {
  transform: translateX(20px);
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
