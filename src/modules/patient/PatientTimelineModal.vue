<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3>Patient Timeline</h3>
          <p>Clinical and registration activity for this patient</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')">Close</button>
      </div>

      <div v-if="loading" class="empty">Loading timeline...</div>

      <div v-else-if="events.length === 0" class="empty">No timeline activity found.</div>

      <ol v-else class="timeline">
        <li v-for="event in events" :key="event.id" class="timeline-item">
          <div class="marker" />
          <div class="event-card">
            <div class="event-top">
              <strong>{{ event.title }}</strong>
              <time>{{ formatDate(event.date) }}</time>
            </div>
            <p>{{ event.description }}</p>
            <dl>
              <div v-if="event.doctor">
                <dt>Doctor</dt>
                <dd>{{ event.doctor }}</dd>
              </div>
              <div v-if="event.visitId">
                <dt>Visit</dt>
                <dd>{{ event.visitId }}</dd>
              </div>
              <div v-if="event.diagnosis">
                <dt>Diagnosis</dt>
                <dd>{{ event.diagnosis }}</dd>
              </div>
            </dl>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { checkupService } from '@/modules/checkup/checkup.service'
import type { PatientCheckupHistoryDto } from '@/modules/checkup/checkup.service'

const props = defineProps<{
  patientId: number
}>()

defineEmits<{ (event: 'close'): void }>()

type TimelineEvent = {
  id: string
  date: string
  title: string
  description: string
  doctor?: string
  visitId?: string
  diagnosis?: string
}

const loading = ref(false)
const history = ref<PatientCheckupHistoryDto[]>([])

const events = computed<TimelineEvent[]>(() =>
  history.value.map((item) => ({
    id: `checkup-${item.id}`,
    date: item.checkupDate,
    title: 'OPD visit',
    description: item.symptoms || item.advice || 'Patient visit recorded.',
    doctor: item.doctorName,
    visitId: item.visitId,
    diagnosis: item.diagnosis,
  })),
)

const load = async () => {
  loading.value = true
  try {
    history.value = await checkupService.getPatientHistory(props.patientId)
  } finally {
    loading.value = false
  }
}

const formatDate = (value: string) => (value ? new Date(value).toLocaleString() : 'Not dated')

onMounted(load)
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}

.modal-card {
  width: 760px;
  max-width: 92vw;
  max-height: 88vh;
  overflow: auto;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 14px;
  margin-bottom: 16px;
}

h3 {
  margin: 0;
  color: #0f172a;
}

p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 13px;
}

.close-btn {
  align-self: flex-start;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

.empty {
  color: #64748b;
  padding: 24px;
  text-align: center;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 12px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 12px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 20px;
  bottom: -6px;
  width: 2px;
  background: #dcfce7;
}

.timeline-item:last-child::before {
  display: none;
}

.marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #16a34a;
  margin-top: 16px;
  z-index: 1;
}

.event-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.event-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #0f172a;
}

time {
  color: #64748b;
  font-size: 12px;
}

dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 12px 0 0;
}

dt {
  color: #64748b;
  font-size: 11px;
  text-transform: uppercase;
}

dd {
  margin: 2px 0 0;
  color: #1f2937;
  font-size: 13px;
}

@media (max-width: 640px) {
  dl {
    grid-template-columns: 1fr;
  }
}
</style>
