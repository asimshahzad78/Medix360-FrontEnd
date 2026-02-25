<template>
  <div class="page-content">
    <h3>Appointments</h3>

    <table class="table">
      <tr v-for="a in appointments" :key="a.id">
        <td>{{ a.patientName }}</td>
        <td>{{ a.doctorName }}</td>
        <td>{{ a.appointmentDate }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Appointment {
  id: number
  patientName: string
  doctorName: string
  appointmentDate: string
}

const appointments = ref<Appointment[]>([
  {
    id: 1,
    patientName: 'Ali Khan',
    doctorName: 'Dr John',
    appointmentDate: '2026-01-10',
  },
])
</script>
