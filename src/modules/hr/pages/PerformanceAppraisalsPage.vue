<template>
      <HrCrudPage
        title="Performance Appraisals"
        subtitle="Track review periods, scores, ratings and reviewer notes."
        add-label="+ Add Appraisal"
        item-name-singular="Performance Appraisal"
        item-name-plural="Performance Appraisals"
        modal-subtitle="Capture review period, score and appraisal remarks."
        search-placeholder="Search performance appraisals..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getPerformanceAppraisals"
        :create-api="hrLookupsService.createPerformanceAppraisal"
        :update-api="hrLookupsService.updatePerformanceAppraisal"
        :delete-api="hrLookupsService.deletePerformanceAppraisal"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type PerformanceAppraisalDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'ReviewPeriodFrom', label: 'From', width: '130px', align: 'left' },
  { key: 'ReviewPeriodTo', label: 'To', width: '130px', align: 'left' },
  { key: 'Score', label: 'Score', width: '90px', align: 'right' },
  { key: 'Rating', label: 'Rating', width: '120px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee Id', type: 'number', placeholder: "e.g. 1001", required: true, step: "1" },
  { key: 'reviewPeriodFrom', label: 'Review Period From', type: 'date', placeholder: "", required: true },
  { key: 'reviewPeriodTo', label: 'Review Period To', type: 'date', placeholder: "", required: true },
  { key: 'score', label: 'Score', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'rating', label: 'Rating', type: 'text', placeholder: "e.g. Excellent" },
  { key: 'reviewerUserId', label: 'Reviewer User Id', type: 'text', placeholder: "e.g. hr.admin" },
  { key: 'notes', label: 'Notes', type: 'textarea', placeholder: "Optional notes", rows: 4 }
]

    const initialState = {"employeeId": null, "reviewPeriodFrom": "", "reviewPeriodTo": "", "score": null, "rating": "", "reviewerUserId": "", "notes": ""}

    function toForm(row: PerformanceAppraisalDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    reviewPeriodFrom: row.ReviewPeriodFrom ?? initialState.reviewPeriodFrom,
    reviewPeriodTo: row.ReviewPeriodTo ?? initialState.reviewPeriodTo,
    score: row.Score ?? initialState.score,
    rating: row.Rating ?? initialState.rating,
    reviewerUserId: row.ReviewerUserId ?? initialState.reviewerUserId,
    notes: row.Notes ?? initialState.notes,
      }
    }
    </script>
