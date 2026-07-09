import apiClient from './client'
import { buildQueryString } from '@/lib/utils'
import type { ApiResponse } from '@/lib/types'
import type {
  VenteDirecte,
  VenteDirecteFilters,
  VenteDirectePayload,
  VentesDirectesPage,
} from '@/lib/ventes-directes.types'

export const ventesDirectesApi = {
  list: async (filters: VenteDirecteFilters = {}) => {
    const { data } = await apiClient.get<VentesDirectesPage>(
      `/commercial/ventes-directes${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}`
    )
    return data.data
  },

  create: async (payload: VenteDirectePayload) => {
    const { data } = await apiClient.post<ApiResponse<VenteDirecte>>(
      '/commercial/ventes-directes',
      payload
    )
    return data.data
  },

  update: async (id: number, payload: Partial<VenteDirectePayload>) => {
    const { data } = await apiClient.put<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}`,
      payload
    )
    return data.data
  },

  valider: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}/valider`
    )
    return data.data
  },

  annuler: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<VenteDirecte>>(
      `/commercial/ventes-directes/${id}/annuler`
    )
    return data.data
  },
}