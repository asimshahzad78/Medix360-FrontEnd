<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
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

/* ===== Logo ===== */
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || window.location.origin).replace(/\/$/, '')
const logoPreview = ref('')
const logoFailed = ref(false)
const logoObjectUrl = ref<string>('')

const buildLogoUrl = (path?: string) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  return API_ORIGIN + (path.startsWith('/') ? path : `/${path}`)
}

watch(logoPreview, () => {
  logoFailed.value = false
})

onBeforeUnmount(() => {
  if (logoObjectUrl.value) {
    try { URL.revokeObjectURL(logoObjectUrl.value) } catch { }
  }
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

const displayPanel = computed(() => {
  const p = payment.value
  if (!p) return '-'
  return (
    p.patient?.panel ??
    p.patient?.Panel ??
    p.panel ??
    p.Panel ??
    p.patientType ??
    p.PatientType ??
    '-'
  )
})

/* ===== Helpers ===== */
const waitForImagesIn = (root: HTMLElement, timeoutMs = 2500) =>
  new Promise<void>((resolve) => {
    const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
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

const printBlobHidden = (blob: Blob) => {
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = url

  const cleanup = () => {
    try { URL.revokeObjectURL(url) } catch { }
    try { iframe.remove() } catch { }
  }

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch { }
    setTimeout(cleanup, 15000)
  }

  document.body.appendChild(iframe)
}

/* ===== Load ===== */
const load = async () => {
  const id = Number(route.params.id)
  payment.value = await PaymentService.getInvoiceForPrint(id)

  try {
    company.value = await companyInfoService.get()

    const rawLogoUrl = buildLogoUrl(company.value?.CompanyLogoImagePath)
    if (!rawLogoUrl) {
      logoPreview.value = ''
      return
    }

    // Best: Blob URL (no canvas/CORS drama)
    try {
      const res = await fetch(rawLogoUrl + `?v=${Date.now()}`, { mode: 'cors', cache: 'no-store' })
      if (!res.ok) throw new Error(`logo fetch failed: ${res.status}`)
      const blob = await res.blob()

      if (logoObjectUrl.value) {
        try { URL.revokeObjectURL(logoObjectUrl.value) } catch { }
      }

      logoObjectUrl.value = URL.createObjectURL(blob)
      logoPreview.value = logoObjectUrl.value
      logoFailed.value = false
    } catch {
      // fallback
      logoPreview.value = rawLogoUrl + `?v=${Date.now()}`
      logoFailed.value = false
    }
  } catch {
    company.value = null
    logoPreview.value = ''
    logoFailed.value = false
  }
}

onMounted(load)

/* ===== ACTIONS ===== */
const printInvoice = async () => {
  // capture ONLY sheet (prevents 2 pages)
  const sheet = document.querySelector('#printableArea .sheet') as HTMLElement | null
  if (!sheet || !payment.value) return

  document.body.classList.add('pdf-mode')

  try {
    await new Promise((r) => setTimeout(r, 80))
    await waitForImagesIn(sheet)

    const { default: html2canvas } = (await import('html2canvas')) as unknown as {
      default: (
        el: HTMLElement,
        opts: { scale: number; useCORS: boolean; backgroundColor: string }
      ) => Promise<HTMLCanvasElement>
    }

    const { jsPDF } = (await import('jspdf')) as unknown as {
      jsPDF: new (opts: { orientation: 'landscape'; unit: 'mm'; format: number[] }) => {
        addImage: (data: string, type: 'JPEG', x: number, y: number, w: number, h: number) => void
        output: (type: 'blob') => Blob
      }
    }

    const canvas = await html2canvas(sheet, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/jpeg', 0.98)

    // ===== REPLACE YOUR OLD pageW/pageH/margin/x/y CODE WITH THIS =====

    // A5 landscape in mm
    const pageW = 210
    const pageH = 148

    // printer safe margins (bigger left)
    const mTop = 10
    const mLeft = 60
    const mBottom = 10
    const mRight = 5

    // HP printers often shift print LEFT → push right
    const offsetX = 14  // try 14, if still cut then 18
    const offsetY = 0

    // shrink a bit so right side never clips after shift
    const shrink = 0.94

    const maxW = (pageW - mLeft - mRight) * shrink
    const maxH = (pageH - mTop - mBottom) * shrink

    let imgW = maxW
    let imgH = (canvas.height * imgW) / canvas.width

    if (imgH > maxH) {
      imgH = maxH
      imgW = (canvas.width * imgH) / canvas.height
    }

    let x = mLeft + offsetX
    let y = mTop + offsetY

    x = Math.min(x, pageW - mRight - imgW)
    y = Math.min(y, pageH - mBottom - imgH)

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [pageW, pageH] })
    pdf.addImage(imgData, 'JPEG', x, y, imgW, imgH)

    printBlobHidden(pdf.output('blob'))
  } finally {
    document.body.classList.remove('pdf-mode')
  }
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
              <img v-if="logoPreview && !logoFailed" class="logo" :src="logoPreview" crossorigin="anonymous"
                @error="logoFailed = true" />
              <!--  <span v-else class="no-logo">No logo uploaded</span> -->
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
                <p v-if="payment.patient.ageDisplay || payment.patient.age !== undefined">
                  <strong>Age:</strong>
                  {{
                    payment.patient.ageDisplay ??
                    (payment.patient.age !== undefined
                      ? `${payment.patient.age} ${payment.patient.ageUnit ?? ''}`.trim()
                      : '')
                  }}
                  <span v-if="payment.patient.gender"> {{ payment.patient.gender }}</span>
                </p>
                <p v-if="payment.doctorName"><strong>Doctor:</strong> {{ payment.doctorName }}</p>
              </div>

              <div class="meta-col">
                <p><strong>Invoice #:</strong> {{ payment.receiptNo }}</p>
                <p><strong>Date:</strong> {{ formattedDate }}</p>
                <p><strong>Panel:</strong> {{ displayPanel }}</p>
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
            <p><strong>Status:</strong> {{ displayStatus }}</p>
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
/* ----------------- UI buttons ----------------- */
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

/* ----------------- sheet ----------------- */
.sheet {
  width: 190mm;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  color: #000;
  display: flex;
  flex-direction: column;
}

/* screen only height */
@media screen {
  .sheet {
    min-height: 138mm;
  }
}

.content {
  flex: 1;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.top-left {
  min-width: 70mm;
  display: flex;
  align-items: center;
}

.logo {
  display: block;
  max-height: 65px;
  max-width: 90mm;
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

/* footer */
.footer {
  margin-top: auto;
  padding-top: 4mm;
  font-size: 9.5px;
  line-height: 1.2;
}

.footer-note {
  margin-bottom: 1.5mm;
}

.footer-hr {
  border: none;
  border-top: 1px solid #999;
  margin: 0 0 1.5mm;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
}

/* ✅ print behavior for component elements (scoped targets only) */
@media print {
  .no-print {
    display: none !important;
  }

  #printableArea,
  .print-page {
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  /* stop flex full-page logic (prevents 2 pages) */
  .sheet {
    width: 100% !important;
    min-height: auto !important;
    height: auto !important;
    display: block !important;
    margin: 0 !important;
  }

  /* stop pushing footer to bottom */
  .footer {
    margin-top: 6mm !important;
  }
}
</style>

<style>
@media print {

  /* A5 landscape + safe internal margin (HP cannot print edge-to-edge) */
  @page {
    size: 210mm 148mm;
    margin: 0;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }

  /* this becomes your "print-safe margin" instead of @page margin */
  body {
    padding: 12mm !important;
    box-sizing: border-box !important;
  }
}
</style>
