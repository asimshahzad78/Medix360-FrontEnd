<template>
  <div class="modal-backdrop">
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
            <select v-model="form.title">
              <option value="">Select</option>
              <option v-for="t in titleOptions" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label>First Name *</label>
            <input v-model="form.firstName" />
          </div>

          <div>
            <label>Last Name *</label>
            <input v-model="form.lastName" />
          </div>

          <div>
            <label>Phone *</label>
            <input v-model="form.phone" />
          </div>

          <div>
            <label>Age</label>
            <input type="number" v-model="form.age" />
          </div>

          <div>
            <label>Gender *</label>
            <select v-model="form.gender">
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label>Marital Status</label>
            <select v-model="form.maritalStatus">
              <option value="">Select</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
            </select>
          </div>
        </div>

        <!-- OTHER INFO -->
        <div v-if="tab === 'other'" class="grid">
          <div>
            <label>Email</label>
            <input v-model="form.email" />
          </div>

          <div v-if="!isEdit">
            <label>Password *</label>
            <input type="password" v-model="form.passwordHash" />
          </div>

          <div v-if="!isEdit">
            <label>Confirm Password *</label>
            <input type="password" v-model="form.confirmPassword" />
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
            <input type="number" v-model="form.registrationFee" />
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
          <button class="btn-primary">Save</button>
          <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { patientService } from './patient.service'

type AlertType = 'success' | 'error'

interface AlertState {
  type: AlertType
  message: string
}

const titleOptions = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Master", "Baby"]


export default defineComponent({
  props: {
    patientId: {
      type: Number,
      default: null,
    },
  },
  emits: ['saved', 'close'],

  setup(props, { emit }) {
    const tab = ref<'basic' | 'other'>('basic')
    const alertState = ref<AlertState | null>(null)

    const form = reactive({
      title: '',
      firstName: '',
      lastName: '',
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

    const isEdit = computed(() => !!props.patientId)

    const loadPatient = async () => {
      if (!props.patientId) return
      const p = await patientService.getById(props.patientId)

      form.title = p.Title?.replace('.', '') ?? ''
      form.firstName = p.FirstName ?? ''
      form.lastName = p.LastName ?? ''
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

    const save = async () => {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        alertState.value = {
          type: 'error',
          message: 'Operation failed. Please check data.',
        }
      }
    }

    return {
      tab,
      form,
      isEdit,
      save,
      alertState,
      titleOptions
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
  /* 👈 WIDTH INCREASED */
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

/* GRID — FIXED ALIGNMENT */
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px 24px;
  /* 👈 MORE HORIZONTAL GAP */
}

.grid>div {
  min-width: 0;
  /* 👈 VERY IMPORTANT FIX */
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
  /* 👈 ALIGNMENT FIX */
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

/* --- ALERT STYLES (Add this to your <style scoped>) --- */

.alert {
  position: relative;
  padding: 12px 16px;
  margin-bottom: 0;
  /* Wrapper handles margin */
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Keeps text left, button right */
}

/* Success State (Green) */
.alert-success {
  color: #0f5132;
  background-color: #d1e7dd;
  border-color: #badbcc;
}

/* Error State (Red) */
.alert-danger {
  color: #842029;
  background-color: #f8d7da;
  border-color: #f5c2c7;
}

/* Close Button Styling */
.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  color: inherit;
  /* Takes color from alert text */
  opacity: 0.5;
  cursor: pointer;
  padding: 0 0 0 10px;
}

.btn-close:hover {
  opacity: 1;
}

/* Creates the 'X' icon automatically */
.btn-close::before {
  content: '\00d7';
  /* Unicode for multiplication sign (X) */
}

/* Optional: Fade animation classes if you aren't using Bootstrap JS */
.fade {
  transition: opacity 0.15s linear;
}

.show {
  opacity: 1;
}
</style>
