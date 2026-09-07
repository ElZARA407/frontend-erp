import apiClient from './client'
import { idempotencyHeaders } from '../idempotency'
import type { ApiResponse } from '../types'
import type {
  Facture,
  FactureCreatePayload,
  FactureFilters,
  FacturePreview,
  FacturePreviewPayload,
  FacturePayerPayload,
} from '../factures.types'
import { buildQueryString } from '../utils'
import { extractPaginatedResponse } from './pagination'

export const facturesApi = {
  list: async (filters: FactureFilters = {}) => {
    const { data } = await apiClient.get(`/finance/factures${buildQueryString(filters)}`)
    return extractPaginatedResponse<Facture>(data)
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<Facture>>(`/finance/factures/${id}`)
    return data.data
  },

  preview: async (payload: FacturePreviewPayload) => {
    const { data } = await apiClient.post<ApiResponse<FacturePreview>>(
      '/finance/factures/preview',
      payload,
    )

    return data.data
  },

  creerDepuisLivraison: async (
    payload: FactureCreatePayload,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.post<ApiResponse<Facture>>(
      '/finance/factures',
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  payer: async (
    id: number,
    payload: FacturePayerPayload,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.post<ApiResponse<Facture>>(
      `/finance/factures/${id}/payer`,
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  annuler: async (id: number, idempotencyKey: string) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      `/finance/factures/${id}/annuler`,
      undefined,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data
  },

  enRetard: async () => {
    const { data } = await apiClient.get<ApiResponse<Facture[]>>(
      '/finance/factures/retards',
    )

    return data.data
  },
}