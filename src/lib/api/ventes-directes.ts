import apiClient from './client'
import { idempotencyHeaders } from '../idempotency'
import { buildQueryString } from '@/lib/utils'
import type { ApiResponse } from '@/lib/types'
import type {
  VenteDirecte,
  VenteDirecteFilters,
  VenteDirectePayload,
  VentesDirectesPage,
} from '@/lib/ventes-directes.types'

export interface VenteDirecteCorrectionAdminPayload
  extends VenteDirectePayload {
  motif_correction: string
}

export const ventesDirectesApi = {
  list: async (filters: VenteDirecteFilters = {}) => {
    const { data } = await apiClient.get<VentesDirectesPage>(
      `/commercial/ventes-directes${buildQueryString(filters)}`,
    )

    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}`,
    )

    return data.data
  },

  create: async (payload: VenteDirectePayload, idempotencyKey: string) => {
    const { data } = await apiClient.post<ApiResponse<VenteDirecte>>(
      '/commercial/ventes-directes',
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  update: async (id: number, payload: Partial<VenteDirectePayload>) => {
    const { data } = await apiClient.put<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}`,
      payload,
    )

    return data.data
  },

  corrigerAdmin: async (
    id: number,
    payload: VenteDirecteCorrectionAdminPayload,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.put<ApiResponse<VenteDirecte>>(
      `/admin/corrections/ventes-directes/${id}`,
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  valider: async (id: number, idempotencyKey: string) => {
    const { data } = await apiClient.post<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}/valider`,
      undefined,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  annuler: async (id: number, idempotencyKey: string) => {
    const { data } = await apiClient.post<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}/annuler`,
      undefined,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },
}