// src/lib/api/rh.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse } from '@/lib/types'
import { buildQueryString } from '@/lib/utils'
import type {
  RhEmploye,
  RhEmployeFilters,
  RhEmployePayload,
  RhEmployesPage,
  RhPoste,
  RhPosteFilters,
  RhPostePayload,
} from '@/lib/rh.types'

export const rhApi = {
  listPostes: async (filters: RhPosteFilters = {}) => {
    const { data } = await apiClient.get<ApiResponse<RhPoste[]>>(
      `/rh/postes${buildQueryString(filters)}`
    )
    return data.data
  },

  getPoste: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<RhPoste>>(`/rh/postes/${id}`)
    return data.data
  },

  createPoste: async (payload: RhPostePayload) => {
    const { data } = await apiClient.post<ApiResponse<RhPoste>>('/rh/postes', payload)
    return data.data
  },

  updatePoste: async (id: number, payload: Partial<RhPostePayload>) => {
    const { data } = await apiClient.put<ApiResponse<RhPoste>>(`/rh/postes/${id}`, payload)
    return data.data
  },

  deletePoste: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/rh/postes/${id}`)
    return data
  },

  listEmployes: async (filters: RhEmployeFilters = {}) => {
    const { data } = await apiClient.get<RhEmployesPage>(`/rh/employes${buildQueryString(filters)}`)
    return data
  },

  getEmploye: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<RhEmploye>>(`/rh/employes/${id}`)
    return data.data
  },

  createEmploye: async (payload: RhEmployePayload) => {
    const { data } = await apiClient.post<ApiResponse<RhEmploye>>('/rh/employes', payload)
    return data.data
  },

  updateEmploye: async (id: number, payload: Partial<RhEmployePayload>) => {
    const { data } = await apiClient.put<ApiResponse<RhEmploye>>(`/rh/employes/${id}`, payload)
    return data.data
  },

  deleteEmploye: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/rh/employes/${id}`)
    return data
  },
}