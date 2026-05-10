<template>
  <div class="appointment-page">
    <div class="page-header">
      <div class="action-bar">
        <button class="btn-add" type="button" @click="openAddModal">+ Add New</button>
        <RouterLink class="btn-calendar" to="/appointments/calendar">Calendar</RouterLink>
      </div>

      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search appointments" />
        <span class="icon">Search</span>
      </div>
    </div>

    <div v-if="loading" class="loader-overlay">
      <img src="/loader.gif" width="100" alt="Loading" />
    </div>

    <div v-else-if="loadError" class="load-error">
      {{ loadError }}
    </div>

    <div v-else class="card">
      <div class="table-wrap">
        <table class="appointment-table">
          <thead>
            <tr>
              <th class="text-left col-id">ID</th>
              <th class="text-left col-serial">Serial</th>
              <th class="text-left">Patient</th>
              <th class="text-left">Doctor</th>
              <th class="text-left col-type">Type</th>
              <th class="text-left">Date</th>
              <th class="text-left">Time</th>
              <th class="text-left col-note">Note</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="appointment in filteredAppointments" :key="appointment.id">
              <td class="col-id">{{ appointment.id }}</td>
              <td class="col-serial">{{ appointment.serialNo }}</td>
              <td>{{ appointment.patientName || `Patient #${appointment.patientId}` }}</td>
              <td>{{ appointment.doctorName || `Doctor #${appointment.doctorId}` }}</td>
              <td class="col-type">{{ formatPatientType(appointment.patientType) }}</td>
              <td>{{ formatDate(appointment.appointmentDate) }}</td>
              <td>{{ appointment.appointmentTimeDisplay || formatTime(appointment.appointmentTime) }}</td>
              <td class="ellipsis col-note">{{ appointment.note }}</td>
              <td class="actions">
                <button class="icon-btn" type="button" @click="openEditModal(appointment)">Edit</button>
              </td>
            </tr>

            <tr v-if="filteredAppointments.length === 0">
              <td colspan="9" class="no-records">No appointments found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AppointmentFormModal
      v-if="showForm"
      :appointment="selectedAppointment"
      :next-serial-no="nextSerialNo"
      @saved="reload"
      @close="closeForm"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import AppointmentFormModal from './AppointmentFormModal.vue'
import { appointmentService, type AppointmentListDto } from './appointment.service'
import { getApiErrorMessage } from '@/services/api-response'

export default defineComponent({
  components: {
    AppointmentFormModal,
  },
  setup() {
    const appointments = ref<AppointmentListDto[]>([])
    const selectedAppointment = ref<AppointmentListDto | null>(null)
    const search = ref('')
    const loading = ref(false)
    const loadError = ref('')
    const showForm = ref(false)

    const loadAppointments = async () => {
      loading.value = true
      loadError.value = ''
      try {
        appointments.value = await appointmentService.getAll()
      } catch (error: unknown) {
        appointments.value = []
        loadError.value = getApiErrorMessage(error, 'Could not load appointments.')
      } finally {
        loading.value = false
      }
    }

    const filteredAppointments = computed(() => {
      const term = search.value.trim().toLowerCase()
      if (!term) return appointments.value

      return appointments.value.filter((appointment) =>
        [
          appointment.id,
          appointment.serialNo,
          appointment.visitId,
          appointment.patientName,
          appointment.doctorName,
          appointment.note,
          appointment.appointmentDate,
          appointment.appointmentTimeDisplay,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term),
      )
    })

    const nextSerialNo = computed(() => {
      const maxSerial = appointments.value.reduce((max, item) => Math.max(max, item.serialNo || 0), 0)
      return maxSerial + 1
    })

    const openAddModal = () => {
      selectedAppointment.value = null
      showForm.value = true
    }

    const openEditModal = (appointment: AppointmentListDto) => {
      selectedAppointment.value = appointment
      showForm.value = true
    }

    const closeForm = () => {
      showForm.value = false
      selectedAppointment.value = null
    }

    const reload = async () => {
      closeForm()
      await loadAppointments()
    }

    const formatDate = (value: string) => {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleDateString()
    }

    const formatTime = (value: string) => {
      if (!value) return ''
      const date = value.includes('T') ? new Date(value) : new Date(`2000-01-01T${value}`)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatPatientType = (value: string) => {
      if (value === '1') return 'Out Patient'
      if (value === '2') return 'In Patient'
      return value || ''
    }

    onMounted(loadAppointments)

    return {
      closeForm,
      filteredAppointments,
      formatDate,
      formatPatientType,
      formatTime,
      loadError,
      loading,
      nextSerialNo,
      openAddModal,
      openEditModal,
      reload,
      search,
      selectedAppointment,
      showForm,
    }
  },
})
</script>

<style scoped>
.appointment-page {
  min-height: 100vh;
  padding: 24px;
  background: #f4f9f4;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  gap: 8px;
}

.btn-add,
.btn-calendar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: none;
  border-radius: 999px;
  padding: 9px 18px;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.btn-add {
  background: #34c759;
}

.btn-calendar {
  background: #166534;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.search-box input {
  width: 100%;
  height: 44px;
  box-sizing: border-box;
  border: 1px solid #d8e3d8;
  border-radius: 999px;
  padding: 0 58px 0 16px;
  background: #fff;
  font-size: 14px;
  outline: none;
}

.search-box input:focus {
  border-color: #34c759;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.15);
}

.search-box .icon {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 12px;
  pointer-events: none;
}

.card {
  padding: 10px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.appointment-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.appointment-table th,
.appointment-table td {
  padding: 14px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.appointment-table tbody tr:hover {
  background: #f7fbf7;
}

.text-left {
  text-align: left;
}

.ellipsis {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  border: 1px solid #dbe7db;
  border-radius: 6px;
  padding: 7px 9px;
  background: #fff;
  color: #166534;
  font-size: 12px;
  cursor: pointer;
}

.icon-btn:hover {
  background: rgba(52, 199, 89, 0.08);
}

.no-records {
  padding: 18px;
  color: #6b7280;
  text-align: center;
}

.loader-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.load-error {
  border: 1px solid #fecdd3;
  border-radius: 8px;
  padding: 14px 16px;
  background: #fff1f2;
  color: #9f1239;
}

@media (max-width: 640px) {
  .appointment-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .action-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .search-box {
    max-width: 100%;
  }

  .card {
    padding: 8px;
  }

  .col-id,
  .col-serial,
  .col-type,
  .col-note {
    display: none;
  }

  th.col-id,
  th.col-serial,
  th.col-type,
  th.col-note {
    display: none;
  }

  .appointment-table {
    min-width: 620px;
  }
}
</style>
