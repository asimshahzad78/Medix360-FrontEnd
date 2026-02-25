<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Forgot Password</h2>
        <p>We’ll send you a reset link</p>
      </div>

      <div class="auth-body">
        <form @submit.prevent="submit">
          <div class="field">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="admin@gmail.com" required />
          </div>

          <button class="btn-primary" type="submit">Send Reset Link</button>

          <div class="auth-link">
            <router-link to="/login">Back to login</router-link>
          </div>
        </form>
      </div>
    </div>

    <footer class="auth-footer">
      © {{ new Date().getFullYear() }} JSK Clinics · Crafted with ❤️
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/modules/auth/auth.service'

const email = ref('')

const submit = async () => {
  await authService.forgotPassword({ email: email.value })
  alert('Password reset link sent')
}
</script>

<style scoped>
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

.auth-header h2 {
  margin: 0;
}

.auth-header p {
  margin-top: 6px;
  font-size: 14px;
  opacity: 0.9;
}

.auth-body {
  padding: 28px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
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
  cursor: pointer;
}

.btn-primary:hover {
  background: #15803d;
}

.auth-link {
  margin-top: 16px;
  text-align: center;
}

.auth-link a {
  color: #16a34a;
  font-size: 13px;
  text-decoration: none;
}

.auth-footer {
  margin-top: 24px;
  font-size: 13px;
  color: #6b7280;
}
</style>
