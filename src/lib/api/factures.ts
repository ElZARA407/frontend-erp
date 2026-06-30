// src/lib/api/factures.ts
import apiClient from './client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { Facture } from '../factures.types'
import { buildQueryString } from '../utils'

export const facturesApi = {
  list: async (filters: {
    client_id?: number
    statut?: string
    en_retard?: boolean
    date_debut?: string
    date_fin?: string
    per_page?: number
    page?: number
  } = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Facture>>(
      `/finance/factures${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Facture>>(`/finance/factures/${id}`)
    return data.data
  },

  creerDepuisLivraison: async (livraison_id: number) => {
    const { data } = await apiClient.post<ApiResponse<Facture>>('/finance/factures', { livraison_id })
    return data.data
  },

  payer: async (id: number, mode_paiement: string) => {
    const { data } = await apiClient.post<ApiResponse<Facture>>(`/finance/factures/${id}/payer`, { mode_paiement })
    return data.data
  },

  annuler: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<null>>(`/finance/factures/${id}/annuler`)
    return data
  },

  enRetard: async () => {
    const { data } = await apiClient.get<ApiResponse<Facture[]>>('/finance/factures/retards')
    return data.data
  },
}