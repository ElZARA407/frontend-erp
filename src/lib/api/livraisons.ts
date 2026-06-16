// src/lib/api/livraisons.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Livraison } from '../types'
import { buildQueryString } from '../utils'

export const livraisonsApi = {
  list: async (filters: {
    client_id?: number
    statut?: string
    source_type?: string
    per_page?: number
    page?: number
  } = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Livraison>>(
      `/logistique/livraisons${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Livraison>>(`/logistique/livraisons/${id}`)
    return data.data
  },

  confirmer: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(`/logistique/livraisons/${id}/confirmer`)
    return data.data
  },
}