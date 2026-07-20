import apiClient from './client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Facture,
  FactureCreatePayload,
  FactureFilters,
  FacturePreview,
  FacturePreviewPayload,
  FacturePayerPayload,
} from '../factures.types'
import { buildQueryString } from '../utils'

export const facturesApi = {
  list: async (filters: FactureFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<Facture>>(
      `/finance/factures${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Facture>>(`/finance/factures/${id}`)
    return data.data
  },

  preview: async (payload: FacturePreviewPayload) => {
    const { data } = await apiClient.post<ApiResponse<FacturePreview>>(
      '/finance/factures/preview',
      payload
    )
    return data.data
  },

  creerDepuisLivraison: async (payload: FactureCreatePayload) => {
    const { data } = await apiClient.post<ApiResponse<Facture>>('/finance/factures', payload)
    return data.data
  },

  payer: async (id: number, payload: FacturePayerPayload) => {
    const { data } = await apiClient.post<ApiResponse<Facture>>(`/finance/factures/${id}/payer`, payload)
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