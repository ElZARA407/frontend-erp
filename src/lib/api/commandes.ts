// src/lib/api/commandes.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Commande } from '../types'
import { buildQueryString } from '../utils'

export interface CommandeFilters {
  client_id?: number
  statut?: string
  location_id?: number
  en_retard?: boolean
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
  [key: string]: unknown
}

export interface CreateCommandePayload {
  client_id: number
  date: string
  date_livraison_prevue?: string
  location_id: number
  echeance: number
  lignes: Array<{
    classement_id: number
    quantite: number
    prix_unitaire: number
  }>
}

export const commandesApi = {
  list: async (filters: CommandeFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Commande>>(
      `/commercial/commandes${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Commande>>(`/commercial/commandes/${id}`)
    return data.data
  },

  create: async (payload: CreateCommandePayload) => {
    const { data } = await apiClient.post<ApiResponse<Commande>>('/commercial/commandes', payload)
    return data.data
  },

  update: async (id: number, payload: Partial<Commande>) => {
    const { data } = await apiClient.put<ApiResponse<Commande>>(`/commercial/commandes/${id}`, payload)
    return data.data
  },

  duplicate: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Commande>>(`/commercial/commandes/${id}/duplicate`)
    return data.data
  },
}