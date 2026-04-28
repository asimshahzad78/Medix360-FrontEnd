import type { LookupKind } from '@/services/lookup.service'

export type CrudFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'checkbox'
  | 'select'
  | 'lookup'

export type CrudFieldOption = {
  value: string | number | boolean
  label: string
}

export type CrudField = {
  key: string
  label: string
  type?: CrudFieldType
  lookupKind?: LookupKind
  placeholder?: string
  required?: boolean
  options?: CrudFieldOption[]
  min?: number | string
  max?: number | string
  step?: number | string
  rows?: number
}

export type CrudColumn = {
  key: string
  label: string
  width?: string
  align?: 'left' | 'right' | 'center'
}

export type FormValue = string | number | boolean | null | undefined

export type FormModel = Record<string, FormValue>

export type UnknownRecord = Record<string, unknown>
