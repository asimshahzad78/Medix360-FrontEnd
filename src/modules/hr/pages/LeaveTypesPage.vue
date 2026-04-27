<template>
      <HrCrudPage
        title="Leave Types"
        subtitle="Manage annual, sick, casual and other leave type masters."
        add-label="+ Add Leave Type"
        item-name-singular="Leave Type"
        item-name-plural="Leave Types"
        modal-subtitle="Create leave categories and default entitlements."
        search-placeholder="Search leave types..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getLeaveTypes"
        :create-api="hrLookupsService.createLeaveType"
        :update-api="hrLookupsService.updateLeaveType"
        :delete-api="hrLookupsService.deleteLeaveType"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type LeaveTypeDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'Name', label: 'Name', width: '220px', align: 'left' },
  { key: 'Code', label: 'Code', width: '150px', align: 'left' },
  { key: 'DefaultDays', label: 'Default Days', width: '120px', align: 'right' },
  { key: 'IsPaid', label: 'Paid', width: '90px', align: 'left' },
  { key: 'IsActive', label: 'Active', width: '90px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'code', label: 'Code', type: 'text', placeholder: "e.g. AL" },
  { key: 'name', label: 'Name', type: 'text', placeholder: "e.g. Annual Leave", required: true },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: "Optional description", rows: 4 },
  { key: 'defaultDays', label: 'Default Days', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'isPaid', label: 'Is Paid', type: 'checkbox', placeholder: "" },
  { key: 'isActive', label: 'Is Active', type: 'checkbox', placeholder: "" }
]

    const initialState = {"code": "", "name": "", "description": "", "defaultDays": null, "isPaid": true, "isActive": true}

    function toForm(row: LeaveTypeDto) {
      return {
    code: row.Code ?? initialState.code,
    name: row.Name ?? initialState.name,
    description: row.Description ?? initialState.description,
    defaultDays: row.DefaultDays ?? initialState.defaultDays,
    isPaid: row.IsPaid ?? initialState.isPaid,
    isActive: row.IsActive ?? initialState.isActive,
      }
    }
    </script>
