<template>
  <div class="page-content">
    <h3>Employee Detail</h3>

    <p><strong>Name:</strong> {{ employee.firstName }} {{ employee.lastName }}</p>
    <p><strong>Email:</strong> {{ employee.email }}</p>
    <p><strong>Phone:</strong> {{ employee.phoneNumber }}</p>
    <p><strong>User Type:</strong> {{ employee.userType }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const employee = ref({
  firstName: 'Asim',
  lastName: 'Shahzad',
  email: 'asim@example.com',
  phoneNumber: '0300-1234567',
  userType: 'Doctor',
})
</script>
