<template>
  <div class="detail-page">
    <RouterLink class="back-link" to="/patients">Back to patients</RouterLink>

    <div v-if="loading" class="card empty">Loading patient...</div>

    <div v-else-if="!patient" class="card empty">Patient not found.</div>

    <template v-else>
      <section class="hero">
        <div>
          <h2>{{ patient.Title }} {{ patient.FirstName }} {{ patient.LastName }}</h2>
          <p>{{ patient.Phone }} · {{ patient.Gender }} · {{ patient.AgeDisplay || patient.Age || 'Age not set' }}</p>
        </div>
        <button type="button" @click="showTimeline = true">Timeline</button>
      </section>

      <section class="info-grid">
        <div class="card">
          <span>Panel</span>
          <strong>{{ patient.Panel || 'Self' }}</strong>
        </div>
        <div class="card">
          <span>Email</span>
          <strong>{{ patient.Email || 'Not set' }}</strong>
        </div>
        <div class="card">
          <span>Blood Group</span>
          <strong>{{ patient.BloodGroup || 'Not set' }}</strong>
        </div>
        <div class="card">
          <span>Address</span>
          <strong>{{ patient.Address || 'Not set' }}</strong>
        </div>
      </section>

      <PatientTimelineModal
        v-if="showTimeline"
        :patientId="patient.Id"
        @close="showTimeline = false"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { patientService, type PatientApiDto } from './patient.service'
import PatientTimelineModal from './PatientTimelineModal.vue'

const route = useRoute()
const loading = ref(false)
const patient = ref<PatientApiDto | null>(null)
const showTimeline = ref(false)

const load = async () => {
  const id = Number(route.params.id)
  if (!Number.isFinite(id)) return

  loading.value = true
  try {
    patient.value = await patientService.getById(id)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.detail-page {
  padding: 24px;
  background: #f4f9f4;
  min-height: 100vh;
}

.back-link {
  display: inline-flex;
  color: #166534;
  text-decoration: none;
  margin-bottom: 14px;
  font-weight: 700;
}

.hero,
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

h2,
p {
  margin: 0;
}

h2 {
  color: #0f172a;
}

p {
  color: #64748b;
  margin-top: 4px;
}

.hero button {
  align-self: flex-start;
  border: none;
  border-radius: 6px;
  background: #166534;
  color: #fff;
  padding: 9px 14px;
  cursor: pointer;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.card {
  padding: 14px;
}

.card span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 4px;
}

.card strong {
  color: #0f172a;
  overflow-wrap: anywhere;
}

.empty {
  color: #64748b;
  text-align: center;
}

@media (max-width: 900px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .detail-page {
    padding: 14px;
  }

  .hero,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
  }
}
</style>
