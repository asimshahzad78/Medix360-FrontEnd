import { api } from '@/services/api'
import { unwrapApiData, type PagedResult } from '@/services/api-response'

export interface AppointmentApiDto {
  Id?: number
  id?: number
  PatientId?: number
  patientId?: number
  VisitId?: string
  visitId?: string
  PatientType?: string
  patientType?: string
  PatientName?: string
  patientName?: string
  DoctorId?: number
  doctorId?: number
  DoctorName?: string
  doctorName?: string
  SerialNo?: number
  serialNo?: number
  AppointmentDate?: string
  appointmentDate?: string
  AppointmentTime?: string
  appointmentTime?: string
  AppointmentTimeDisplay?: string
  appointmentTimeDisplay?: string
  Note?: string
  note?: string
}

export interface AppointmentListDto {
  id: number
  patientId: number
  visitId: string
  patientType: string
  patientName: string
  doctorId: number
  doctorName: string
  serialNo: number
  appointmentDate: string
  appointmentTime: string
  appointmentTimeDisplay: string
  note: string
}

export interface AppointmentSaveDto {
  id?: number
  patientId: number | null
  patientType: string
  doctorId: number | null
  serialNo: number | null
  appointmentDate: string
  appointmentTime: string
  note: string
}

const normalizeAppointment = (appointment: AppointmentApiDto): AppointmentListDto => ({
  id: appointment.Id ?? appointment.id ?? 0,
  patientId: appointment.PatientId ?? appointment.patientId ?? 0,
  visitId: appointment.VisitId ?? appointment.visitId ?? '',
  patientType: appointment.PatientType ?? appointment.patientType ?? '1',
  patientName: appointment.PatientName ?? appointment.patientName ?? '',
  doctorId: appointment.DoctorId ?? appointment.doctorId ?? 0,
  doctorName: appointment.DoctorName ?? appointment.doctorName ?? '',
  serialNo: appointment.SerialNo ?? appointment.serialNo ?? 0,
  appointmentDate: appointment.AppointmentDate ?? appointment.appointmentDate ?? '',
  appointmentTime: appointment.AppointmentTime ?? appointment.appointmentTime ?? '',
  appointmentTimeDisplay:
    appointment.AppointmentTimeDisplay ??
    appointment.appointmentTimeDisplay ??
    formatTimeForDisplay(appointment.AppointmentTime ?? appointment.appointmentTime ?? ''),
  note: appointment.Note ?? appointment.note ?? '',
})

const toAppointmentDateTime = (payload: AppointmentSaveDto): string => {
  if (!payload.appointmentTime) return payload.appointmentDate
  if (payload.appointmentTime.includes('T')) return payload.appointmentTime
  return `${payload.appointmentDate}T${payload.appointmentTime}:00`
}

const toApiPayload = (payload: AppointmentSaveDto) => ({
  Id: payload.id ?? 0,
  PatientId: payload.patientId,
  PatientType: payload.patientType,
  DoctorId: payload.doctorId,
  SerialNo: payload.serialNo ?? 0,
  AppointmentDate: payload.appointmentDate,
  AppointmentTime: toAppointmentDateTime(payload),
  Note: payload.note,
})

const isUnsupportedApiMethod = (error: unknown): boolean => {
  const status = (error as { response?: { status?: number } }).response?.status
  return status === 404 || status === 405
}

const postLegacyAppointmentSave = async (payload: AppointmentSaveDto): Promise<void> => {
  const body = new URLSearchParams()
  const dto = toApiPayload(payload)

  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      body.append(key, String(value))
    }
  })

  await api.post(`${import.meta.env.VITE_API_ORIGIN}/PatientAppointment/AddEditSave`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    meta: { idempotencyKey: true },
  })
}

const formatTimeForDisplay = (value: string): string => {
  if (!value) return ''

  const date = value.includes('T') ? new Date(value) : new Date(`2000-01-01T${value}`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const appointmentService = {
  async getAll(pageSize = 200): Promise<AppointmentListDto[]> {
    const { data } = await api.get<AppointmentApiDto[] | PagedResult<AppointmentApiDto>>('/appointments', {
      params: { page: 1, pageSize },
    })
    const result = unwrapApiData<AppointmentApiDto[] | PagedResult<AppointmentApiDto>>(data, [])
    const items = Array.isArray(result) ? result : result.items

    return (items ?? []).map(normalizeAppointment)
  },

  async create(payload: AppointmentSaveDto): Promise<void> {
    try {
      await api.post('/appointments', toApiPayload(payload), {
        meta: { idempotencyKey: true },
      })
    } catch (error: unknown) {
      if (!isUnsupportedApiMethod(error)) throw error
      await postLegacyAppointmentSave(payload)
    }
  },

  async update(id: number, payload: AppointmentSaveDto): Promise<void> {
    try {
      await api.put(
        `/appointments/${id}`,
        {
          ...toApiPayload(payload),
          Id: id,
        },
        {
          meta: { idempotencyKey: true },
        },
      )
    } catch (error: unknown) {
      if (!isUnsupportedApiMethod(error)) throw error
      await postLegacyAppointmentSave({ ...payload, id })
    }
  },
}
