import apiClient from './client'
import { buildQueryString } from '@/lib/utils'
import type { ApiResponse } from '@/lib/types'
import type {
  BonSortie,
  BonSortieFilters,
  BonSortiePayload,
} from '@/lib/bons-sortie.types'
import { extractPaginatedResponse } from './pagination'

export const bonsSortieApi = {
  list: async (filters: BonSortieFilters = {}) => {
    const { data } = await apiClient.get(
      `/logistique/bons-sortie${buildQueryString({
        ...filters,
        search: filters.search?.trim() || undefined,
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 10,
      })}`,
    )

    return extractPaginatedResponse<BonSortie>(data)
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<BonSortie>>(
      `/logistique/bons-sortie/${id}`,
    )
    return data.data
  },

  create: async (payload: BonSortiePayload) => {
    const { data } = await apiClient.post<ApiResponse<BonSortie>>(
      '/logistique/bons-sortie',
      payload,
    )
    return data.data
  },

  update: async (id: number, payload: Partial<BonSortiePayload>) => {
    const { data } = await apiClient.put<ApiResponse<BonSortie>>(
      `/logistique/bons-sortie/${id}`,
      payload,
    )
    return data.data
  },

  delete: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/logistique/bons-sortie/${id}`,
    )
    return data
  },

  valider: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<BonSortie>>(
      `/logistique/bons-sortie/${id}/valider`,
    )
    return data.data
  },
}