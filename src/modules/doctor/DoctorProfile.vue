<template>
  <div class="page-content">
    <h3>Doctor Profile</h3>

    <form>
      <input v-model="doctor.firstName" placeholder="First Name" />
      <input v-model="doctor.lastName" placeholder="Last Name" />
      <input v-model="doctor.doctorFee" type="number" placeholder="Fee" />
      <button type="button">Save</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const doctor = reactive({
  firstName: '',
  lastName: '',
  doctorFee: 0,
})
</script>
