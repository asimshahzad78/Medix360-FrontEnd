import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'

/* =========================
   API DTO (PascalCase)
========================= */
export interface CheckupApiDto {
  Id: number
  VisitId: string
  SerialNo: number
  PatientName: string
  DoctorName: string
  Symptoms: string
  Diagnosis: string
  Advice: string
  CheckupDate: string
}

/* =========================
   CREATE RESPONSE DTO
========================= */
export interface CheckupCreateResponse {
  CheckupId: number
  VisitId: number
  PaymentId: number
}

/* =========================
   UI DTO (camelCase)
========================= */
export interface CheckupListDto {
  id: number
  visitId: string
  serialNo: number
  patientName: string
  doctorName: string
  symptoms: string
  diagnosis: string
  advice: string
  checkupDate: string
}

/* =========================
   Patient History DTO (camelCase)
   (Modal expects this name)
========================= */
export type PatientCheckupHistoryDto = CheckupListDto

/* =========================
   SAVE DTO (already used by modal)
========================= */
export interface CheckupSaveDto {
  visitId: string
  serialNo?: number | null
  patientId: number
  doctorId: number
  patientType: string
  checkupDate: string
  nextVisitDate?: string | null
  paymentMode: string
  paymentType: string
  doctorFee: number
  symptoms: string
  diagnosis: string
  hpi: string
  vitalSigns: string
  physicalExamination: string
  advice: string
  comments: string
  nursingNotes: string
  currentURL?: string

  bpSystolic?: number | null
  bpDiastolic?: number | null
  respirationRate?: number | null
  temperature?: number | null

  medicines: {
    medicineId: number
    medicineName?: string
    noOfDays: number
    whenToTake: string
    whenToTakeDayCount?: number | null
    isBeforeMeal: boolean
    visitId?: string
    checkupId?: number | null
    paymentId?: number | null
  }[]

  labTests: {
    testId: number
    testName?: string
    orderType?: 'Lab' | 'Radiology'
    price: number
  }[]

  paymentAccountId: string | null
}

/* =========================
   Shared paging wrapper
========================= */
export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

/* =========================
   Mapper
========================= */
const mapCheckup = (c: CheckupApiDto): CheckupListDto => ({
  id: c.Id,
  visitId: c.VisitId,
  serialNo: c.SerialNo,
  patientName: c.PatientName,
  doctorName: c.DoctorName,
  symptoms: c.Symptoms,
  diagnosis: c.Diagnosis,
  advice: c.Advice,
  checkupDate: c.CheckupDate,
})

/* =========================
   Service (STRICT & SAFE)
========================= */
export const checkupService = {
  /* 🔁 CREATE */
  async create(payload: CheckupSaveDto): Promise<CheckupCreateResponse> {
    const { data } = await api.post<CheckupCreateResponse>('/checkups', payload, {
      meta: { idempotencyKey: true },
    })
    return unwrapApiData<CheckupCreateResponse>(data, data)
  },

  /* 📄 LIST */
 async getPaged(page: number, pageSize: number, search?: string): Promise<PagedResult<CheckupListDto>> {
  const { data } = await api.get<PagedResult<CheckupApiDto>>('/checkups', {
    params: { page, pageSize, search: search?.trim() || undefined },
  })

  const result = unwrapApiData<PagedResult<CheckupApiDto>>(data, { items: [], totalCount: 0 })

  return {
    totalCount: result.totalCount,
    items: (result.items ?? []).map(mapCheckup),
  }
},

  /* 🧾 PATIENT HISTORY (used by PatientHistoryModal) */
  async getPatientHistory(patientId: number): Promise<PatientCheckupHistoryDto[]> {
    // ✅ Change this route if your backend differs
    const { data } = await api.get<CheckupApiDto[]>(`/checkups/patient/${patientId}/history`)
    return unwrapApiData<CheckupApiDto[]>(data, []).map(mapCheckup)
  },
  async delete(id: number): Promise<void> {
  await api.delete(`/checkups/${id}`)
}
}
