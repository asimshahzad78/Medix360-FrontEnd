<template>
      <HrCrudPage
        title="Permissions"
        subtitle="Manage HR permission masters, grouping and active status."
        add-label="+ Add Permission"
        item-name-singular="Permission"
        item-name-plural="Permissions"
        modal-subtitle="Create permission entries used in HR access control."
        search-placeholder="Search permissions..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getPermissions"
        :create-api="hrLookupsService.createPermission"
        :update-api="hrLookupsService.updatePermission"
        :delete-api="hrLookupsService.deletePermission"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type PermissionDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'Name', label: 'Name', width: '220px', align: 'left' },
  { key: 'Code', label: 'Code', width: '150px', align: 'left' },
  { key: 'GroupName', label: 'Group', width: '160px', align: 'left' },
  { key: 'IsActive', label: 'Active', width: '90px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'code', label: 'Code', type: 'text', placeholder: "e.g. HR_VIEW" },
  { key: 'name', label: 'Name', type: 'text', placeholder: "e.g. View HR Dashboard", required: true },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: "Optional description", rows: 4 },
  { key: 'groupName', label: 'Group Name', type: 'text', placeholder: "e.g. HR" },
  { key: 'isActive', label: 'Is Active', type: 'checkbox', placeholder: "" }
]

    const initialState = {"code": "", "name": "", "description": "", "groupName": "", "isActive": true}

    function toForm(row: PermissionDto) {
      return {
    code: row.Code ?? initialState.code,
    name: row.Name ?? initialState.name,
    description: row.Description ?? initialState.description,
    groupName: row.GroupName ?? initialState.groupName,
    isActive: row.IsActive ?? initialState.isActive,
      }
    }
    </script>
