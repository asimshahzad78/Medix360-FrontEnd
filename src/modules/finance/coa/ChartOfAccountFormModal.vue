<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2>{{ isEdit ? 'Edit Account' : 'Add Account' }}</h2>

      <!-- ALERT -->
      <div v-if="alert" class="alert-wrapper">
        <div :class="['alert', alert.type === 'success' ? 'alert-success' : 'alert-danger']">
          <strong>{{ alert.type === 'success' ? 'Success!' : 'Error!' }}</strong>
          {{ alert.message }}
          <button class="btn-close" @click="alert = null"></button>
        </div>
      </div>

      <form @submit.prevent="save">
        <div class="grid">
          <!-- Parent Account -->
          <div>
            <label>Parent Account *</label>
            <Multiselect v-model="form.ParentId" :options="parentAccounts" value-prop="Id" label="Name" searchable
              placeholder="Search parent account...">
              <template #option="{ option }">
                <span> {{ option.Code }} — {{ option.Name }} </span>
              </template>
            </Multiselect>
          </div>

          <!-- Status -->
          <div>
            <label>Status</label>
            <select v-model="form.IsActive">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>

          <!-- Account Name -->
          <div>
            <label>Account Name *</label>
            <input v-model="form.Name" />
          </div>

          <!-- Account Type (Derived – UI only) -->
          <div>
            <label>Account Type</label>
            <input :value="derivedType" disabled />
          </div>
        </div>

        <!-- ACTIONS -->
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
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

import { coaService } from './coa.service'
import type {
  ChartOfAccountApiDto,
  ChartOfAccountCreateDto,
  ChartOfAccountUpdateDto,
} from './coa.types'

export default defineComponent({
  components: { Multiselect },

  props: {
    accountId: {
      type: String,
      default: null,
    },
  },

  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const alert = ref<{ type: 'success' | 'error'; message: string } | null>(null)

    const parentAccounts = ref<ChartOfAccountApiDto[]>([])

    const form = reactive({
      Name: '',
      ParentId: '',
      IsActive: true,
    })

    const accountTypeMap: Record<number, string> = {
      0: 'Asset',
      1: 'Liability',
      2: 'Equity',
      3: 'Expense',
      4: 'Income',
    }

    const isEdit = computed(() => !!props.accountId)

    // UI ONLY (never sent to backend)
    const derivedType = computed(() => {
      const parent = parentAccounts.value.find((x) => x.Id === form.ParentId)
      if (!parent) return ''

      return accountTypeMap[parent.Type]
    })
    const loadParents = async () => {
      const all = await coaService.getAll()
      parentAccounts.value = all.filter((a) => a.IsActive)
    }

    const loadEdit = async () => {
      if (!props.accountId) return
      const a = await coaService.getById(props.accountId)
      form.Name = a.Name
      form.ParentId = a.ParentId ?? ''
      form.IsActive = a.IsActive
    }

    const save = async () => {
      try {
        if (!form.Name || !form.ParentId) {
          alert.value = {
            type: 'error',
            message: 'Parent Account and Name are required.',
          }
          return
        }

        if (isEdit.value && props.accountId) {
          const payload: ChartOfAccountUpdateDto = {
            Name: form.Name,
            IsActive: form.IsActive,
          }
          await coaService.update(props.accountId, payload)
        } else {
          const payload: ChartOfAccountCreateDto = {
            Name: form.Name,
            ParentId: form.ParentId,
            IsActive: form.IsActive,
          }
          await coaService.create(payload)
        }

        alert.value = { type: 'success', message: 'Account saved successfully.' }

        setTimeout(() => {
          emit('saved')
          emit('close')
        }, 600)
      } catch {
        alert.value = { type: 'error', message: 'Operation failed.' }
      }
    }

    onMounted(async () => {
      await loadParents()
      await loadEdit()
    })

    return {
      form,
      parentAccounts,
      derivedType,
      isEdit,
      save,
      alert,
    }
  },
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
}

.modal-card {
  width: 900px;
  max-width: 92vw;
  background: #fff;
  border-radius: 14px;
  padding: 26px 34px 22px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  align-items: end;
}

label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  display: inline-block;
}

input,
select {
  width: 100%;
  height: 36px;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  box-sizing: border-box;
}

:deep(.multiselect) {
  min-height: 36px;
}

:deep(.multiselect__tags),
:deep(.multiselect__single) {
  min-height: 36px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  font-size: 13px;
}

:deep(.multiselect__input) {
  font-size: 13px;
}

.actions {
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #34c759, #28a745);
  color: #fff;
  padding: 8px 22px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: #f3f3f3;
  color: #333;
  padding: 8px 22px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 13px;
  cursor: pointer;
}

.alert-wrapper {
  margin: 12px 0 16px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
}

.alert-success {
  color: #0f5132;
  background: #d1e7dd;
}

.alert-danger {
  color: #842029;
  background: #f8d7da;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
}

.btn-close::before {
  content: '×';
}

label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 3px;
  /* 🔥 reduced */
  display: block;
}
</style>
