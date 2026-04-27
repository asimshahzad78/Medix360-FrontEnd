<template>
      <HrCrudPage
        title="Attendance Logs"
        subtitle="Manage employee attendance, check-in, check-out, late and overtime logs."
        add-label="+ Add Attendance Log"
        item-name-singular="Attendance Log"
        item-name-plural="Attendance Logs"
        modal-subtitle="Capture attendance timing and status for an employee."
        search-placeholder="Search attendance logs..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getAttendanceLogs"
        :create-api="hrLookupsService.createAttendanceLog"
        :update-api="hrLookupsService.updateAttendanceLog"
        :delete-api="hrLookupsService.deleteAttendanceLog"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type AttendanceLogDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'AttendanceDate', label: 'Attendance Date', width: '140px', align: 'left' },
  { key: 'CheckInTime', label: 'Check In', width: '170px', align: 'left' },
  { key: 'CheckOutTime', label: 'Check Out', width: '170px', align: 'left' },
  { key: 'Status', label: 'Status', width: '130px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee Id', type: 'number', placeholder: "e.g. 1001", required: true, step: "1" },
  { key: 'shiftId', label: 'Shift Id', type: 'number', placeholder: "e.g. 1", step: "1" },
  { key: 'dutyRosterId', label: 'Duty Roster Id', type: 'number', placeholder: "e.g. 1", step: "1" },
  { key: 'attendanceDate', label: 'Attendance Date', type: 'date', placeholder: "", required: true },
  { key: 'checkInTime', label: 'Check In Time', type: 'datetime-local', placeholder: "" },
  { key: 'checkOutTime', label: 'Check Out Time', type: 'datetime-local', placeholder: "" },
  { key: 'status', label: 'Status', type: 'text', placeholder: "e.g. Present" },
  { key: 'lateMinutes', label: 'Late Minutes', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'overtimeMinutes', label: 'Overtime Minutes', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: "Optional notes", rows: 4 }
]

    const initialState = {"employeeId": null, "shiftId": null, "dutyRosterId": null, "attendanceDate": "", "checkInTime": "", "checkOutTime": "", "status": "", "lateMinutes": null, "overtimeMinutes": null, "notes": ""}

    function toForm(row: AttendanceLogDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    shiftId: row.ShiftId ?? initialState.shiftId,
    dutyRosterId: row.DutyRosterId ?? initialState.dutyRosterId,
    attendanceDate: row.AttendanceDate ?? initialState.attendanceDate,
    checkInTime: row.CheckInTime ?? initialState.checkInTime,
    checkOutTime: row.CheckOutTime ?? initialState.checkOutTime,
    status: row.Status ?? initialState.status,
    lateMinutes: row.LateMinutes ?? initialState.lateMinutes,
    overtimeMinutes: row.OvertimeMinutes ?? initialState.overtimeMinutes,
    notes: row.Notes ?? initialState.notes,
      }
    }
    </script>
