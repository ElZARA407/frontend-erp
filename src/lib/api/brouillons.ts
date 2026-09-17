import apiClient from './client'
import { idempotencyHeaders } from '@/lib/idempotency'
import type { ApiResponse } from '@/lib/types'
import type {
  BrouillonDocument,
  BrouillonModule,
} from '@/lib/brouillons.types'

export const brouillonsApi = {
  list: async <TPayload>(module: BrouillonModule) => {
    const { data } = await apiClient.get<ApiResponse<BrouillonDocument<TPayload>[]>>(
      `/brouillons?module=${module}`,
    )

    return data.data
  },

  get: async <TPayload>(uuid: string) => {
    const { data } = await apiClient.get<ApiResponse<BrouillonDocument<TPayload>>>(
      `/brouillons/${uuid}`,
    )

    return data.data
  },

  create: async <TPayload>(
    module: BrouillonModule,
    payload: TPayload,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.post<ApiResponse<BrouillonDocument<TPayload>>>(
      '/brouillons',
      { module, payload },
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  update: async <TPayload>(
    uuid: string,
    payload: TPayload,
    version: number,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.put<ApiResponse<BrouillonDocument<TPayload>>>(
      `/brouillons/${uuid}`,
      { payload, version },
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  delete: async (uuid: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(
      `/brouillons/${uuid}`,
    )

    return data
  },
  finaliser: async <TDocument>(
    uuid: string,
    idempotencyKey: string,
    ) => {
    const { data } = await apiClient.post<ApiResponse<TDocument>>(
        `/brouillons/${uuid}/finaliser`,
        undefined,
        { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
    },
}