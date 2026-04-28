<template>
      <HrCrudPage
        title="Credentials"
        subtitle="Manage staff licenses, certificates and other credential records."
        add-label="+ Add Credential"
        item-name-singular="Credential"
        item-name-plural="Credentials"
        modal-subtitle="Store credential issue, expiry and tracking details."
        search-placeholder="Search credentials..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getCredentials"
        :create-api="hrLookupsService.createCredential"
        :update-api="hrLookupsService.updateCredential"
        :delete-api="hrLookupsService.deleteCredential"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type CredentialDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'Name', label: 'Name', width: '220px', align: 'left' },
  { key: 'CredentialNumber', label: 'Credential #', width: '160px', align: 'left' },
  { key: 'ExpiryDate', label: 'Expiry Date', width: '140px', align: 'left' },
  { key: 'Status', label: 'Status', width: '130px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee', type: 'lookup', lookupKind: 'employee', placeholder: "Search employee", required: true },
  { key: 'code', label: 'Code', type: 'text', placeholder: "e.g. DHA" },
  { key: 'name', label: 'Name', type: 'text', placeholder: "e.g. DHA License", required: true },
  { key: 'credentialNumber', label: 'Credential Number', type: 'text', placeholder: "e.g. ABC-123" },
  { key: 'issuedBy', label: 'Issued By', type: 'text', placeholder: "e.g. DHA" },
  { key: 'issueDate', label: 'Issue Date', type: 'date', placeholder: "" },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: "" },
  { key: 'status', label: 'Status', type: 'select', placeholder: "e.g. Active", options: [
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Suspended', label: 'Suspended' },
    { value: 'PendingRenewal', label: 'Pending Renewal' },
  ] },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: "Optional notes", rows: 4 }
]

    const initialState = {"employeeId": null, "code": "", "name": "", "credentialNumber": "", "issuedBy": "", "issueDate": "", "expiryDate": "", "status": "", "notes": ""}

    function toForm(row: CredentialDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    code: row.Code ?? initialState.code,
    name: row.Name ?? initialState.name,
    credentialNumber: row.CredentialNumber ?? initialState.credentialNumber,
    issuedBy: row.IssuedBy ?? initialState.issuedBy,
    issueDate: row.IssueDate ?? initialState.issueDate,
    expiryDate: row.ExpiryDate ?? initialState.expiryDate,
    status: row.Status ?? initialState.status,
    notes: row.Notes ?? initialState.notes,
      }
    }
    </script>
