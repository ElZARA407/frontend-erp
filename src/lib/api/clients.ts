// src/lib/api/clients.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Client } from '../types'
import { buildQueryString } from '../utils'
import { extractPaginatedResponse } from './pagination'

export interface ClientFilters {
  search?: string
  actif?: boolean
  per_page?: number
  page?: number
  [key: string]: unknown
}

export const clientsApi = {
  list: async (filters: ClientFilters = {}) => {
    const { data } = await apiClient.get(`/commercial/clients${buildQueryString(filters)}`)
    return extractPaginatedResponse<Client>(data)
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Client>>(`/commercial/clients/${id}`)
    return data.data
  },

  create: async (payload: Partial<Client>) => {
    const { data } = await apiClient.post<ApiResponse<Client>>('/commercial/clients', payload)
    return data.data
  },

  update: async (id: number, payload: Partial<Client>) => {
    const { data } = await apiClient.put<ApiResponse<Client>>(`/commercial/clients/${id}`, payload)
    return data.data
  },

  delete: async (id: number) => {
    await apiClient.delete(`/commercial/clients/${id}`)
  },

  encours: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<unknown>>(`/commercial/clients/${id}/encours`)
    return data.data
  },
}