import apiClient from './client'
import type { ApiResponse, Livraison } from '../types'
import { buildQueryString } from '../utils'
import { extractPaginatedResponse } from './pagination'

export interface LivraisonFilters {
  search?: string
  client_id?: number
  statut?: string
  source_type?: string
  est_facturee?: boolean
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
  [key: string]: unknown
  sort_by?: string
sort_dir?: 'asc' | 'desc'
}

export interface LivraisonLinePayload {
  ligne_commande_id?: number | null
  ligne_vente_directe_id?: number | null
  produit_id: number
  classement_id: number
  quantite_livree: number
}

export interface LivraisonCreatePayload {
  source_type: 'commande' | 'vente_directe'
  source_id: number
  client_id: number
  reference_bc?: string | null
  chauffeur?: string | null
  vehicule?: string | null
  observations?: string | null
  date_livraison: string | null
  lignes: LivraisonLinePayload[]
}

export interface LivraisonUpdatePayload {
  reference_bc?: string | null
  chauffeur?: string | null
  vehicule?: string | null
  observations?: string | null
  date_livraison?: string | null
}

export const livraisonsApi = {
  list: async (filters: LivraisonFilters = {}) => {
    const { data } = await apiClient.get(`/logistique/livraisons${buildQueryString(filters)}`)
    return extractPaginatedResponse<Livraison>(data)
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Livraison>>(`/logistique/livraisons/${id}`)
    return data.data
  },

  create: async (payload: LivraisonCreatePayload) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(
      '/logistique/livraisons',
      payload,
    )
    return data.data
  },

  update: async (id: number, payload: LivraisonUpdatePayload) => {
    const { data } = await apiClient.put<ApiResponse<Livraison>>(
      `/logistique/livraisons/${id}`,
      payload,
    )
    return data.data
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/logistique/livraisons/${id}`)
    return data
  },

  confirmer: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(
      `/logistique/livraisons/${id}/confirmer`,
    )
    return data.data
  },

  annuler: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(
      `/logistique/livraisons/${id}/annuler`,
    )
    return data.data
  },
}