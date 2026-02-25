<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted, watch } from 'vue'
import {
  employeeService,
  type ManageRoleDto,
  type EmployeeApiDto,
  type CreateUserForEmployeeResult,
} from './employee.service'
import { systemContext } from '@/services/systemContext'

type TabKey = 'basic' | 'job' | 'user' | 'doctor'
type AlertType = 'success' | 'error'

interface AlertState {
  type: AlertType
  message: string
}

interface LookupItem {
  id: number
  name: string
}

interface PaymentAccount {
  id: string
  name: string
  code: string
}

interface EmployeeFormState {
  employeeId: string | null
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  dateOfBirth: string | null
  joiningDate: string | null
  leavingDate: string | null
  department: number | null
  subDepartment: number | null
  designation: number | null
  address: string
  country: string
  userType: number
  roleId: number
  applicationUserId: string | null
  hasUser: boolean
}

interface UserCreateState {
  manageRoleId: number
  password: string
  confirmPassword: string
}

interface DoctorFormState {
  doctorsID: string
  designationId: number | null
  doctorFee: number | null
  sharePercentage: number | null
  doctorPayableAccountId: string
}

export default defineComponent({
  name: 'EmployeeFormModal',
  props: {
    employeeId: {
      type: Number,
      default: null,
    },
  },
  emits: ['saved', 'close'],
  setup(props, { emit }) {
    const tab = ref<TabKey>('basic')
    const alertState = ref<AlertState | null>(null)

    const roleOptions = ref<ManageRoleDto[]>([])
    const payableAccounts = ref<PaymentAccount[]>([])

    // ✅ lookups
    const departments = ref<LookupItem[]>([])
    const designations = ref<LookupItem[]>([])
    const subDepartments = ref<LookupItem[]>([])

    const createdEmployeeId = ref<number | null>(null)
    const createLogin = ref<boolean>(false)

    // ✅ prevent double save
    const isSaving = ref(false)

    const form = reactive<EmployeeFormState>({
      employeeId: null,
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      dateOfBirth: null,
      joiningDate: null,
      leavingDate: null,
      department: null,
      subDepartment: null,
      designation: null,
      address: '',
      country: '',
      userType: 2,
      roleId: 0,
      applicationUserId: null,
      hasUser: false,
    })

    const userForm = reactive<UserCreateState>({
      manageRoleId: 0,
      password: '',
      confirmPassword: '',
    })

    const doctorForm = reactive<DoctorFormState>({
      doctorsID: '',
      designationId: null,
      doctorFee: null,
      sharePercentage: null,
      doctorPayableAccountId: '',
    })

    const isEdit = computed<boolean>(() => typeof props.employeeId === 'number' && props.employeeId > 0)
    const isDoctor = computed<boolean>(() => Number(form.userType) === 1)
    const hasUserAlready = computed<boolean>(() => !!form.applicationUserId)

    const loadRoles = async (): Promise<void> => {
      roleOptions.value = await employeeService.getManageRoles()
    }

    const loadLookups = async (): Promise<void> => {
      // ✅ these methods must exist in employee.service.ts
      departments.value = await employeeService.getDepartments()
      designations.value = await employeeService.getDesignations()

      if (form.department) {
        subDepartments.value = await employeeService.getSubDepartments(form.department)
      }
    }

    const loadPaymentAccounts = async (): Promise<void> => {
      // ✅ if you don't have these yet, just keep dropdown empty
      if (!systemContext.tenantId || !systemContext.propertyId) {
        payableAccounts.value = []
        return
      }

      const list = await employeeService.getPaymentAccounts(systemContext.tenantId, systemContext.propertyId)
      payableAccounts.value = list.map((x) => ({ id: x.id, name: x.name, code: x.code }))
    }

    const loadEmployee = async (): Promise<void> => {
      if (!isEdit.value || !props.employeeId) return

      const e: EmployeeApiDto = await employeeService.getById(props.employeeId)

      form.employeeId = (e.EmployeeId ?? null) as string | null
      form.firstName = e.FirstName ?? ''
      form.lastName = e.LastName ?? ''
      form.phoneNumber = e.PhoneNumber ?? ''
      form.email = e.Email ?? ''
      form.dateOfBirth = (e.DateOfBirth ?? null) as string | null
      form.joiningDate = (e.JoiningDate ?? null) as string | null
      form.leavingDate = (e.LeavingDate ?? null) as string | null
      form.department = typeof e.Department === 'number' ? e.Department : null
      form.subDepartment = typeof e.SubDepartment === 'number' ? e.SubDepartment : null
      form.designation = typeof e.Designation === 'number' ? e.Designation : null
      form.address = e.Address ?? ''
      form.country = e.Country ?? ''
      form.userType = e.UserType ?? 0
      form.roleId = (e.RoleId ?? 0) as number
      form.applicationUserId = (e.ApplicationUserId ?? null) as string | null
      form.hasUser = !!form.applicationUserId

      if (form.hasUser) createLogin.value = false

      if (form.department) {
        subDepartments.value = await employeeService.getSubDepartments(form.department)
      }
    }

    const validate = (): string | null => {
      if (!form.firstName.trim()) return 'First name is required'
      if (!form.lastName.trim()) return 'Last name is required'
      if (!form.userType) return 'User Type is required'

      if (createLogin.value && !hasUserAlready.value) {
        if (!form.email.trim()) return 'Email is required to create login'
        if (!userForm.manageRoleId) return 'Role is required'
        if (!userForm.password || userForm.password.length < 3) return 'Password is required (min 3)'
        if (userForm.password !== userForm.confirmPassword) return 'Password mismatch'
      }

      return null
    }

    const save = async (): Promise<void> => {
      if (isSaving.value) return
      isSaving.value = true
      alertState.value = null

      try {
        const err = validate()
        if (err) {
          alertState.value = { type: 'error', message: err }
          return
        }

        // 1) Save employee
        if (isEdit.value && props.employeeId) {
          await employeeService.update(props.employeeId, {
            employeeId: form.employeeId,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            dateOfBirth: form.dateOfBirth,
            joiningDate: form.joiningDate,
            leavingDate: form.leavingDate,
            department: form.department,
            subDepartment: form.subDepartment,
            designation: form.designation,
            address: form.address,
            country: form.country,
            userType: Number(form.userType),
            roleId: form.roleId || 0,
          })
          await loadEmployee()
        } else {
          // ✅ IMPORTANT: your create() MUST return { userProfileId }
          const res = await employeeService.create({
            employeeId: form.employeeId,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phoneNumber: form.phoneNumber,
            dateOfBirth: form.dateOfBirth,
            joiningDate: form.joiningDate,
            leavingDate: form.leavingDate,
            department: form.department,
            subDepartment: form.subDepartment,
            designation: form.designation,
            address: form.address,
            country: form.country,
            userType: Number(form.userType),
            roleId: form.roleId || 0,
          })

          createdEmployeeId.value = res.userProfileId
        }

        const userProfileId = isEdit.value ? (props.employeeId as number) : createdEmployeeId.value
        if (!userProfileId) {
          alertState.value = { type: 'error', message: 'Employee saved but UserProfileId not found.' }
          return
        }

        // 2) Create login user (optional)
        let applicationUserId: string | null = form.applicationUserId

        if (createLogin.value && !hasUserAlready.value) {
          const result: CreateUserForEmployeeResult = await employeeService.createUser(userProfileId, {
            manageRoleId: userForm.manageRoleId,
            userType: Number(form.userType),
            email: form.email,
            phoneNumber: form.phoneNumber,
            password: userForm.password,
            confirmPassword: userForm.confirmPassword,
          })

          applicationUserId = result.applicationUserId
          form.applicationUserId = applicationUserId
          form.hasUser = true
        }

        // 3) Save doctor info
        if (isDoctor.value && applicationUserId) {
          await employeeService.createDoctorInfo({
            applicationUserId,
            designationId: doctorForm.designationId ?? (form.designation ?? 0),
            doctorsID: doctorForm.doctorsID || null,
            doctorFee: doctorForm.doctorFee,
            doctorPayableAccountId: doctorForm.doctorPayableAccountId || null,
            sharePercentage: doctorForm.sharePercentage ?? 0,
          })
        }

        // 4) Upsert HR Profile
        const hrDto = {
          userProfileId,
          employeeId: form.employeeId,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber || null,
          email: form.email || null,
          dateOfBirth: form.dateOfBirth,
          joiningDate: form.joiningDate,
          leavingDate: form.leavingDate,
          department: form.department,
          subDepartment: form.subDepartment,
          designation: form.designation,
          address: form.address || null,
          country: form.country || null,
          userType: Number(form.userType),
          roleId: form.roleId || null,
          applicationUserId: form.applicationUserId || null,
        }

        await employeeService.upsertHrProfile(userProfileId, hrDto)

        alertState.value = { type: 'success', message: isEdit.value ? 'Employee updated.' : 'Employee created.' }

        setTimeout(() => {
          emit('saved')
          emit('close')
        }, 700)
      } catch (err: unknown) {
        console.error(err)
        alertState.value = { type: 'error', message: 'Operation failed. Please check data.' }
      } finally {
        isSaving.value = false
      }
    }

    onMounted(async () => {
      await loadRoles()
      await loadLookups()
      await loadEmployee()
      await loadPaymentAccounts()
    })

    watch(
      () => form.department,
      async (dep) => {
        if (!dep) {
          subDepartments.value = []
          form.subDepartment = null
          return
        }
        subDepartments.value = await employeeService.getSubDepartments(dep)
        if (form.subDepartment && !subDepartments.value.some((x) => x.id === form.subDepartment)) {
          form.subDepartment = null
        }
      },
    )

    watch(
      () => form.userType,
      () => {
        if (!isDoctor.value && tab.value === 'doctor') tab.value = 'basic'
      },
    )

    return {
      tab,
      alertState,
      roleOptions,
      payableAccounts,
      departments,
      subDepartments,
      designations,
      form,
      userForm,
      doctorForm,
      isEdit,
      isDoctor,
      createLogin,
      hasUserAlready,
      isSaving,
      save,
    }
  },
})
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card" role="dialog" aria-modal="true" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h2 class="modal-title">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h2>
          <div class="modal-subtitle">Basic info, job info, login & optional doctor finance.</div>
        </div>

        <button type="button" class="icon-btn" @click="$emit('close')" aria-label="Close">×</button>
      </div>

      <!-- Tabs -->
      <div class="tabs-wrap">
        <div class="tabs">
          <button type="button" class="tab" :class="{ active: tab === 'basic' }" @click="tab = 'basic'">Basic
            Info</button>
          <button type="button" class="tab" :class="{ active: tab === 'job' }" @click="tab = 'job'">Job Info</button>
          <button type="button" class="tab" :class="{ active: tab === 'user' }" @click="tab = 'user'">User
            Login</button>
          <button v-if="isDoctor" type="button" class="tab" :class="{ active: tab === 'doctor' }"
            @click="tab = 'doctor'">
            Doctor Info
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- ALERT -->
        <div v-if="alertState" class="alert-wrapper">
          <div :class="['alert', alertState.type === 'success' ? 'alert-success' : 'alert-danger']">
            <div class="alert-text">
              <b>{{ alertState.type === 'success' ? 'Success' : 'Error' }}:</b> {{ alertState.message }}
            </div>
            <button type="button" class="btn-close" @click="alertState = null"></button>
          </div>
        </div>

        <form class="form" @submit.prevent="save">
          <!-- BASIC INFO -->
          <section v-if="tab === 'basic'" class="grid">
            <div class="field">
              <label>First Name *</label>
              <input v-model="form.firstName" />
            </div>

            <div class="field">
              <label>Last Name *</label>
              <input v-model="form.lastName" />
            </div>

            <div class="field">
              <label>Phone</label>
              <input v-model="form.phoneNumber" />
            </div>

            <div class="field">
              <label>Email</label>
              <input v-model="form.email" />
            </div>

            <div class="field">
              <label>Date of Birth</label>
              <input type="date" v-model="form.dateOfBirth" />
            </div>

            <div class="field">
              <label>Country</label>
              <input v-model="form.country" />
            </div>

            <div class="field full">
              <label>Address</label>
              <textarea v-model="form.address"></textarea>
            </div>
          </section>

          <!-- JOB INFO -->
          <section v-if="tab === 'job'" class="grid">
            <div class="field">
              <label>Employee ID</label>
              <input v-model="form.employeeId" placeholder="EMP-000001 (optional)" />
            </div>

            <div class="field">
              <label>User Type *</label>
              <select v-model.number="form.userType">
                <option :value="1">Doctor</option>
                <option :value="2">Nurse</option>
                <option :value="3">Laboratory</option>
                <option :value="4">Pharmacist</option>
                <option :value="5">Accountant</option>
                <option :value="6">Admin</option>
              </select>
            </div>

            <div class="field">
              <label>Department</label>
              <select v-model.number="form.department">
                <option :value="null">Select</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Sub Department</label>
              <select v-model.number="form.subDepartment" :disabled="!form.department">
                <option :value="null">Select</option>
                <option v-for="s in subDepartments" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Designation</label>
              <select v-model.number="form.designation">
                <option :value="null">Select</option>
                <option v-for="d in designations" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Joining Date</label>
              <input type="date" v-model="form.joiningDate" />
            </div>

            <div class="field">
              <label>Leaving Date</label>
              <input type="date" v-model="form.leavingDate" />
            </div>

            <div class="field">
              <label>Role Bundle (optional)</label>
              <select v-model.number="form.roleId">
                <option :value="0">Select</option>
                <option v-for="r in roleOptions" :key="r.Id" :value="r.Id">
                  {{ r.Name }}
                </option>
              </select>
            </div>
          </section>

          <!-- USER LOGIN -->
          <section v-if="tab === 'user'" class="grid">
            <div class="field full">
              <label class="checkbox">
                <input type="checkbox" v-model="createLogin" :disabled="hasUserAlready" />
                Create login user for this employee
                <span v-if="hasUserAlready" class="hint">(already has user)</span>
              </label>
            </div>

            <template v-if="createLogin && !hasUserAlready">
              <div class="field">
                <label>Role *</label>
                <select v-model.number="userForm.manageRoleId">
                  <option :value="0">Select</option>
                  <option v-for="r in roleOptions" :key="r.Id" :value="r.Id">
                    {{ r.Name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Password *</label>
                <input type="password" v-model="userForm.password" />
              </div>

              <div class="field">
                <label>Confirm Password *</label>
                <input type="password" v-model="userForm.confirmPassword" />
              </div>

              <div class="field full note">
                Login will use employee email. If empty, please fill Email in Basic Info.
              </div>
            </template>
          </section>

          <!-- DOCTOR INFO -->
          <section v-if="tab === 'doctor' && isDoctor" class="grid">
            <div class="field full note" v-if="!createLogin && !hasUserAlready">
              Doctor finance fields are saved in <b>DoctorsInfo</b> table which links via <b>ApplicationUserId</b>.
              Enable <b>Create login</b> first (or employee must already have a user).
            </div>

            <div class="field">
              <label>Doctors ID</label>
              <input v-model="doctorForm.doctorsID" />
            </div>

            <div class="field">
              <label>Designation</label>
              <select v-model.number="doctorForm.designationId">
                <option :value="null">Select</option>
                <option v-for="d in designations" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Doctor Fee</label>
              <input type="number" v-model.number="doctorForm.doctorFee" />
            </div>

            <div class="field">
              <label>Share Percentage</label>
              <input type="number" v-model.number="doctorForm.sharePercentage" />
            </div>

            <div class="field full">
              <label>Doctor Payable Account</label>
              <select v-model="doctorForm.doctorPayableAccountId">
                <option value="">Select</option>
                <option v-for="a in payableAccounts" :key="a.id" :value="a.id">
                  {{ a.code }} - {{ a.name }}
                </option>
              </select>
            </div>
          </section>
        </form>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" class="btn-secondary" @click="$emit('close')" :disabled="isSaving">Cancel</button>
        <button type="button" class="btn-primary" @click="save" :disabled="isSaving">
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 34px 16px;
  overflow: auto;
}

.modal-card {
  width: 1020px;
  max-width: 95vw;
  max-height: 92vh;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 18px 22px 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid #eef2f7;
}

.modal-title {
  margin: 0;
  font-size: 28px;
  font-weight: 950;
  letter-spacing: -0.4px;
}

.modal-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.icon-btn {
  height: 38px;
  width: 38px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.tabs-wrap {
  padding: 10px 22px 14px;
  border-bottom: 1px solid #eef2f7;
  background: linear-gradient(180deg, #fff, #fbfbfc);
}

.tabs {
  display: inline-flex;
  gap: 10px;
  padding: 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
}

.tab {
  border: 0;
  background: transparent;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  color: #111827;
}

.tab.active {
  background: #22c55e;
  color: #fff;
  box-shadow: 0 8px 18px rgba(34, 197, 94, 0.25);
}

.modal-body {
  padding: 14px 22px 18px;
  overflow: auto;
}

.form {
  margin-top: 6px;
}

/* ✅ real spacing between boxes */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 18px;
  /* horizontal gap */
  row-gap: 18px;
  /* vertical gap */
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* label -> input spacing */
}

.full {
  grid-column: 1 / -1;
}

label {
  font-size: 12px;
  font-weight: 900;
  color: #111827;
}

input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  height: 46px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 0 14px;
  outline: none;
  font-weight: 800;
  font-size: 13px;
  background: #fff;
  transition: box-shadow 0.15s, border-color 0.15s;
}

textarea {
  height: 110px;
  padding: 12px 14px;
  resize: none;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.16);
}

.checkbox {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-weight: 900;
  font-size: 13px;
}

.checkbox input {
  height: 18px;
  width: 18px;
  border-radius: 6px;
  padding: 0;
}

.hint {
  margin-left: 8px;
  font-weight: 800;
  color: #6b7280;
  font-size: 12px;
}

.note {
  border: 1px solid #bbf7d0;
  background: #ecfdf5;
  color: #065f46;
  font-weight: 800;
  padding: 12px 12px;
  border-radius: 14px;
}

.hint-block {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
}

.modal-footer {
  padding: 14px 22px;
  border-top: 1px solid #eef2f7;
  background: #fff;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 14px;
  background: #22c55e;
  color: #fff;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(34, 197, 94, 0.22);
}

.btn-secondary {
  height: 42px;
  padding: 0 18px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  background: #fff;
  font-weight: 950;
  cursor: pointer;
}

.alert-wrapper {
  margin-bottom: 12px;
}

.alert {
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.alert-text {
  font-weight: 800;
}

.alert-success {
  background: #d1e7dd;
  border-color: #badbcc;
  color: #0f5132;
}

.alert-danger {
  background: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.65;
}

.btn-close:hover {
  opacity: 1;
}

.btn-close::before {
  content: '\00d7';
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
