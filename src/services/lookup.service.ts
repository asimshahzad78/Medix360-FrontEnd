import { api } from '@/services/api'
import { unwrapApiData } from '@/services/api-response'
import { getPlatformContext } from '@/services/systemContext'

export type LookupKind =
  | 'medicine'
  | 'patient'
  | 'labTest'
  | 'radiologyStudy'
  | 'bed'
  | 'ward'
  | 'store'
  | 'counter'
  | 'shift'
  | 'employee'
  | 'leaveType'
  | 'encounter'
  | 'doctor'
  | 'facility'
  | 'department'
  | 'paymentAccount'
  | 'paymentMode'
  | 'supplier'

export type LookupOption = {
  id: string | number
  label: string
  code?: string
  description?: string
  price?: number
  fee?: number
  raw?: unknown
}

type LookupConfig = {
  endpoint: string
  searchParam?: string
  labelKeys: string[]
  idKeys: string[]
  codeKeys?: string[]
  descriptionKeys?: string[]
  priceKeys?: string[]
  feeKeys?: string[]
}

type LooseRecord = Record<string, unknown>

const lookupConfigs: Record<LookupKind, LookupConfig> = {
  patient: {
    endpoint: '/patients',
    labelKeys: ['label', 'Label', 'name', 'Name', 'fullName', 'FullName', 'patientName', 'PatientName'],
    idKeys: ['id', 'Id', 'patientId', 'PatientId', 'patientRecordId', 'PatientRecordId'],
    codeKeys: ['code', 'Code', 'mrn', 'MRN', 'registrationNo', 'RegistrationNo'],
    descriptionKeys: ['phone', 'Phone', 'mobile', 'Mobile', 'gender', 'Gender'],
  },
  medicine: {
    endpoint: '/lookups/medicines',
    labelKeys: ['label', 'Label', 'name', 'Name', 'medicineName', 'MedicineName', 'genericName', 'GenericName'],
    idKeys: ['id', 'Id', 'medicineId', 'MedicineId', 'productId', 'ProductId'],
    codeKeys: ['code', 'Code', 'sku', 'Sku'],
    descriptionKeys: ['strength', 'Strength', 'description', 'Description'],
    priceKeys: ['price', 'Price', 'salePrice', 'SalePrice', 'unitPrice', 'UnitPrice'],
  },
  labTest: {
    endpoint: '/lookups/lab-tests',
    labelKeys: ['label', 'Label', 'name', 'Name', 'testName', 'TestName'],
    idKeys: ['id', 'Id', 'testId', 'TestId', 'labTestId', 'LabTestId'],
    codeKeys: ['code', 'Code', 'testCode', 'TestCode'],
    descriptionKeys: ['department', 'Department', 'sampleType', 'SampleType'],
    priceKeys: ['price', 'Price', 'rate', 'Rate', 'amount', 'Amount'],
  },
  radiologyStudy: {
    endpoint: '/lookups/radiology-studies',
    labelKeys: ['label', 'Label', 'name', 'Name', 'studyName', 'StudyName', 'procedureName', 'ProcedureName'],
    idKeys: ['id', 'Id', 'studyId', 'StudyId', 'procedureId', 'ProcedureId'],
    codeKeys: ['code', 'Code', 'studyCode', 'StudyCode'],
    descriptionKeys: ['modality', 'Modality', 'bodyPart', 'BodyPart'],
    priceKeys: ['price', 'Price', 'rate', 'Rate', 'amount', 'Amount'],
  },
  bed: {
    endpoint: '/inpatient/beds',
    labelKeys: ['label', 'Label', 'name', 'Name', 'bedName', 'BedName', 'bedNo', 'BedNo', 'bedNumber', 'BedNumber'],
    idKeys: ['id', 'Id', 'bedId', 'BedId'],
    codeKeys: ['code', 'Code', 'bedCode', 'BedCode'],
    descriptionKeys: ['wardName', 'WardName', 'status', 'Status'],
  },
  ward: {
    endpoint: '/platform/wards',
    labelKeys: ['label', 'Label', 'name', 'Name', 'wardName', 'WardName'],
    idKeys: ['id', 'Id', 'wardId', 'WardId'],
    codeKeys: ['code', 'Code', 'wardCode', 'WardCode'],
    descriptionKeys: ['department', 'Department', 'floor', 'Floor'],
  },
  store: {
    endpoint: '/inventory/stores',
    labelKeys: ['label', 'Label', 'name', 'Name', 'storeName', 'StoreName'],
    idKeys: ['id', 'Id', 'storeId', 'StoreId'],
    codeKeys: ['code', 'Code', 'storeCode', 'StoreCode'],
    descriptionKeys: ['facilityName', 'FacilityName', 'type', 'Type'],
  },
  counter: {
    endpoint: '/platform/counters',
    labelKeys: ['label', 'Label', 'name', 'Name', 'counterName', 'CounterName'],
    idKeys: ['id', 'Id', 'counterId', 'CounterId'],
    codeKeys: ['code', 'Code', 'counterCode', 'CounterCode'],
    descriptionKeys: ['facilityName', 'FacilityName', 'department', 'Department'],
  },
  shift: {
    endpoint: '/hr/shifts',
    labelKeys: ['label', 'Label', 'name', 'Name', 'Name'],
    idKeys: ['id', 'Id', 'shiftId', 'ShiftId'],
    codeKeys: ['code', 'Code'],
    descriptionKeys: ['startTime', 'StartTime', 'endTime', 'EndTime'],
  },
  employee: {
    endpoint: '/employees',
    labelKeys: ['label', 'Label', 'fullName', 'FullName', 'name', 'Name', 'employeeName', 'EmployeeName', 'firstName', 'FirstName'],
    idKeys: ['id', 'Id', 'employeeId', 'EmployeeId'],
    codeKeys: ['code', 'Code', 'employeeCode', 'EmployeeCode'],
    descriptionKeys: ['department', 'Department', 'designation', 'Designation', 'phone', 'Phone'],
  },
  leaveType: {
    endpoint: '/hr/leave-types',
    labelKeys: ['label', 'Label', 'name', 'Name'],
    idKeys: ['id', 'Id', 'leaveTypeId', 'LeaveTypeId'],
    codeKeys: ['code', 'Code'],
    descriptionKeys: ['description', 'Description'],
  },
  encounter: {
    endpoint: '/checkups',
    labelKeys: ['visitId', 'VisitId'],
    idKeys: ['visitId', 'VisitId'],
    codeKeys: ['serialNo', 'SerialNo'],
    descriptionKeys: ['patientName', 'PatientName', 'doctorName', 'DoctorName', 'checkupDate', 'CheckupDate'],
  },
  doctor: {
    endpoint: '/doctors',
    labelKeys: ['label', 'Label', 'name', 'Name', 'doctorName', 'DoctorName', 'fullName', 'FullName'],
    idKeys: ['id', 'Id', 'docId', 'DocId', 'doctorId', 'DoctorId'],
    codeKeys: ['code', 'Code', 'doctorsID', 'DoctorsID'],
    descriptionKeys: ['designation', 'Designation', 'designationDisplay', 'DesignationDisplay', 'department', 'Department'],
    feeKeys: ['fee', 'Fee', 'doctorFee', 'DoctorFee'],
  },
  facility: {
    endpoint: '/platform/facilities',
    labelKeys: ['label', 'Label', 'name', 'Name', 'facilityName', 'FacilityName'],
    idKeys: ['id', 'Id', 'facilityId', 'FacilityId', 'propertyId', 'PropertyId'],
    codeKeys: ['code', 'Code', 'facilityCode', 'FacilityCode'],
    descriptionKeys: ['tenantName', 'TenantName', 'city', 'City'],
  },
  department: {
    endpoint: '/hr/departments',
    labelKeys: ['label', 'Label', 'name', 'Name'],
    idKeys: ['id', 'Id', 'departmentId', 'DepartmentId'],
    codeKeys: ['code', 'Code'],
    descriptionKeys: ['facilityName', 'FacilityName'],
  },
  paymentAccount: {
    endpoint: '/ChartOfAccount/payment-accounts',
    labelKeys: ['label', 'Label', 'name', 'Name'],
    idKeys: ['id', 'Id', 'accountId', 'AccountId'],
    codeKeys: ['code', 'Code'],
    descriptionKeys: ['accountType', 'AccountType'],
  },
  paymentMode: {
    endpoint: '/pharmacy/payments',
    labelKeys: ['label', 'Label', 'name', 'Name', 'mode', 'Mode'],
    idKeys: ['id', 'Id', 'code', 'Code', 'mode', 'Mode'],
    codeKeys: ['code', 'Code'],
    descriptionKeys: ['description', 'Description'],
  },
  supplier: {
    endpoint: '/inventory/suppliers',
    labelKeys: ['label', 'Label', 'name', 'Name', 'supplierName', 'SupplierName', 'vendorName', 'VendorName'],
    idKeys: ['id', 'Id', 'supplierId', 'SupplierId', 'vendorId', 'VendorId'],
    codeKeys: ['code', 'Code', 'supplierCode', 'SupplierCode', 'vendorCode', 'VendorCode'],
    descriptionKeys: ['contactPerson', 'ContactPerson', 'phone', 'Phone', 'email', 'Email'],
  },
}

const staticPaymentModes: LookupOption[] = [
  { id: 'Free', label: 'Free', code: 'FREE' },
  { id: 'Cash', label: 'Cash', code: 'CASH' },
  { id: 'Card', label: 'Card', code: 'CARD' },
  { id: 'Wallet', label: 'Wallet', code: 'WALLET' },
  { id: 'Online Transfer', label: 'Online Transfer', code: 'ONLINE' },
]

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === 'object' && value !== null

const pick = (record: LooseRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) return record[key]
  }

  return undefined
}

const toText = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  return String(value)
}

const toNumber = (value: unknown): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalizeDoctorLabel = (record: LooseRecord): string | undefined => {
  const firstName = toText(pick(record, ['firstName', 'FirstName']))
  const lastName = toText(pick(record, ['lastName', 'LastName']))
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  return fullName || undefined
}

const getItems = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload
  if (!isRecord(payload)) return []

  const candidate =
    pick(payload, ['items', 'Items', 'value', 'Value', 'results', 'Results', 'data', 'Data', 'records', 'Records']) ?? []

  return Array.isArray(candidate) ? candidate : []
}

const normalizeOption = (item: unknown, config: LookupConfig, index: number): LookupOption | null => {
  if (!isRecord(item)) {
    const label = toText(item)
    return label ? { id: label, label, raw: item } : null
  }

  const id = pick(item, config.idKeys)
  const label =
    normalizeDoctorLabel(item) ??
    toText(pick(item, config.labelKeys)) ??
    toText(pick(item, config.codeKeys ?? [])) ??
    `Option ${index + 1}`

  if (id === null || id === undefined || id === '') return null

  return {
    id: typeof id === 'number' ? id : String(id),
    label,
    code: toText(pick(item, config.codeKeys ?? [])),
    description: toText(pick(item, config.descriptionKeys ?? [])),
    price: toNumber(pick(item, config.priceKeys ?? [])),
    fee: toNumber(pick(item, config.feeKeys ?? [])),
    raw: item,
  }
}

export const lookupService = {
  async search(kind: LookupKind, search = '', params: Record<string, unknown> = {}): Promise<LookupOption[]> {
    if (kind === 'paymentMode') return staticPaymentModes

    if (kind === 'facility') {
      const context = getPlatformContext()
      const facilityId = context.facilityId || context.propertyId

      if (!facilityId) return []

      return [
        {
          id: facilityId,
          label: facilityId,
          description: context.tenantId ? `Tenant ${context.tenantId}` : undefined,
        },
      ]
    }

    const config = lookupConfigs[kind]
    const searchParam = config.searchParam ?? 'search'
    const requestParams = {
      page: 1,
      pageSize: 20,
      ...params,
      ...(search ? { [searchParam]: search } : {}),
    }

    try {
      const response = await api.get(config.endpoint, { params: requestParams })
      const payload = unwrapApiData<unknown>(response.data, response.data)

      const items = getItems(payload)
      return items
        .map((item, index) => normalizeOption(item, config, index))
        .filter((item): item is LookupOption => item !== null)
    } catch (error) {
      throw error
    }
  },

  getEndpoint(kind: LookupKind): string {
    return lookupConfigs[kind].endpoint
  },
}
