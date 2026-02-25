<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <h2>Medix360</h2>
        <p>Powering Healthcare Operations</p>
      </div>

      <!-- Body -->
      <div class="login-body">
        <div v-if="errorMessage" class="alert">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="submit">
          <div class="field">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="admin@gmail.com" required />
          </div>

          <div class="field">
            <label>Password</label>
            <input v-model="form.password" type="password" placeholder="••••••••" required />
          </div>

          <div class="remember">
            <input type="checkbox" v-model="form.rememberMe" id="remember" />
            <label for="remember">Remember me</label>
          </div>

          <button class="login-btn" type="submit">Log In</button>

          <div class="forgot">
            <router-link to="/forgot-password"> Forgot your password? </router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- Footer -->
    <footer class="login-footer">
      © {{ new Date().getFullYear() }} Aswad Information Systems · Crafted with ❤️
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from './auth.service'
import { useAuthStore } from '@/store/auth.store'
import type { LoginVM } from './auth.types'
import type { AuthUser } from '@/store/auth.store'

type LoginResponse = {
  ModelObject?: {
    token?: string
    user?: AuthUser
    permissions?: string[]
  }
  AlertMessage?: string
  alertMessage?: string
}

const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')

const form = reactive<LoginVM>({
  email: '',
  password: '',
  rememberMe: false,
})

const submit = async () => {
  errorMessage.value = ''

  try {
    const res = await authService.login(form)
    const data = res.data as LoginResponse

    const token = data.ModelObject?.token ?? ''
    const user = data.ModelObject?.user ?? null
    const permissions = data.ModelObject?.permissions ?? []

    if (!token || !user) {
      errorMessage.value = data.AlertMessage ?? data.alertMessage ?? 'Login failed'
      return
    }

    // ✅ Pinia + localstorage (token/user/permissions)
    authStore.setAuth(token, user, permissions)

    // ✅ one tick
    await Promise.resolve()
    router.push('/dashboard')
  } catch (error: unknown) {
    const err = error as { response?: { data?: { alertMessage?: string; AlertMessage?: string } } }
    errorMessage.value =
      err.response?.data?.alertMessage ||
      err.response?.data?.AlertMessage ||
      'Invalid email or password'
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: #f5f7fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.login-header {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  padding: 32px;
}

.login-header h2 {
  margin: 0;
  font-size: 26px;
}

.login-header p {
  margin-top: 6px;
  opacity: 0.9;
  font-size: 14px;
}

.login-body {
  padding: 28px;
}

.alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.field label {
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

.field input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.field input:focus {
  outline: none;
  border-color: #16a34a;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  background: #16a34a;
  color: white;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.login-btn:hover {
  background: #15803d;
}

.forgot {
  text-align: center;
  margin-top: 16px;
}

.forgot a {
  font-size: 13px;
  color: #16a34a;
  text-decoration: none;
}

.login-footer {
  margin-top: 24px;
  font-size: 13px;
  color: #6b7280;
}
</style>
