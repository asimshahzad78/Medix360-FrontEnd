<template>
      <HrCrudPage
        title="Employment Profile Tags"
        subtitle="Manage HR tags used for employee profile classification and grouping."
        add-label="+ Add Profile Tag"
        item-name-singular="Employment Profile Tag"
        item-name-plural="Employment Profile Tags"
        modal-subtitle="Create reusable tags for employee profile grouping."
        search-placeholder="Search employment profile tags..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getEmploymentProfileTags"
        :create-api="hrLookupsService.createEmploymentProfileTag"
        :update-api="hrLookupsService.updateEmploymentProfileTag"
        :delete-api="hrLookupsService.deleteEmploymentProfileTag"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type EmploymentProfileTagDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'Name', label: 'Name', width: '220px', align: 'left' },
  { key: 'Code', label: 'Code', width: '150px', align: 'left' },
  { key: 'Description', label: 'Description', width: '260px', align: 'left' },
  { key: 'IsActive', label: 'Active', width: '100px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'code', label: 'Code', type: 'text', placeholder: "e.g. CLINICAL" },
  { key: 'name', label: 'Name', type: 'text', placeholder: "e.g. Clinical Staff", required: true },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: "Optional description", rows: 4 },
  { key: 'isActive', label: 'Is Active', type: 'checkbox', placeholder: "" }
]

    const initialState = {"code": "", "name": "", "description": "", "isActive": true}

    function toForm(row: EmploymentProfileTagDto) {
      return {
    code: row.Code ?? initialState.code,
    name: row.Name ?? initialState.name,
    description: row.Description ?? initialState.description,
    isActive: row.IsActive ?? initialState.isActive,
      }
    }
    </script>
