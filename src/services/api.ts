import axios from 'axios'
import router from '@/router'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN

export const api = axios.create({
  baseURL: API_ORIGIN + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🔐 Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 🚨 HANDLE EXPIRED / INVALID TOKEN
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 🔥 TOKEN EXPIRED / INVALID
      localStorage.removeItem('token')

      // optional: clear user info
      localStorage.removeItem('user')

      // redirect to login
      router.replace('/login')
    }

    return Promise.reject(error)
  },
)
