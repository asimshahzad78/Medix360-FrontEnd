<template>
      <HrCrudPage
        title="Shifts"
        subtitle="Manage shift timings, break minutes and night shift settings."
        add-label="+ Add Shift"
        item-name-singular="Shift"
        item-name-plural="Shifts"
        modal-subtitle="Create a reusable shift with time and break details."
        search-placeholder="Search shifts..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getShifts"
        :create-api="hrLookupsService.createShift"
        :update-api="hrLookupsService.updateShift"
        :delete-api="hrLookupsService.deleteShift"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type ShiftDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'Name', label: 'Name', width: '220px', align: 'left' },
  { key: 'Code', label: 'Code', width: '130px', align: 'left' },
  { key: 'StartTime', label: 'Start', width: '110px', align: 'left' },
  { key: 'EndTime', label: 'End', width: '110px', align: 'left' },
  { key: 'IsNightShift', label: 'Night', width: '90px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'code', label: 'Code', type: 'text', placeholder: "e.g. MORNING" },
  { key: 'name', label: 'Name', type: 'text', placeholder: "e.g. Morning Shift", required: true },
  { key: 'startTime', label: 'Start Time', type: 'time', placeholder: "", required: true },
  { key: 'endTime', label: 'End Time', type: 'time', placeholder: "", required: true },
  { key: 'breakMinutes', label: 'Break Minutes', type: 'number', placeholder: "0", step: "1" },
  { key: 'isNightShift', label: 'Is Night Shift', type: 'checkbox', placeholder: "" },
  { key: 'isActive', label: 'Is Active', type: 'checkbox', placeholder: "" }
]

    const initialState = {"code": "", "name": "", "startTime": "", "endTime": "", "breakMinutes": null, "isNightShift": false, "isActive": true}

    function toForm(row: ShiftDto) {
      return {
    code: row.Code ?? initialState.code,
    name: row.Name ?? initialState.name,
    startTime: row.StartTime ?? initialState.startTime,
    endTime: row.EndTime ?? initialState.endTime,
    breakMinutes: row.BreakMinutes ?? initialState.breakMinutes,
    isNightShift: row.IsNightShift ?? initialState.isNightShift,
    isActive: row.IsActive ?? initialState.isActive,
      }
    }
    </script>
