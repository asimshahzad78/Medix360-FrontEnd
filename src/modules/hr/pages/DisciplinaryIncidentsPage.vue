<template>
      <HrCrudPage
        title="Disciplinary Incidents"
        subtitle="Track staff incidents, severity, actions taken and status."
        add-label="+ Add Incident"
        item-name-singular="Disciplinary Incident"
        item-name-plural="Disciplinary Incidents"
        modal-subtitle="Record incident type, severity and follow-up action."
        search-placeholder="Search disciplinary incidents..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getDisciplinaryIncidents"
        :create-api="hrLookupsService.createDisciplinaryIncident"
        :update-api="hrLookupsService.updateDisciplinaryIncident"
        :delete-api="hrLookupsService.deleteDisciplinaryIncident"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type DisciplinaryIncidentDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'IncidentDate', label: 'Incident Date', width: '140px', align: 'left' },
  { key: 'IncidentType', label: 'Type', width: '170px', align: 'left' },
  { key: 'Severity', label: 'Severity', width: '130px', align: 'left' },
  { key: 'Status', label: 'Status', width: '130px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee Id', type: 'number', placeholder: "e.g. 1001", required: true, step: "1" },
  { key: 'incidentDate', label: 'Incident Date', type: 'date', placeholder: "", required: true },
  { key: 'incidentType', label: 'Incident Type', type: 'text', placeholder: "e.g. Late Reporting", required: true },
  { key: 'severity', label: 'Severity', type: 'text', placeholder: "e.g. High" },
  { key: 'actionTaken', label: 'Action Taken', type: 'text', placeholder: "e.g. Warning" },
  { key: 'status', label: 'Status', type: 'text', placeholder: "e.g. Open" },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: "Optional notes", rows: 4 }
]

    const initialState = {"employeeId": null, "incidentDate": "", "incidentType": "", "severity": "", "actionTaken": "", "status": "", "notes": ""}

    function toForm(row: DisciplinaryIncidentDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    incidentDate: row.IncidentDate ?? initialState.incidentDate,
    incidentType: row.IncidentType ?? initialState.incidentType,
    severity: row.Severity ?? initialState.severity,
    actionTaken: row.ActionTaken ?? initialState.actionTaken,
    status: row.Status ?? initialState.status,
    notes: row.Notes ?? initialState.notes,
      }
    }
    </script>
