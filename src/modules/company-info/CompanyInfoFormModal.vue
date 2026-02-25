<template>
  <div class="page-wrapper">
    <div class="page-card">
      <!-- <h2 class="page-title">Company Info</h2>
 -->
      <!-- ALERT -->
      <div v-if="alertState" class="alert-wrapper">
        <div :class="['alert', alertState.type === 'success' ? 'alert-success' : 'alert-danger']">
          <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
          {{ alertState.message }}
        </div>
      </div>

      <!-- FORM -->
      <form @submit.prevent="save">
        <div class="grid">
          <div class="field">
            <label>Company Name *</label>
            <input v-model="form.name" required />
          </div>

          <div class="field">
            <label>Application Title</label>
            <input v-model="form.applicationTitle" />
          </div>

          <div class="field">
            <label>Currency</label>
            <input v-model="form.currency" />
          </div>

          <div class="field">
            <label>Phone</label>
            <input v-model="form.phone" />
          </div>

          <div class="field">
            <label>Email</label>
            <input v-model="form.email" />
          </div>

          <div class="field">
            <label>Website</label>
            <input v-model="form.website" />
          </div>

          <div class="field">
            <label>City</label>
            <input v-model="form.city" />
          </div>

          <div class="field">
            <label>Country</label>
            <input v-model="form.country" />
          </div>

          <div class="field full">
            <label>Address</label>
            <textarea v-model="form.address"></textarea>
          </div>

          <div class="field">
            <label>Company Logo</label>
            <input type="file" @change="onFileChange" />
          </div>

          <div class="field">
            <label>Current Logo</label>
            <img v-if="logoPreview" :src="logoPreview" class="logo-preview" alt="Company Logo"
              @error="logoPreview = ''" />
            <span v-else class="no-logo">No logo uploaded</span>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { companyInfoService } from './company-info.service'
import type { AxiosError } from 'axios'

type AlertType = 'success' | 'error'
interface AlertState {
  type: AlertType
  message: string
}

export default defineComponent({
  setup() {
    const alertState = ref<AlertState | null>(null)
    const companyId = ref<number | null>(null)
    const isEdit = ref(false)

    const API_ORIGIN = import.meta.env.VITE_API_ORIGIN

    const logoPreview = ref('')

    const form = reactive({
      name: '',
      applicationTitle: '',
      currency: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      fax: '',
      website: '',
      companyLogo: null as File | null,
    })

    const load = async () => {
      try {
        const c = await companyInfoService.get()
        isEdit.value = true
        companyId.value = c.Id

        form.name = c.Name
        form.applicationTitle = c.ApplicationTitle
        form.currency = c.Currency
        form.address = c.Address
        form.city = c.City
        form.country = c.Country
        form.phone = c.Phone
        form.email = c.Email
        form.fax = c.Fax
        form.website = c.Website

        logoPreview.value = API_ORIGIN + c.CompanyLogoImagePath
      } catch {
        isEdit.value = false
        companyId.value = null
      }
    }

    onMounted(load)

    const onFileChange = (e: Event) => {
      const file = (e.target as HTMLInputElement)?.files?.[0]
      if (!file) return
      form.companyLogo = file
      logoPreview.value = URL.createObjectURL(file)
    }

    const save = async () => {
      try {
        if (isEdit.value && companyId.value) {
          await companyInfoService.update(companyId.value, form)
        } else {
          await companyInfoService.create(form)
        }

        alertState.value = {
          type: 'success',
          message: 'Company info saved successfully.',
        }

        setTimeout(() => (alertState.value = null), 1500)
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>
        alertState.value = {
          type: 'error',
          message:
            error.response?.data?.message ??
            (typeof error.response?.data === 'string'
              ? error.response?.data
              : 'Save failed. Please try again.'),
        }
      }
    }

    return {
      form,
      save,
      alertState,
      logoPreview,
      onFileChange,
    }
  },
})
</script>

<style scoped>
.page-wrapper {
  padding: 24px 32px;
  display: flex;
  justify-content: center;
  /* 👈 center horizontally */
}

.page-card {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 26px 32px 28px;
  max-width: 1100px;
}

.page-title {
  margin-bottom: 18px;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 32px;
  row-gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
}

.full {
  grid-column: span 2;
}

/* INPUTS */
input,
textarea {
  padding: 11px 12px;
  border-radius: 9px;
  border: 1px solid #d0d0d0;
}

textarea {
  min-height: 80px;
}

/* LOGO */
.logo-preview {
  max-height: 90px;
  margin-top: 6px;
  border: 1px solid #ddd;
  padding: 4px;
}

/* ACTIONS */
.actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #34c759, #28a745);
  color: #fff;
  padding: 10px 26px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
}

/* ALERT */
.alert-wrapper {
  margin-bottom: 16px;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
}

.alert-success {
  background: #d1e7dd;
  color: #0f5132;
}

.alert-danger {
  background: #f8d7da;
  color: #842029;
}
</style>
