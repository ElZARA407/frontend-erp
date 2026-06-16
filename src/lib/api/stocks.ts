// src/lib/api/stocks.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Stock, MouvementStock } from '../types'
import { buildQueryString } from '../utils'

export const stocksApi = {
  list: async (filters: { location_id?: number; entite_type?: string; per_page?: number; page?: number } = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Stock>>(
      `/stocks/${buildQueryString(filters)}`
    )
    return data
  },

  ruptures: async () => {
    const { data } = await apiClient.get<ApiResponse<Stock[]>>('/stocks/ruptures')
    return data.data
  },

  parLocation: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Stock[]>>(`/stocks/par-location/${id}`)
    return data.data
  },

  mouvements: async (filters: {
    location_id?: number
    entite_type?: string
    entite_id?: number
    type?: string
    date_debut?: string
    date_fin?: string
    per_page?: number
    page?: number
  } = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<MouvementStock>>(
      `/stocks/mouvements${buildQueryString(filters)}`
    )
    return data
  },
}