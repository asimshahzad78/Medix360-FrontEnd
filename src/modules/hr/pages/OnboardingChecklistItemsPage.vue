<template>
      <HrCrudPage
        title="Onboarding Checklist Items"
        subtitle="Manage standard onboarding steps, sequence and required flags."
        add-label="+ Add Checklist Item"
        item-name-singular="Onboarding Checklist Item"
        item-name-plural="Onboarding Checklist Items"
        modal-subtitle="Create standard onboarding checklist items used by HR."
        search-placeholder="Search onboarding checklist items..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getOnboardingChecklistItems"
        :create-api="hrLookupsService.createOnboardingChecklistItem"
        :update-api="hrLookupsService.updateOnboardingChecklistItem"
        :delete-api="hrLookupsService.deleteOnboardingChecklistItem"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type OnboardingChecklistItemDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'Name', label: 'Name', width: '220px', align: 'left' },
  { key: 'Code', label: 'Code', width: '150px', align: 'left' },
  { key: 'SequenceNo', label: 'Sequence', width: '100px', align: 'right' },
  { key: 'IsRequired', label: 'Required', width: '100px', align: 'left' },
  { key: 'IsActive', label: 'Active', width: '90px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'code', label: 'Code', type: 'text', placeholder: "e.g. DOC-01" },
  { key: 'name', label: 'Name', type: 'text', placeholder: "e.g. Submit CNIC copy", required: true },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: "Optional description", rows: 4 },
  { key: 'sequenceNo', label: 'Sequence No', type: 'number', placeholder: "1", step: "1" },
  { key: 'isRequired', label: 'Is Required', type: 'checkbox', placeholder: "" },
  { key: 'isActive', label: 'Is Active', type: 'checkbox', placeholder: "" }
]

    const initialState = {"code": "", "name": "", "description": "", "sequenceNo": null, "isRequired": true, "isActive": true}

    function toForm(row: OnboardingChecklistItemDto) {
      return {
    code: row.Code ?? initialState.code,
    name: row.Name ?? initialState.name,
    description: row.Description ?? initialState.description,
    sequenceNo: row.SequenceNo ?? initialState.sequenceNo,
    isRequired: row.IsRequired ?? initialState.isRequired,
    isActive: row.IsActive ?? initialState.isActive,
      }
    }
    </script>
