// src/lib/api/achats.ts
import apiClient from './client'
import type { ApiResponse, JournalAchat } from '../types'
import { buildQueryString } from '../utils'
import { extractPaginatedResponse } from './pagination'

export interface AchatFilters {
  search?: string
  fournisseur_id?: number
  location_id?: number
  statut?: string
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
  [key: string]: unknown
}

export const achatsApi = {
  list: async (filters: AchatFilters = {}) => {
    const { data } = await apiClient.get(`/achats/bons-reception${buildQueryString(filters)}`)
    return extractPaginatedResponse<JournalAchat>(data)
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<JournalAchat>>(`/achats/bons-reception/${id}`)
    return data.data
  },

  create: async (payload: {
    fournisseur_id: number
    date: string
    location_id: number
    vehicule?: string
    observations?: string
    lignes: Array<{
      matiere_id: number
      quantite: number
      prix_unitaire: number
    }>
  }) => {
    const { data } = await apiClient.post<ApiResponse<JournalAchat>>('/achats/bons-reception', payload)
    return data.data
  },

  valider: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<JournalAchat>>(`/achats/bons-reception/${id}/valider`)
    return data.data
  },
}