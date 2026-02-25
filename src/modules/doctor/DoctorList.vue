<template>
  <div class="page-content">
    <h3>Doctors</h3>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Designation</th>
          <th>Fee</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="d in doctors" :key="d.id">
          <td>{{ d.doctorsID }}</td>
          <td>{{ d.firstName }} {{ d.lastName }}</td>
          <td>{{ d.designationDisplay }}</td>
          <td>{{ d.doctorFee }}</td>
          <td>
            <router-link :to="`/doctors/${d.id}`">View</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Doctor {
  id: number
  doctorsID: string
  firstName: string
  lastName: string
  designationDisplay: string
  doctorFee: number
}

const doctors = ref<Doctor[]>([])

onMounted(() => {
  // TODO: replace with API
  doctors.value = [
    {
      id: 1,
      doctorsID: 'D-001',
      firstName: 'John',
      lastName: 'Doe',
      designationDisplay: 'Cardiologist',
      doctorFee: 1500,
    },
  ]
})
</script>
