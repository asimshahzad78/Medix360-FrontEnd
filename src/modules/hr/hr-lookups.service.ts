// src/modules/hr/hr-lookups.service.ts
import { api } from '@/services/api'

export type DepartmentDto = {
  Id: number
  Name: string
  Code?: string | null
  IsActive?: boolean
}

export type SubDepartmentDto = {
  Id: number
  DepartmentId: number
  Name: string
  Code?: string | null
  IsActive?: boolean
}

export type DesignationDto = {
  Id: number
  Name: string
  Code?: string | null
  IsActive?: boolean
}

export type PagedResult<T> = {
  items: T[]
  totalCount: number
}

export const hrLookupsService = {
  // ---------------- Departments ----------------
  async getDepartments(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<DepartmentDto>> {
    const { data } = await api.get<PagedResult<DepartmentDto>>('/hr/departments', { params })
    return data
  },

  async createDepartment(payload: { name: string; code?: string | null }): Promise<void> {
    await api.post('/hr/departments', payload)
  },

  async updateDepartment(id: number, payload: { name: string; code?: string | null }): Promise<void> {
    await api.put(`/hr/departments/${id}`, payload)
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/hr/departments/${id}`)
  },

  // ---------------- SubDepartments ----------------
  async getSubDepartments(params?: {
    departmentId?: number
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<SubDepartmentDto>> {
    const { data } = await api.get<PagedResult<SubDepartmentDto>>('/hr/subdepartments', { params })
    return data
  },

  async createSubDepartment(payload: {
    departmentId: number
    name: string
    code?: string | null
  }): Promise<void> {
    await api.post('/hr/subdepartments', payload)
  },

  async updateSubDepartment(
    id: number,
    payload: { departmentId: number; name: string; code?: string | null },
  ): Promise<void> {
    await api.put(`/hr/subdepartments/${id}`, payload)
  },

  async deleteSubDepartment(id: number): Promise<void> {
    await api.delete(`/hr/subdepartments/${id}`)
  },

  // ---------------- Designations ----------------
  async getDesignations(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PagedResult<DesignationDto>> {
    const { data } = await api.get<PagedResult<DesignationDto>>('/hr/designations', { params })
    return data
  },

  async createDesignation(payload: { name: string; code?: string | null }): Promise<void> {
    await api.post('/hr/designations', payload)
  },

  async updateDesignation(id: number, payload: { name: string; code?: string | null }): Promise<void> {
    await api.put(`/hr/designations/${id}`, payload)
  },

  async deleteDesignation(id: number): Promise<void> {
    await api.delete(`/hr/designations/${id}`)
  },
}
