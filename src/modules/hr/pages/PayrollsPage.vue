<template>
      <HrCrudPage
        title="Payrolls"
        subtitle="Manage payroll records, earnings, deductions and salary status."
        add-label="+ Add Payroll"
        item-name-singular="Payroll"
        item-name-plural="Payrolls"
        modal-subtitle="Capture salary amounts, payroll period and status."
        search-placeholder="Search payrolls..."
        :columns="columns"
        :fields="fields"
        :initial-state="initialState"
        :list-api="hrLookupsService.getPayrolls"
        :create-api="hrLookupsService.createPayroll"
        :update-api="hrLookupsService.updatePayroll"
        :delete-api="hrLookupsService.deletePayroll"
        :to-form="toForm"
      />
    </template>

    <script setup lang="ts">
    import HrCrudPage from '../components/HrCrudPage.vue'
    import { hrLookupsService, type PayrollDto } from '../hr-lookups.service'
    import type { CrudColumn, CrudField } from '../hr-crud.types'

    const columns: CrudColumn[] = [
  { key: 'Id', label: 'ID', width: '90px', align: 'left' },
  { key: 'EmployeeId', label: 'Employee', width: '110px', align: 'left' },
  { key: 'PayrollMonth', label: 'Payroll Month', width: '140px', align: 'left' },
  { key: 'BasicSalary', label: 'Basic', width: '120px', align: 'right' },
  { key: 'NetSalary', label: 'Net Salary', width: '120px', align: 'right' },
  { key: 'Status', label: 'Status', width: '130px', align: 'left' }
]

    const fields: CrudField[] = [
  { key: 'employeeId', label: 'Employee Id', type: 'number', placeholder: "e.g. 1001", required: true, step: "1" },
  { key: 'payrollMonth', label: 'Payroll Month', type: 'date', placeholder: "", required: true },
  { key: 'basicSalary', label: 'Basic Salary', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'allowances', label: 'Allowances', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'deductions', label: 'Deductions', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'netSalary', label: 'Net Salary', type: 'number', placeholder: "0", step: "0.01" },
  { key: 'status', label: 'Status', type: 'text', placeholder: "e.g. Draft" }
]

    const initialState = {"employeeId": null, "payrollMonth": "", "basicSalary": null, "allowances": null, "deductions": null, "netSalary": null, "status": ""}

    function toForm(row: PayrollDto) {
      return {
    employeeId: row.EmployeeId ?? initialState.employeeId,
    payrollMonth: row.PayrollMonth ?? initialState.payrollMonth,
    basicSalary: row.BasicSalary ?? initialState.basicSalary,
    allowances: row.Allowances ?? initialState.allowances,
    deductions: row.Deductions ?? initialState.deductions,
    netSalary: row.NetSalary ?? initialState.netSalary,
    status: row.Status ?? initialState.status,
      }
    }
    </script>
