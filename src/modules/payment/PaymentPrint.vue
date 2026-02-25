<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PaymentService } from './payment.service'
import { companyInfoService } from '@/modules/company-info/company-info.service'
import type { PaymentPrintResponse } from './payment.types'

interface CompanyInfo {
  Name: string
  Address: string
  Phone: string
  Website: string
  CompanyLogoImagePath: string
}

type Html2PdfOptions = {
  margin?: number | number[]
  filename?: string
  image?: { type: 'jpeg' | 'png'; quality: number }
  html2canvas?: {
    scale?: number
    useCORS?: boolean
    scrollY?: number
    scrollX?: number
    windowWidth?: number
    windowHeight?: number
    backgroundColor?: string | null
  }
  jsPDF?: {
    unit?: 'mm' | 'pt' | 'in'
    format?: 'a4' | 'letter' | 'a5' | number[]
    orientation?: 'portrait' | 'landscape'
  }
  pagebreak?: { mode?: Array<'avoid-all' | 'css' | 'legacy'> }
}

type Html2PdfInstance = { save: () => Promise<void> }
type Html2PdfFn = (element: HTMLElement, options?: Html2PdfOptions) => Html2PdfInstance

const route = useRoute()
const router = useRouter()

const payment = ref<PaymentPrintResponse | null>(null)
const company = ref<CompanyInfo | null>(null)

/* ===== Logo logic (same as CompanyInfo page) ===== */
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || window.location.origin).replace(/\/$/, '')
const logoPreview = ref('')
const logoFailed = ref(false)

const buildLogoUrl = (path?: string) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  return API_ORIGIN + (path.startsWith('/') ? path : `/${path}`)
}

watch(logoPreview, () => {
  // whenever logo url changes, reset failure flag
  logoFailed.value = false
})

/* ===== Computeds ===== */
const displayStatus = computed(() => {
  if (!payment.value) return ''
  const s = String(payment.value.status ?? '').toLowerCase()
  if (s === 'paid' || s === 'posted') return 'Paid'
  if (s === 'cancelled' || s === 'canceled') return 'Cancelled'
  return String(payment.value.status ?? '')
})

const formattedDate = computed(() => {
  const raw = payment.value?.paymentDate
  if (!raw) return ''
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d)
})

/* ===== Load ===== */
const load = async () => {
  const id = Number(route.params.id)
  payment.value = await PaymentService.getInvoiceForPrint(id)

  try {
    company.value = await companyInfoService.get()
    logoPreview.value = buildLogoUrl(company.value?.CompanyLogoImagePath)
    logoFailed.value = false
  } catch {
    company.value = null
    logoPreview.value = ''
    logoFailed.value = false
  }
}

onMounted(load)

/* ===== Helpers ===== */
const waitForCurrentLogo = (timeoutMs = 2000) =>
  new Promise<void>((resolve) => {
    const img = document.querySelector('#printableArea img.logo') as HTMLImageElement | null
    if (!img) return resolve()
    if (img.complete) return resolve()
    const done = () => resolve()
    img.addEventListener('load', done, { once: true })
    img.addEventListener('error', done, { once: true })
    setTimeout(done, timeoutMs)
  })

const waitForImages = (win: Window, timeoutMs = 2000) =>
  new Promise<void>((resolve) => {
    const imgs = Array.from(win.document.images || [])
    if (!imgs.length) return resolve()

    let pending = imgs.filter((i) => !i.complete).length
    if (pending === 0) return resolve()

    const done = () => {
      pending -= 1
      if (pending <= 0) resolve()
    }

    imgs.forEach((img) => {
      if (img.complete) return
      img.addEventListener('load', done, { once: true })
      img.addEventListener('error', done, { once: true })
    })

    setTimeout(resolve, timeoutMs)
  })

/* ===== ACTIONS ===== */
const printInvoice = async () => {
  // ensure data loaded (and logo URL set) before cloning HTML
  if (!company.value) await load()
  await nextTick()
  await waitForCurrentLogo()

  const el = document.querySelector('#printableArea .sheet') as HTMLElement | null
  if (!el) return

  const w = window.open('', '_blank', 'width=980,height=720')
  if (!w) return

  const headCss = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((n) => (n as HTMLElement).outerHTML)
    .join('\n')

  const baseHref = document.baseURI || window.location.href

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base href="${baseHref}">
    <title>Invoice</title>
    ${headCss}
    <style>
      @page{size:A5 landscape;margin:5mm;}
      html,body{margin:0;padding:0;background:#fff;}
      #printRoot{width:100%;display:flex;justify-content:center;}
    </style>
  </head>
  <body>
    <div id="printRoot">${el.outerHTML}</div>
  </body>
</html>`

  try {
    w.document.open()
    w.document.write(html)
    w.document.close()

    await new Promise((r) => setTimeout(r, 200))
    await waitForImages(w)
  } catch (e) {
    console.error('print window write failed:', e)
    try { w.close() } catch { }
    window.print()
    return
  }

  w.focus()
  w.onafterprint = () => {
    try { w.close() } catch { }
  }
  w.print()

  setTimeout(() => {
    try { w.close() } catch { }
  }, 1200)
}

const thermalPrint = () => {
  if (!payment.value) return
  const url = router.resolve({ name: 'PaymentThermalPrint', params: { id: payment.value.id } }).href
  window.open(url, '_blank', 'noopener,noreferrer')
}

const downloadPdf = async () => {
  const el = document.getElementById('printableArea')
  if (!el || !payment.value) return

  document.body.classList.add('pdf-mode')

  try {
    const mod = (await import('html2pdf.js')) as unknown as { default: Html2PdfFn }
    const html2pdf = mod.default

    await html2pdf(el, {
      filename: `${payment.value.receiptNo || 'invoice'}.pdf`,
      margin: 6,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: [210, 148], orientation: 'landscape' },
      pagebreak: { mode: ['css', 'legacy'] },
    }).save()
  } finally {
    document.body.classList.remove('pdf-mode')
  }
}

const editPayment = () => {
  if (!payment.value) return
  router.push({ name: 'PaymentDetail', params: { id: payment.value.id } })
}

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'PaymentsList' })
}
</script>

<template>
  <div v-if="payment">
    <div class="action-bar no-print">
      <button class="action-btn success" @click="thermalPrint">🧾 Thermal</button>
      <button class="action-btn primary" @click="printInvoice">🖨 Print</button>
      <button class="action-btn secondary" @click="downloadPdf">⬇ Download</button>

      <button class="action-btn warning" @click="editPayment">✏ Edit</button>
      <button class="action-btn ghost" @click="goBack">⬅ Back</button>
    </div>

    <div id="printableArea" class="print-page">
      <div class="sheet">
        <div class="content">
          <!-- HEADER: logo left, address/contact right -->
          <div class="top">
            <div class="top-left">
              <img v-if="logoPreview && !logoFailed" class="logo" :src="logoPreview" alt="Company Logo"
                @error="logoFailed = true" />
              <span v-else class="no-logo">No logo uploaded</span>
            </div>

            <div class="top-right">
              <div v-if="company?.Address">{{ company.Address }}</div>
              <div v-if="company?.Phone">Contact: {{ company.Phone }}</div>
              <div v-if="company?.Website">Website: {{ company.Website }}</div>
            </div>
          </div>

          <hr class="sep" />

          <!-- CENTERED META -->
          <div class="meta-wrap">
            <div class="meta-grid">
              <div class="meta-col">
                <p><strong>Patient:</strong> {{ payment.patient.fullName }}</p>
                <p v-if="payment.patient.mrNo"><strong>MR No:</strong> {{ payment.patient.mrNo }}</p>
                <p v-if="payment.patient.age">
                  <strong>Age:</strong> {{ payment.patient.age }} {{ payment.patient.gender }}
                </p>
                <p v-if="payment.doctorName"><strong>Doctor:</strong> {{ payment.doctorName }}</p>
              </div>

              <div class="meta-col">
                <p><strong>Invoice #:</strong> {{ payment.receiptNo }}</p>
                <p><strong>Date:</strong> {{ formattedDate }}</p>
                <p><strong>Status:</strong> {{ displayStatus }}</p>
                <p>
                  <strong>Mobile:</strong>
                  {{ payment.doctorMobile?.trim() ? payment.doctorMobile : '-' }}
                </p>
              </div>
            </div>
          </div>

          <!-- TABLE -->
          <table class="txn">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Net</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in payment.details" :key="row.id">
                <td>{{ row.description }}</td>
                <td>{{ row.amount }}</td>
                <td>{{ row.discount }}</td>
                <td>{{ row.netAmount }}</td>
              </tr>
            </tbody>
          </table>

          <!-- TOTALS -->
          <div class="totals">
            <p>Total: {{ payment.totalAmount }}</p>
            <p>Discount: {{ payment.totalDiscount }}</p>
            <p><strong>Net: {{ payment.netAmount }}</strong></p>
            <p>Paid: {{ payment.paidAmount }}</p>
            <p><strong>Due: {{ payment.balanceAmount }}</strong></p>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <div class="footer-note">
            In case of emergency, please contact on whatsapp: +92 314 5325939
          </div>

          <hr class="footer-hr" />

          <div class="footer-bottom">
            <div>Aswad Information Systems (aswadsystems.com)</div>
            <div>Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 999px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.action-btn.primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
}

.action-btn.success {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
}

.action-btn.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.action-btn.secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.action-btn.ghost {
  background: transparent;
  color: #334155;
}

.print-page {
  background: #fff;
  padding: 12px;
}

.sheet {
  width: 190mm;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  color: #000;

  min-height: 138mm;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* ✅ vertical center against logo */
  gap: 10px;
}

.top-left {
  min-width: 70mm;
  /* a bit wider so logo can grow */
  display: flex;
  align-items: center;
}

.logo {
  display: block;
  max-height: 65px;
  /* ✅ increase logo size */
  max-width: 90mm;
  /* ✅ increase logo size */
  object-fit: contain;
}

.top-right {
  text-align: right;
  font-size: 12px;
  line-height: 1.35;
  max-width: 95mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* ✅ center text vertically */
}

.no-logo {
  font-size: 12px;
  opacity: 0.7;
}

.sep {
  margin: 6mm 0 5mm;
  border: none;
  border-top: 1px solid #999;
}

.meta-wrap {
  display: flex;
  justify-content: center;
}

.meta-grid {
  width: 170mm;
  display: flex;
  justify-content: space-between;
  gap: 18mm;
}

.meta-col p {
  margin: 0 0 5px 0;
}

.txn {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-top: 6mm;
}

.txn thead th {
  text-align: left;
  padding: 7px 6px;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}

.txn tbody td {
  text-align: left;
  padding: 7px 6px;
  border-bottom: 1px solid #000;
}

.txn th,
.txn td {
  border-left: none !important;
  border-right: none !important;
}

.totals {
  width: 70mm;
  margin-left: auto;
  margin-top: 6mm;
  text-align: right;
}

.totals p {
  margin: 0 0 5px 0;
}

/* FOOTER (tighter + smaller) */
.footer {
  margin-top: auto;
  padding-top: 4mm;
  /* ✅ less gap before footer */
  font-size: 9.5px;
  /* ✅ smaller text */
  line-height: 1.2;
  /* ✅ tighter lines */
}

.footer-note {
  margin-bottom: 1.5mm;
  /* ✅ reduce gap before hr */
}

.footer-hr {
  border: none;
  border-top: 1px solid #999;
  margin: 0 0 1.5mm;
  /* ✅ reduce gap after hr */
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
}

@media print {
  @page {
    size: A5 landscape;
    margin: 5mm;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  .no-print {
    display: none !important;
  }

  #printableArea,
  .print-page {
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }
}
</style>
