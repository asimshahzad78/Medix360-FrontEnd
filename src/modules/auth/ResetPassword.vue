<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Reset Password</h2>
        <p>Set your new password</p>
      </div>

      <div class="auth-body">
        <form @submit.prevent="submit">
          <div class="field">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>

          <div class="field">
            <label>Old Password</label>
            <input v-model="form.oldPassword" type="password" required />
          </div>

          <div class="field">
            <label>New Password</label>
            <input v-model="form.newPassword" type="password" required />
          </div>

          <div class="field">
            <label>Confirm Password</label>
            <input v-model="form.confirmPassword" type="password" required />
          </div>

          <button class="btn-primary" type="submit">Reset Password</button>
        </form>
      </div>
    </div>

    <footer class="auth-footer">
      © {{ new Date().getFullYear() }} JSK Clinics · Crafted with ❤️
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { authService } from '@/modules/auth/auth.service'

const form = reactive({
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const submit = async () => {
  await authService.resetPassword(form)
  alert('Password reset successful')
}
</script>

<style scoped>
/* SAME STYLE AS FORGOT PASSWORD – KEEP CONSISTENT */
.auth-wrapper {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.auth-header {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  padding: 28px;
}

.auth-body {
  padding: 28px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

.field label {
  font-size: 13px;
  margin-bottom: 6px;
}

.field input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #16a34a;
  color: white;
  border-radius: 10px;
  border: none;
  font-weight: 600;
}

.btn-primary:hover {
  background: #15803d;
}

.auth-footer {
  margin-top: 24px;
  font-size: 13px;
  color: #6b7280;
}
</style>
