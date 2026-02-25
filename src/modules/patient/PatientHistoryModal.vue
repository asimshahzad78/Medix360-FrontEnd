<template>
  <div class="modal-backdrop">
    <div class="modal-card large">
      <h3>Checkup History</h3>

      <table v-if="history.length">
        <thead>
          <tr>
            <th>Date</th>
            <th>Doctor</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="c in history" :key="c.id">
            <td>{{ c.checkupDate }}</td>
            <td>{{ c.doctorName }}</td>
            <td>-</td>
            <td>
              <button @click="print(c.id)">Print</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>No history found</p>

      <div class="actions">
        <button @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { checkupService, type PatientCheckupHistoryDto } from '../checkup/checkup.service'

export default defineComponent({
  props: {
    patientId: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const history = ref<PatientCheckupHistoryDto[]>([])

    onMounted(async () => {
      history.value = await checkupService.getPatientHistory(props.patientId)
    })

    const print = (id: number) => {
      window.open(`/checkup/print/${id}`, '_blank')
    }

    return { history, print }
  },
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(0, 0, 0, 0.45);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 99999;
}

.modal-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  min-width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card.large {
  width: 700px;
}
</style>
