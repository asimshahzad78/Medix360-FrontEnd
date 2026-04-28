<template>
      <HrCrudPage
        title="Leave Balances"
        subtitle="Maintain opening, earned, availed and net leave balances per employee."
        add-label="+ Add Leave Balance"
        item-name-singular="Leave Balance"
        item-name-plural="Leave Balances"
        modal-subtitle="Keep leave entitlement and balance records updated."
        search-placeholder="Search leave balances..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getLeaveBalances"
        :create-api="hrLookupsService.createLeaveBalance"
        :update-api="hrLookupsService.updateLeaveBalance"
        :delete-api="hrLookupsService.deleteLeaveBalance"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type LeaveBalanceDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'LeaveTypeId', label: 'Leave Type', width: '110px', align: 'left' },
  { key: 'OpeningBalance', label: 'Opening', width: '110px', align: 'right' },
  { key: 'Availed', label: 'Availed', width: '110px', align: 'right' },
  { key: 'Balance', label: 'Balance', width: '110px', align: 'right' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee', type: 'lookup', lookupKind: 'employee', placeholder: "Search employee", required: true },
  { key: 'leaveTypeId', label: 'Leave Type', type: 'lookup', lookupKind: 'leaveType', placeholder: "Search leave type", required: true },
  { key: 'openingBalance', label: 'Opening Balance', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'earned', label: 'Earned', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'availed', label: 'Availed', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'balance', label: 'Balance', type: 'number', placeholder: "0", step: "0.01" }
]

    const initialState = {"employeeId": null, "leaveTypeId": null, "openingBalance": null, "earned": null, "availed": null, "balance": null}

    function toForm(row: LeaveBalanceDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    leaveTypeId: row.LeaveTypeId ?? initialState.leaveTypeId,
    openingBalance: row.OpeningBalance ?? initialState.openingBalance,
    earned: row.Earned ?? initialState.earned,
    availed: row.Availed ?? initialState.availed,
    balance: row.Balance ?? initialState.balance,
      }
    }
    </script>
