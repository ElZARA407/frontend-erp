import apiClient from './client'
import { buildQueryString } from '@/lib/utils'
import type { ApiResponse, PaginatedResponse } from '@/lib/types'
import type {
  BonTransformation,
  BonTransformationPayload,
  BtEmployePayload,
  BtEvenementPayload,
  BtMatierePayload,
  BtSessionPayload,
  RecyclageFilters,
  RecyclagePage,
  RecyclageSession,
} from '@/lib/recyclage.types'

export const recyclageApi = {
  list: async (filters: RecyclageFilters = {}) => {
    const { data } = await apiClient.get<RecyclagePage>(
      `/recyclage/bons-transformation${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<BonTransformation>>(
      `/recyclage/bons-transformation/${id}`
    )
    return data.data
  },

  create: async (payload: BonTransformationPayload) => {
    const { data } = await apiClient.post<ApiResponse<BonTransformation>>(
      '/recyclage/bons-transformation',
      payload
    )
    return data.data
  },

  update: async (id: number, payload: Partial<BonTransformationPayload>) => {
    const { data } = await apiClient.put<ApiResponse<BonTransformation>>(
      `/recyclage/bons-transformation/${id}`,
      payload
    )
    return data.data
  },

  cloture: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<BonTransformation>>(
      `/recyclage/bons-transformation/${id}/cloture`
    )
    return data.data
  },

  sessions: {
    list: async (btId: number) => {
      const { data } = await apiClient.get<ApiResponse<RecyclageSession[]>>(
        `/recyclage/bons-transformation/${btId}/sessions`
      )
      return Array.isArray(data.data) ? data.data : []
    },

    create: async (btId: number, payload: BtSessionPayload) => {
      const { data } = await apiClient.post<ApiResponse<RecyclageSession>>(
        `/recyclage/bons-transformation/${btId}/sessions`,
        payload
      )
      return data.data
    },

    validate: async (sessionId: number) => {
      const { data } = await apiClient.post<ApiResponse<RecyclageSession>>(
        `/recyclage/bt-sessions/${sessionId}/valider`
      )
      return data.data
    },

    addMatiere: async (sessionId: number, payload: BtMatierePayload) => {
      const { data } = await apiClient.post<ApiResponse<unknown>>(
        `/recyclage/bt-sessions/${sessionId}/matieres`,
        payload
      )
      return data.data
    },

    addEmploye: async (sessionId: number, payload: BtEmployePayload) => {
      const { data } = await apiClient.post<ApiResponse<unknown>>(
        `/recyclage/bt-sessions/${sessionId}/employes`,
        payload
      )
      return data.data
    },

    addEvenement: async (sessionId: number, payload: BtEvenementPayload) => {
      const { data } = await apiClient.post<ApiResponse<unknown>>(
        `/recyclage/bt-sessions/${sessionId}/evenements`,
        payload
      )
      return data.data
    },
  },
}