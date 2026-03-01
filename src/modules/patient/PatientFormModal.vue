<template>
  <teleport to="body">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal-card">
        <h2>{{ isEdit ? 'Edit Patient' : 'Add Patient' }}</h2>

        <!-- ALERT WRAPPER -->
        <div v-if="alertState" class="alert-wrapper">
          <div :class="[
            'alert',
            alertState.type === 'success' ? 'alert-success' : 'alert-danger',
            'alert-dismissible',
            'fade',
            'show',
          ]">
            <strong>{{ alertState.type === 'success' ? 'Success!' : 'Error!' }}</strong>
            {{ alertState.message }}
            <button type="button" class="btn-close" @click="alertState = null"></button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button :class="{ active: tab === 'basic' }" @click="tab = 'basic'">Basic Info</button>
          <button :class="{ active: tab === 'other' }" @click="tab = 'other'">Other Info</button>
        </div>

        <form @submit.prevent="save">
          <!-- BASIC INFO -->
          <div v-if="tab === 'basic'" class="grid">
            <div>
              <label>Title *</label>
              <select v-model="form.title" @change="clearError('title')">
                <option value="">Select</option>
                <option v-for="t in titleOptions" :key="t" :value="t">{{ t }}</option>
              </select>
              <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
            </div>

            <div>
              <label>Full Name *</label>
              <input v-model="form.firstName" maxlength="50" @input="clearError('firstName')" />
              <p v-if="errors.firstName" class="field-error">{{ errors.firstName }}</p>
            </div>

            <div>
              <label>{{ ageLabel }}</label>
              <input type="number" v-model.number="form.age" min="0" />
            </div>

            <div>
              <label>Phone *</label>
              <input v-model="form.phone" maxlength="15" @input="clearError('phone')" />
              <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
            </div>

            <div>
              <label>Gender *</label>
              <select v-model="form.gender" @change="clearError('gender')">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <p v-if="errors.gender" class="field-error">{{ errors.gender }}</p>
            </div>

            <div>
              <label>Panel</label>
              <input v-model="form.panel" />
            </div>

          </div>

          <!-- OTHER INFO -->
          <div v-if="tab === 'other'" class="grid">
            <div>
              <label>Email</label>
              <input v-model="form.email" />
            </div>

            <!-- ✅ moved here -->
            <div>
              <label>Marital Status</label>
              <select v-model="form.maritalStatus">
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
              </select>
            </div>

            <div v-if="!isEdit">
              <label>Password *</label>
              <input type="password" v-model="form.passwordHash" @input="clearError('passwordHash')" />
              <p v-if="errors.passwordHash" class="field-error">{{ errors.passwordHash }}</p>
            </div>

            <div v-if="!isEdit">
              <label>Confirm Password *</label>
              <input type="password" v-model="form.confirmPassword" @input="clearError('confirmPassword')" />
              <p v-if="errors.confirmPassword" class="field-error">
                {{ errors.confirmPassword }}
              </p>
            </div>

            <div>
              <label>Date of Birth</label>
              <input type="date" v-model="form.dateOfBirth" />
            </div>

            <div>
              <label>Blood Group</label>
              <select v-model="form.bloodGroup">
                <option value="">Select</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div>
              <label>Father Name</label>
              <input v-model="form.fatherName" />
            </div>

            <div>
              <label>Mother Name</label>
              <input v-model="form.motherName" />
            </div>

            <div>
              <label>Registration Fee</label>
              <input type="number" v-model.number="form.registrationFee" />
            </div>

            <div>
              <label>Country</label>
              <input v-model="form.country" />
            </div>

            <div class="full">
              <label>Address</label>
              <textarea v-model="form.address"></textarea>
            </div>

            <div class="full">
              <label>Remarks</label>
              <textarea v-model="form.remarks"></textarea>
            </div>
          </div>

          <!-- ACTIONS -->
          <div class="actions">
            <button class="btn-primary" type="submit">Save</button>
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { patientService } from './patient.service'

type AlertType = 'success' | 'error'

interface AlertState {
  type: AlertType
  message: string
}

interface BackendErrorShape {
  message?: string
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
}

const titleOptions = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof', 'Master', 'Baby'] as const

export default defineComponent({
  props: {
    patientId: { type: Number, default: null },
  },
  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const tab = ref<'basic' | 'other'>('basic')
    const alertState = ref<AlertState | null>(null)

    const form = reactive({
      title: '',
      firstName: '',
      lastName: '',
      panel: '',
      phone: '',
      age: null as number | null,
      email: '',
      gender: '',
      maritalStatus: '',
      bloodGroup: '',
      fatherName: '',
      motherName: '',
      dateOfBirth: null as string | null,
      registrationFee: null as number | null,
      address: '',
      country: '',
      remarks: '',
      passwordHash: '',
      confirmPassword: '',
    })

    const errors = reactive({
      title: '',
      firstName: '',
      phone: '',
      gender: '',
      passwordHash: '',
      confirmPassword: '',
    })

    const isEdit = computed(() => !!props.patientId)
    const ageLabel = computed(() => (form.title === 'Baby' ? 'Age (Months)' : 'Age (Years)'))

    const clearError = (key: keyof typeof errors) => {
      errors[key] = ''
    }

    const loadPatient = async () => {
      if (!props.patientId) return
      const p = await patientService.getById(props.patientId)

      form.title = p.Title?.replace('.', '') ?? ''
      form.firstName = p.FirstName ?? ''
      form.panel = p.Panel ?? ''
      form.phone = p.Phone ?? ''
      form.age = p.Age ?? null
      form.email = p.Email ?? ''
      form.gender = p.Gender ?? ''
      form.maritalStatus = p.MaritalStatus ?? ''
      form.bloodGroup = p.BloodGroup ?? ''
      form.fatherName = p.FatherName ?? ''
      form.motherName = p.MotherName ?? ''
      form.dateOfBirth = p.DateOfBirth ?? null
      form.registrationFee = p.RegistrationFee ?? null
      form.address = p.Address ?? ''
      form.country = p.Country ?? ''
      form.remarks = p.Remarks ?? ''
    }

    onMounted(loadPatient)

    const validate = (): boolean => {
      // reset
      errors.title = ''
      errors.firstName = ''
      errors.phone = ''
      errors.gender = ''
      errors.passwordHash = ''
      errors.confirmPassword = ''

      let ok = true

      // ✅ required client-side
      if (!form.title) {
        errors.title = 'Title is required.'
        ok = false
      }
      if (!form.firstName.trim()) {
        errors.firstName = 'First Name is required.'
        ok = false
      }
      if (!form.phone.trim()) {
        errors.phone = 'Phone is required.'
        ok = false
      }
      if (!form.gender) {
        errors.gender = 'Gender is required.'
        ok = false
      }

      // password rules only on create
      /* if (!isEdit.value) {
        if (!form.passwordHash) {
          errors.passwordHash = 'Password is required.'
          ok = false
        }
        if (!form.confirmPassword) {
          errors.confirmPassword = 'Confirm Password is required.'
          ok = false
        }
        if (form.passwordHash && form.confirmPassword && form.passwordHash !== form.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match.'
          ok = false
        }
    }*/

      // jump to correct tab
      if (errors.passwordHash || errors.confirmPassword) tab.value = 'other'
      else if (!ok) tab.value = 'basic'

      return ok
    }

    const getErrorMessage = (e: unknown): string => {
      const err = e as BackendErrorShape
      return (
        err.response?.data?.message ??
        err.response?.data?.error ??
        err.message ??
        'Operation failed. Please check data.'
      )
    }

    const save = async (): Promise<void> => {
      if (!validate()) {
        alertState.value = { type: 'error', message: 'Please fix the highlighted fields.' }
        return
      }

      try {
        if (isEdit.value) {
          await patientService.update(props.patientId!, form)
          alertState.value = { type: 'success', message: 'Patient updated successfully.' }
        } else {
          await patientService.create(form)
          alertState.value = { type: 'success', message: 'Patient added successfully.' }
        }

        setTimeout(() => {
          emit('saved')
          emit('close')
        }, 1200)
      } catch (e: unknown) {
        alertState.value = { type: 'error', message: getErrorMessage(e) }
      }
    }

    return {
      tab,
      alertState,
      form,
      errors,
      clearError,
      isEdit,
      save,
      titleOptions,
      ageLabel,
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

/* MODAL */
.modal-card {
  width: 900px;
  max-width: 92vw;
  max-height: 85vh;
  background: #fff;
  border-radius: 14px;
  padding: 22px 26px 18px;
  display: flex;
  flex-direction: column;
}

/* TABS */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tabs button {
  padding: 6px 18px;
  border-radius: 18px;
  border: none;
  background: #f0f0f0;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.tabs .active {
  background: #34c759;
  color: #fff;
}

/* FORM SCROLL */
form {
  overflow-y: auto;
  padding-right: 6px;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px 24px;
}

.grid>div {
  min-width: 0;
}

.grid .full {
  grid-column: span 2;
}

/* LABELS */
label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  display: inline-block;
}

/* INPUTS */
input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  min-height: 40px;
  border-radius: 8px;
  border: 1px solid #d0d0d0;
  font-size: 13px;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #34c759;
  outline: none;
}

/* TEXTAREA */
textarea {
  min-height: 70px;
  resize: vertical;
}

/* ACTION BAR */
.actions {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding-top: 14px;
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

/* BUTTONS */
.btn-primary {
  background: linear-gradient(135deg, #34c759, #28a745);
  color: #fff;
  padding: 8px 22px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(52, 199, 89, 0.25);
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

/* ALERT */
.alert {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-success {
  color: #0f5132;
  background-color: #d1e7dd;
  border-color: #badbcc;
}

.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: inherit;
  opacity: 0.5;
  cursor: pointer;
  padding: 0 0 0 10px;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close::before {
  content: '\00d7';
}

.fade {
  transition: opacity 0.15s linear;
}

.show {
  opacity: 1;
}

.field-error {
  margin-top: 6px;
  font-size: 12px;
  color: #b42318;
}
</style>
