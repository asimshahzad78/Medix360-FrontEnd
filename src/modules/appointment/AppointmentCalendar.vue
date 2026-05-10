<template>
  <div class="calendar-page">
    <div class="calendar-tabs" role="tablist" aria-label="Appointment calendar sections">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        type="button"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loadError" class="load-error">{{ loadError }}</div>

    <div class="calendar-shell">
      <section class="month-panel">
        <div class="month-toolbar">
          <div>
            <h2>{{ monthTitle }}</h2>
            <p>Month view</p>
          </div>

          <div class="month-actions">
            <button type="button" @click="moveMonth(-1)">Prev</button>
            <button type="button" @click="goToday">Today</button>
            <button type="button" @click="moveMonth(1)">Next</button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">Loading calendar...</div>

        <div v-else-if="activeTab === 'appointments'" class="month-grid">
          <div v-for="day in weekDays" :key="day" class="week-head">{{ day }}</div>

          <button
            v-for="day in calendarDays"
            :key="day.key"
            :class="[
              'day-cell',
              {
                muted: !day.inCurrentMonth,
                today: isSameDate(day.date, today),
                selected: isSameDate(day.date, selectedDate),
              },
            ]"
            type="button"
            @click="selectDate(day.date)"
          >
            <span class="day-number">{{ day.date.getDate() }}</span>
            <span class="event-list">
              <span
                v-for="appointment in appointmentsByDate[dateKey(day.date)] ?? []"
                :key="appointment.id"
                class="event-pill"
                :title="eventTitle(appointment)"
              >
                {{ eventTitle(appointment) }}
              </span>
            </span>
          </button>
        </div>

        <div v-else class="empty-tab">
          <h3>{{ activeTabLabel }}</h3>
          <p>No records scheduled for this view.</p>
        </div>
      </section>

      <aside class="day-panel">
        <h2>{{ selectedDateTitle }}</h2>
        <p>{{ selectedAppointments.length }} appointment(s)</p>

        <div class="doctor-filter">
          <button
            :class="['doctor-chip', { active: selectedDoctorId === null }]"
            type="button"
            @click="selectedDoctorId = null"
          >
            All doctors
          </button>
          <button
            v-for="doctor in doctorsForSelectedDay"
            :key="doctor.id"
            :class="['doctor-chip', { active: selectedDoctorId === doctor.id }]"
            type="button"
            @click="selectedDoctorId = doctor.id"
          >
            <span></span>
            {{ doctor.name }}
          </button>
        </div>

        <div class="side-table-wrap">
          <table class="side-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="appointment in filteredSelectedAppointments" :key="appointment.id">
                <td>{{ appointment.appointmentTimeDisplay || formatTime(appointment.appointmentTime) }}</td>
                <td>{{ appointment.patientName || `Patient #${appointment.patientId}` }}</td>
                <td>{{ appointment.doctorName || `Doctor #${appointment.doctorId}` }}</td>
                <td></td>
              </tr>
              <tr v-if="filteredSelectedAppointments.length === 0">
                <td colspan="4" class="empty-row"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Today by Surgery</h3>
        <div class="side-table-wrap compact">
          <table class="side-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Surgery</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4" class="empty-row"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { appointmentService, type AppointmentListDto } from './appointment.service'
import { getApiErrorMessage } from '@/services/api-response'

type CalendarTab = 'appointments' | 'reminders' | 'clinic'

const tabs: { key: CalendarTab; label: string }[] = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'clinic', label: 'Clinic Activity' },
]

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const pad = (value: number) => String(value).padStart(2, '0')

const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDate = (value: string) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const isSameDate = (a: Date, b: Date) => dateKey(a) === dateKey(b)

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export default defineComponent({
  setup() {
    const today = startOfDay(new Date())
    const visibleMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
    const selectedDate = ref(today)
    const appointments = ref<AppointmentListDto[]>([])
    const activeTab = ref<CalendarTab>('appointments')
    const selectedDoctorId = ref<number | null>(null)
    const loading = ref(false)
    const loadError = ref('')

    const loadAppointments = async () => {
      loading.value = true
      loadError.value = ''
      try {
        appointments.value = await appointmentService.getAll()
      } catch (error: unknown) {
        appointments.value = []
        loadError.value = getApiErrorMessage(error, 'Could not load appointment calendar.')
      } finally {
        loading.value = false
      }
    }

    const monthTitle = computed(() =>
      visibleMonth.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    )

    const selectedDateTitle = computed(() =>
      selectedDate.value.toLocaleDateString(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    )

    const activeTabLabel = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label ?? '')

    const calendarDays = computed(() => {
      const first = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth(), 1)
      const start = new Date(first)
      start.setDate(first.getDate() - first.getDay())

      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start)
        date.setDate(start.getDate() + index)

        return {
          key: dateKey(date),
          date,
          inCurrentMonth: date.getMonth() === visibleMonth.value.getMonth(),
        }
      })
    })

    const appointmentsByDate = computed<Record<string, AppointmentListDto[]>>(() => {
      const groups: Record<string, AppointmentListDto[]> = {}
      appointments.value.forEach((appointment) => {
        const date = parseDate(appointment.appointmentDate || appointment.appointmentTime)
        if (!date) return

        const key = dateKey(date)
        groups[key] = groups[key] ?? []
        groups[key].push(appointment)
      })

      Object.values(groups).forEach((items) => {
        items.sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''))
      })

      return groups
    })

    const selectedAppointments = computed(
      () => appointmentsByDate.value[dateKey(selectedDate.value)] ?? [],
    )

    const filteredSelectedAppointments = computed(() => {
      if (selectedDoctorId.value === null) return selectedAppointments.value
      return selectedAppointments.value.filter((appointment) => appointment.doctorId === selectedDoctorId.value)
    })

    const doctorsForSelectedDay = computed(() => {
      const seen = new Map<number, string>()
      selectedAppointments.value.forEach((appointment) => {
        if (!appointment.doctorId) return
        seen.set(appointment.doctorId, appointment.doctorName || `Doctor #${appointment.doctorId}`)
      })

      return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
    })

    const eventTitle = (appointment: AppointmentListDto) => {
      const time = appointment.appointmentTimeDisplay || formatTime(appointment.appointmentTime)
      const patient = appointment.patientName || `Patient #${appointment.patientId}`
      const doctor = appointment.doctorName || `Doctor #${appointment.doctorId}`
      return `${time} ${patient} - ${doctor}`.trim()
    }

    const formatTime = (value: string) => {
      if (!value) return ''
      const date = value.includes('T') ? new Date(value) : new Date(`2000-01-01T${value}`)
      if (Number.isNaN(date.getTime())) return value
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const moveMonth = (delta: number) => {
      visibleMonth.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + delta, 1)
      selectedDate.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth(), 1)
      selectedDoctorId.value = null
    }

    const goToday = () => {
      visibleMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
      selectedDate.value = today
      selectedDoctorId.value = null
    }

    const selectDate = (date: Date) => {
      selectedDate.value = startOfDay(date)
      selectedDoctorId.value = null
      if (date.getMonth() !== visibleMonth.value.getMonth()) {
        visibleMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
      }
    }

    onMounted(loadAppointments)

    return {
      activeTab,
      activeTabLabel,
      appointmentsByDate,
      calendarDays,
      dateKey,
      doctorsForSelectedDay,
      eventTitle,
      filteredSelectedAppointments,
      formatTime,
      goToday,
      isSameDate,
      loadError,
      loading,
      monthTitle,
      moveMonth,
      selectDate,
      selectedAppointments,
      selectedDate,
      selectedDateTitle,
      selectedDoctorId,
      tabs,
      today,
      weekDays,
    }
  },
})
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  padding: 10px 20px 18px;
  background: #f3f6fb;
  color: #07142f;
}

.calendar-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}

.tab-btn {
  min-width: 94px;
  height: 34px;
  border: 1px solid #c8ced8;
  background: #e5e7eb;
  color: #000;
  font-size: 12px;
  cursor: pointer;
}

.tab-btn.active {
  background: #fff;
  border-bottom-color: #fff;
  font-weight: 700;
}

.calendar-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 396px;
  gap: 16px;
}

.month-panel,
.day-panel {
  border: 1px solid #dfe6f0;
  border-radius: 7px;
  background: #fff;
}

.month-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 12px;
  border-bottom: 1px solid #eef2f7;
}

.month-toolbar h2,
.day-panel h2,
.empty-tab h3 {
  margin: 0;
  color: #0f172a;
  font-size: 17px;
}

.month-toolbar p,
.day-panel p,
.empty-tab p {
  margin: 3px 0 0;
  color: #375179;
  font-size: 12px;
}

.month-actions {
  display: flex;
  gap: 8px;
}

.month-actions button {
  min-width: 66px;
  height: 28px;
  border: 1px solid #8a8a8a;
  background: #e5e5e5;
  color: #000;
  font-size: 11px;
  cursor: pointer;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  padding: 12px 0 0;
}

.week-head {
  padding: 9px 6px;
  background: #f8fafc;
  color: #263b5e;
  font-size: 11px;
  text-align: center;
}

.day-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 106px;
  border: 0;
  border-top: 1px solid #e7edf6;
  border-left: 1px solid #e7edf6;
  background: #fff;
  color: #000;
  padding: 8px;
  text-align: left;
  cursor: pointer;
}

.day-cell:nth-child(7n + 1) {
  border-left: 0;
}

.day-cell:hover {
  background: #f8fbff;
}

.day-cell.muted {
  color: #8a9ab4;
}

.day-cell.today,
.day-cell.selected {
  background: #eaf3ff;
}

.day-number {
  align-self: center;
  font-size: 11px;
  font-weight: 600;
}

.day-cell.selected .day-number {
  color: #1d4ed8;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
}

.event-pill {
  display: block;
  overflow: hidden;
  max-width: 100%;
  border-radius: 3px;
  padding: 3px 5px;
  background: #2563eb;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-panel {
  padding: 14px 12px;
}

.doctor-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 14px;
}

.doctor-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 25px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #1f3b64;
  padding: 4px 7px;
  font-size: 12px;
  cursor: pointer;
}

.doctor-chip.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}

.doctor-chip span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
}

.side-table-wrap {
  height: 386px;
  overflow: auto;
  border: 1px solid #d8e0eb;
  background: #fff;
}

.side-table-wrap.compact {
  height: 172px;
}

.side-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.side-table th,
.side-table td {
  height: 21px;
  border-right: 1px solid #d8e0eb;
  border-bottom: 1px solid #d8e0eb;
  padding: 3px 5px;
  overflow: hidden;
  color: #000;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.side-table th {
  background: #f3f4f6;
  text-align: left;
}

.empty-row {
  height: 360px;
}

.day-panel h3 {
  margin: 17px 0 8px;
  font-size: 16px;
}

.loading-state,
.empty-tab {
  min-height: 520px;
  padding: 24px;
}

.load-error {
  margin-bottom: 12px;
  border: 1px solid #fecdd3;
  border-radius: 7px;
  padding: 12px 14px;
  background: #fff1f2;
  color: #9f1239;
}

@media (max-width: 1100px) {
  .calendar-shell {
    grid-template-columns: 1fr;
  }

  .side-table-wrap,
  .side-table-wrap.compact {
    height: 240px;
  }
}

@media (max-width: 720px) {
  .calendar-page {
    padding: 10px;
  }

  .calendar-tabs {
    overflow-x: auto;
  }

  .month-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .month-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .day-cell {
    min-height: 76px;
    padding: 5px;
  }

  .event-pill {
    font-size: 9px;
  }
}
</style>
