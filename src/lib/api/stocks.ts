import apiClient from './client'
import { idempotencyHeaders } from '../idempotency'
import type { ApiResponse, Stock, MouvementStock } from '../types'
import { buildQueryString } from '../utils'
import type {
  AjustementStockValues,
  StockInitialValues,
} from '../schemas/stock.schema'
import { extractPaginatedResponse } from './pagination'

const DEFAULT_PER_PAGE = 10

export const stocksApi = {
  list: async (filters: {
    location_id?: number
    entite_type?: string
    entite_id?: number
    include_zero?: boolean
    search?: string
    per_page?: number
    page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  } = {}) => {
    const query = buildQueryString({
      ...filters,
      search: filters.search?.trim() || undefined,
      page: filters.page ?? 1,
      per_page: filters.per_page ?? DEFAULT_PER_PAGE,
    })

    const { data } = await apiClient.get(`/stocks${query}`)
    return extractPaginatedResponse<Stock>(data)
  },

  ruptures: async (filters: {
    location_id?: number
    entite_type?: string
    entite_id?: number
    search?: string
    per_page?: number
    page?: number
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
  } = {}) => {
    const query = buildQueryString({
      ...filters,
      search: filters.search?.trim() || undefined,
      page: filters.page ?? 1,
      per_page: filters.per_page ?? DEFAULT_PER_PAGE,
    })

    const { data } = await apiClient.get(`/stocks/ruptures${query}`)
    return extractPaginatedResponse<Stock>(data)
  },

  alertes: async (filters: { location_id?: number; entite_type?: string } = {}) => {
    const { data } = await apiClient.get<ApiResponse<Stock[]>>(
      `/stocks/alertes${buildQueryString(filters)}`,
    )

    return data.data
  },

  mouvements: async (filters: {
    location_id?: number
    entite_type?: string
    entite_id?: number
    type?: string
    reference_type?: string
    motif?: string
    search?: string
    date_debut?: string
    date_fin?: string
    sort_by?: string
    sort_dir?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}) => {
    const query = buildQueryString({
      ...filters,
      search: filters.search?.trim() || undefined,
      page: filters.page ?? 1,
      per_page: filters.per_page ?? DEFAULT_PER_PAGE,
    })

    const { data } = await apiClient.get(`/stocks/mouvements${query}`)
    return extractPaginatedResponse<MouvementStock>(data)
  },

  mouvement: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<MouvementStock>>(
      `/stocks/mouvements/${id}`,
    )

    return data.data
  },

  createInitial: async (
    payload: StockInitialValues,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.post<ApiResponse<MouvementStock>>(
      '/stocks',
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  import: async (formData: FormData, idempotencyKey: string) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      '/stocks/import',
      formData,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },

  ajusterInventaire: async (
    payload: AjustementStockValues,
    idempotencyKey: string,
  ) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      '/stocks/ajustements',
      payload,
      { headers: idempotencyHeaders(idempotencyKey) },
    )

    return data.data
  },
}