<template>
  <div class="page-content">
    <h3>Doctor Detail</h3>

    <p><strong>ID:</strong> {{ doctorId }}</p>

    <p><strong>Name:</strong> {{ doctor.firstName }} {{ doctor.lastName }}</p>
    <p><strong>Designation:</strong> {{ doctor.designationDisplay }}</p>
    <p><strong>Fee:</strong> {{ doctor.doctorFee }}</p>

    <router-link to="/doctors">Back</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// ✅ USE the route param
const doctorId = Number(route.params.id)

const doctor = ref({
  firstName: '',
  lastName: '',
  designationDisplay: '',
  doctorFee: 0,
})

onMounted(() => {
  // TODO: API call
  // axios.get(`/api/doctors/${doctorId}`)
  console.log('Loading doctor with ID:', doctorId)
})
</script>
