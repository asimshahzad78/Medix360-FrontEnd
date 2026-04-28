<template>
      <HrCrudPage
        title="Leave Requests"
        subtitle="Manage leave applications, dates, approvals and request status."
        add-label="+ Add Leave Request"
        item-name-singular="Leave Request"
        item-name-plural="Leave Requests"
        modal-subtitle="Capture leave period, reason and approval trail."
        search-placeholder="Search leave requests..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getLeaveRequests"
        :create-api="hrLookupsService.createLeaveRequest"
        :update-api="hrLookupsService.updateLeaveRequest"
        :delete-api="hrLookupsService.deleteLeaveRequest"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type LeaveRequestDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'LeaveTypeId', label: 'Leave Type', width: '110px', align: 'left' },
  { key: 'FromDate', label: 'From', width: '130px', align: 'left' },
  { key: 'ToDate', label: 'To', width: '130px', align: 'left' },
  { key: 'Status', label: 'Status', width: '130px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee', type: 'lookup', lookupKind: 'employee', placeholder: "Search employee", required: true },
  { key: 'leaveTypeId', label: 'Leave Type', type: 'lookup', lookupKind: 'leaveType', placeholder: "Search leave type", required: true },
  { key: 'fromDate', label: 'From Date', type: 'date', placeholder: "", required: true },
  { key: 'toDate', label: 'To Date', type: 'date', placeholder: "", required: true },
  { key: 'days', label: 'Days', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'reason', label: 'Reason', type: 'textarea', placeholder: "Leave reason", rows: 4 },
  { key: 'status', label: 'Status', type: 'select', placeholder: "e.g. Pending", options: [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Cancelled', label: 'Cancelled' },
  ] },
  { key: 'approvedByUserId', label: 'Approved By User Id', type: 'text', placeholder: "e.g. admin" },
  { key: 'approvedAt', label: 'Approved At', type: 'datetime-local', placeholder: "" }
]

    const initialState = {"employeeId": null, "leaveTypeId": null, "fromDate": "", "toDate": "", "days": null, "reason": "", "status": "", "approvedByUserId": "", "approvedAt": ""}

    function toForm(row: LeaveRequestDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    leaveTypeId: row.LeaveTypeId ?? initialState.leaveTypeId,
    fromDate: row.FromDate ?? initialState.fromDate,
    toDate: row.ToDate ?? initialState.toDate,
    days: row.Days ?? initialState.days,
    reason: row.Reason ?? initialState.reason,
    status: row.Status ?? initialState.status,
    approvedByUserId: row.ApprovedByUserId ?? initialState.approvedByUserId,
    approvedAt: row.ApprovedAt ?? initialState.approvedAt,
      }
    }
    </script>
