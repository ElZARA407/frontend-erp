import apiClient from './client'
import type { ApiResponse, PaginatedResponse, Stock, MouvementStock } from '../types'
import { buildQueryString } from '../utils'
import type { AjustementStockValues, StockInitialValues } from '../schemas/stock.schema'

const DEFAULT_PER_PAGE = 10

type UnknownRecord = Record<string, unknown>
type ImportPayload = File | FormData | { file: File; sheetNames?: string[] }

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function extractPaginatedResponse<T>(payload: unknown): PaginatedResponse<T> {
  const root = isRecord(payload) && 'data' in payload ? (payload as { data?: unknown }).data : payload

  const page = isRecord(root) && 'data' in root
    ? root
    : {
        data: Array.isArray(root) ? root : [],
      }

  const meta = isRecord(page) && isRecord(page.meta) ? page.meta : page
  const rows = Array.isArray(page.data) ? (page.data as T[]) : []

  const perPage = Math.max(
    1,
    toNumber(meta.per_page, toNumber(page.per_page, rows.length || DEFAULT_PER_PAGE)),
  )

  const currentPage = Math.max(
    1,
    toNumber(meta.current_page, toNumber(page.current_page, 1)),
  )

  const total = Math.max(
    0,
    toNumber(meta.total, toNumber(page.total, rows.length)),
  )

  const lastPage = Math.max(
    1,
    toNumber(meta.last_page, toNumber(page.last_page, Math.ceil(total / perPage))),
  )

  const from = Math.max(
    0,
    toNumber(meta.from, toNumber(page.from, rows.length > 0 ? (currentPage - 1) * perPage + 1 : 0)),
  )

  const to = Math.max(
    0,
    toNumber(meta.to, toNumber(page.to, rows.length > 0 ? from + rows.length - 1 : 0)),
  )

  return {
    success: true,
    data: {
      data: rows,
      current_page: currentPage,
      last_page: lastPage,
      per_page: perPage,
      total,
      from,
      to,
    },
  }
}

function buildImportFormData(payload: ImportPayload): FormData {
  if (payload instanceof FormData) {
    return payload
  }

  const formData = new FormData()

  if (payload instanceof File) {
    formData.append('file', payload)
    return formData
  }

  formData.append('file', payload.file)
  payload.sheetNames?.forEach((sheetName) => {
    const value = sheetName.trim()
    if (value) {
      formData.append('sheet_names[]', value)
    }
  })

  return formData
}

export const stocksApi = {
  list: async (filters: {
    location_id?: number
    entite_type?: string
    search?: string
    per_page?: number
    page?: number
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
    search?: string
    per_page?: number
    page?: number
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
      `/stocks/alertes${buildQueryString(filters)}`
    )
    return data.data
  },

  mouvements: async (filters: {
    location_id?: number
    entite_type?: string
    entite_id?: number
    type?: string
    reference_type?: string
    search?: string
    date_debut?: string
    date_fin?: string
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
    const { data } = await apiClient.get<ApiResponse<MouvementStock>>(`/stocks/mouvements/${id}`)
    return data.data
  },

  createInitial: async (payload: StockInitialValues) => {
    const { data } = await apiClient.post<ApiResponse<MouvementStock>>('/stocks', payload)
     return data.data
 },

  import: async (formData: FormData) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      '/stocks/import',
      formData,
    )

    return data.data
  },

  ajusterInventaire: async (payload: AjustementStockValues) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      '/stocks/ajustements',
      payload
    )
    return data.data
  },
}