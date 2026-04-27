<template>
      <HrCrudPage
        title="Training Enrollments"
        subtitle="Track courses, providers, CME hours and expiry of completed training."
        add-label="+ Add Training"
        item-name-singular="Training Enrollment"
        item-name-plural="Training Enrollments"
        modal-subtitle="Store employee training, provider and renewal details."
        search-placeholder="Search training enrollments..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getTrainingEnrollments"
        :create-api="hrLookupsService.createTrainingEnrollment"
        :update-api="hrLookupsService.updateTrainingEnrollment"
        :delete-api="hrLookupsService.deleteTrainingEnrollment"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type TrainingEnrollmentDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'CourseName', label: 'Course', width: '220px', align: 'left' },
  { key: 'Provider', label: 'Provider', width: '170px', align: 'left' },
  { key: 'ExpiryDate', label: 'Expiry Date', width: '140px', align: 'left' },
  { key: 'Status', label: 'Status', width: '130px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee Id', type: 'number', placeholder: "e.g. 1001", required: true, step: "1" },
  { key: 'courseName', label: 'Course Name', type: 'text', placeholder: "e.g. BLS Training", required: true },
  { key: 'provider', label: 'Provider', type: 'text', placeholder: "e.g. DHA" },
  { key: 'startDate', label: 'Start Date', type: 'date', placeholder: "" },
  { key: 'endDate', label: 'End Date', type: 'date', placeholder: "" },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: "" },
  { key: 'cmeHours', label: 'CME Hours', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'status', label: 'Status', type: 'text', placeholder: "e.g. Completed" },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: "Optional notes", rows: 4 }
]

    const initialState = {"employeeId": null, "courseName": "", "provider": "", "startDate": "", "endDate": "", "expiryDate": "", "cmeHours": null, "status": "", "notes": ""}

    function toForm(row: TrainingEnrollmentDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    courseName: row.CourseName ?? initialState.courseName,
    provider: row.Provider ?? initialState.provider,
    startDate: row.StartDate ?? initialState.startDate,
    endDate: row.EndDate ?? initialState.endDate,
    expiryDate: row.ExpiryDate ?? initialState.expiryDate,
    cmeHours: row.CmeHours ?? initialState.cmeHours,
    status: row.Status ?? initialState.status,
    notes: row.Notes ?? initialState.notes,
      }
    }
    </script>
