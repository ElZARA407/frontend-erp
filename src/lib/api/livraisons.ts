import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Livraison } from '../types'
import { buildQueryString } from '../utils'

export interface LivraisonFilters {
  client_id?: number
  statut?: string
  source_type?: string
  est_facturee?: boolean
  per_page?: number
  page?: number
  [key: string]: unknown
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

export const livraisonsApi = {
  list: async (filters: LivraisonFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Livraison>>(
      `/logistique/livraisons${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Livraison>>(`/logistique/livraisons/${id}`)
    return data.data
  },

  create: async (payload: LivraisonCreatePayload) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(
      '/logistique/livraisons',
      payload
    )
    return data.data
  },

  confirmer: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(`/logistique/livraisons/${id}/confirmer`)
    return data.data
  },

  annuler: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Livraison>>(`/logistique/livraisons/${id}/annuler`)
    return data.data
  },
}