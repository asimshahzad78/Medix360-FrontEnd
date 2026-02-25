import { api } from '@/services/api'
import type { LoginVM } from './auth.types'

export const authService = {
  // LOGIN
  login(data: LoginVM) {
    return api.post('/account/login', {
      Email: data.email,
      Password: data.password,
      RememberMe: data.rememberMe,
      Latitude: null,
      Longitude: null,
    })
  },

  // CURRENT USER
  me() {
    return api.get('/account/me')
  },

  // FORGOT PASSWORD
  forgotPassword(data: { email: string }) {
    return api.post('/auth/forgot-password', data)
  },

  // RESET PASSWORD
  resetPassword(data: {
    email: string
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    return api.post('/auth/reset-password', data)
  },
}
