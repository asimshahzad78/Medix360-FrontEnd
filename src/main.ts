import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { assertFrontendSecurityConfig } from '@/security/frontend-hardening'

import VueApexCharts from 'vue3-apexcharts'

import '../public/assets/styles/theme.css'
import '../public/assets/styles/base.css'
import '../src/assets/print.css'

assertFrontendSecurityConfig()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(VueApexCharts)

app.mount('#app')
