import apiClient from './client'
import { idempotencyHeaders } from '../idempotency'
import type { ApiResponse, PaginatedResponse, Commande } from '../types'
import { buildQueryString } from '../utils'

export interface CommandeFilters {
  search?: string
  client_id?: number
  statut?: string
  location_id?: number
  en_retard?: boolean
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface CommandeLinePayload {
  id?: number
  produit_id: number
  classement_id: number
  quantite: number
  prix_unitaire: number
}

export interface CreateCommandePayload {
  client_id: number
  date: string
  date_livraison_prevue?: string
  location_id: number
  echeance: number
  lignes: CommandeLinePayload[]
}

export type UpdateCommandePayload = Partial<
  Omit<CreateCommandePayload, 'lignes'>
> & {
  lignes?: CommandeLinePayload[]
}

export interface CommandeCorrectionAdminPayload extends CreateCommandePayload {
  motif_correction: string
}

export const commandesApi = {
  list: async (filters: CommandeFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Commande>>(
      `/commercial/commandes${buildQueryString(filters)}`,
    )

    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Commande>>(
      `/commercial/commandes/${id}`,
    )

    return data.data
  },

  create: async (payload: CreateCommandePayload) => {
    const { data } = await apiClient.post<ApiResponse<Commande>>(
      '/commercial/commandes',
      payload,
    )

    return data.data
  },

  update: async (id: number, payload: UpdateCommandePayload) => {
    const { data } = await apiClient.put<ApiResponse<Commande>>(
      `/commercial/commandes/${id}`,
      payload,
    )

    return data.data
  },

  corrigerAdmin: async (
    id: number,
    payload: CommandeCorrectionAdminPayload,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.put<ApiResponse<Commande>>(
      `/admin/corrections/commandes/${id}`,
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  duplicate: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<Commande>>(
      `/commercial/commandes/${id}/duplicate`,
    )

    return data.data
  },
  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/commercial/commandes/${id}`,
    )

    return data
  },
}