// src/lib/api/production.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse, BonProduction, BpSession } from '../types'
import { buildQueryString } from '../utils'

export interface BpFilters {
  location_id?: number
  statut?: string
  produit_id?: number
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
  [key: string]: unknown
}

export const productionApi = {
  list: async (filters: BpFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<BonProduction>>(
      `/production/bons-production${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<BonProduction>>(`/production/bons-production/${id}`)
    return data.data
  },

  create: async (payload: {
    date: string
    location_id: number
    produit_id: number
    machine_production: string
    quantite_cible: number
  }) => {
    const { data } = await apiClient.post<ApiResponse<BonProduction>>('/production/bons-production', payload)
    return data.data
  },

  cloture: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<BonProduction>>(`/production/bons-production/${id}/cloture`)
    return data.data
  },

  annuler: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<null>>(`/production/bons-production/${id}/annuler`)
    return data
  },

  createSession: async (bpId: number, payload: {
    date_session: string
    machine_production: string
    cout_electricite?: number
  }) => {
    const { data } = await apiClient.post<ApiResponse<BpSession>>(
      `/production/bons-production/${bpId}/sessions`,
      payload
    )
    return data.data
  },

  validerSession: async (sessionId: number) => {
    const { data } = await apiClient.post<ApiResponse<BpSession>>(
      `/production/sessions/${sessionId}/valider`
    )
    return data.data
  },
}