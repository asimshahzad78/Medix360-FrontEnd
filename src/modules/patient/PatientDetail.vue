<template>
  <div class="page-content">
    <h3>Patient Detail</h3>

    <p><strong>Name:</strong> {{ patient.firstName }} {{ patient.lastName }}</p>
    <p><strong>Phone:</strong> {{ patient.phone }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const patient = ref({
  firstName: 'Ali',
  lastName: 'Khan',
  phone: '0300-1234567',
})
</script>
