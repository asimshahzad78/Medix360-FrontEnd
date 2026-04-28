<template>
      <HrCrudPage
        title="Duty Rosters"
        subtitle="Manage assigned shifts, duty dates and on-call scheduling."
        add-label="+ Add Duty Roster"
        item-name-singular="Duty Roster"
        item-name-plural="Duty Rosters"
        modal-subtitle="Assign employee, shift and duty date details."
        search-placeholder="Search duty rosters..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getDutyRosters"
        :create-api="hrLookupsService.createDutyRoster"
        :update-api="hrLookupsService.updateDutyRoster"
        :delete-api="hrLookupsService.deleteDutyRoster"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type DutyRosterDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'ShiftId', label: 'Shift', width: '100px', align: 'left' },
  { key: 'DutyDate', label: 'Duty Date', width: '140px', align: 'left' },
  { key: 'IsOnCall', label: 'On Call', width: '120px', align: 'left' },
  { key: 'Notes', label: 'Notes', width: '220px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee', type: 'lookup', lookupKind: 'employee', placeholder: "Search employee", required: true },
  { key: 'shiftId', label: 'Shift', type: 'lookup', lookupKind: 'shift', placeholder: "Search shift", required: true },
  { key: 'dutyDate', label: 'Duty Date', type: 'date', placeholder: "", required: true },
  { key: 'isOnCall', label: 'Is On Call', type: 'checkbox', placeholder: "" },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: "Optional notes", rows: 4 }
]

    const initialState = {"employeeId": null, "shiftId": null, "dutyDate": "", "isOnCall": false, "notes": ""}

    function toForm(row: DutyRosterDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    shiftId: row.ShiftId ?? initialState.shiftId,
    dutyDate: row.DutyDate ?? initialState.dutyDate,
    isOnCall: row.IsOnCall ?? initialState.isOnCall,
    notes: row.Notes ?? initialState.notes,
      }
    }
    </script>
