import apiClient from './client'
import { buildQueryString } from '@/lib/utils'
import type { ApiResponse } from '@/lib/types'
import type {
  BonSortie,
  BonSortieFilters,
  BonSortiePayload,
} from '@/lib/bons-sortie.types'
import { extractPaginatedResponse } from './pagination'
import { idempotencyHeaders } from '@/lib/idempotency'

export interface BonSortieCorrectionPayload extends BonSortiePayload {
  motif_correction: string
}

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
  corrigerAdmin: async (
    id: number,
    payload: BonSortieCorrectionPayload,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.put<ApiResponse<BonSortie>>(
      `/admin/corrections/bons-sortie/${id}`,
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  valider: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<BonSortie>>(
      `/logistique/bons-sortie/${id}/valider`,
    )
    return data.data
  },
}