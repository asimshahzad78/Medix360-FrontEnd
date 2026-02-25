import { api } from '@/services/api'

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
  patientId: number
  doctorId: number
  patientType: string
  checkupDate: string
  paymentMode: string
  doctorFee: number
  symptoms: string
  diagnosis: string
  hpi: string
  vitalSigns: string
  physicalExamination: string
  advice: string
  comments: string
  nursingNotes: string

  bpSystolic?: number | null
  bpDiastolic?: number | null
  respirationRate?: number | null
  temperature?: number | null

  medicines: {
    medicineId: number
    noOfDays: number
    whenToTake: string
    isBeforeMeal: boolean
  }[]

  labTests: {
    testId: number
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
    const { data } = await api.post<CheckupCreateResponse>('/checkups', payload)
    return data
  },

  /* 📄 LIST */
 async getPaged(page: number, pageSize: number, search?: string): Promise<PagedResult<CheckupListDto>> {
  const { data } = await api.get<PagedResult<CheckupApiDto>>('/checkups', {
    params: { page, pageSize, search: search?.trim() || undefined },
  })

  return {
    totalCount: data.totalCount,
    items: data.items.map(mapCheckup),
  }
},

  /* 🧾 PATIENT HISTORY (used by PatientHistoryModal) */
  async getPatientHistory(patientId: number): Promise<PatientCheckupHistoryDto[]> {
    // ✅ Change this route if your backend differs
    const { data } = await api.get<CheckupApiDto[]>(`/checkups/patient/${patientId}/history`)
    return data.map(mapCheckup)
  },
}
