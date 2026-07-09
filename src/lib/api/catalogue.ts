import apiClient from './client'
import type { ApiResponse, PaginatedResponse } from '@/lib/types'
import { buildQueryString } from '@/lib/utils'
import type {
  CatalogueCategory,
  CatalogueCategoryPayload,
  CatalogueMatiere,
  CatalogueMatiereCreatePayload,
  CatalogueMatiereFilters,
  CatalogueMatiereUpdatePayload,
  CatalogueProduct,
  CatalogueProductCreatePayload,
  CatalogueProductFilters,
  CatalogueProductUpdatePayload,
} from '@/lib/catalogue.types'

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
  const root = isRecord(payload) && 'data' in payload
    ? (payload as { data?: unknown }).data
    : payload

  const page = isRecord(root) && 'data' in root
    ? root
    : {
        data: Array.isArray(root) ? root : [],
      }

  const meta = isRecord(page) && isRecord(page.meta) ? page.meta : page
  const rows = Array.isArray(page.data) ? (page.data as T[]) : []

  const perPage = Math.max(
    1,
    toNumber(meta.per_page, toNumber(page.per_page, rows.length || 10)),
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

export const catalogueApi = {
  listCategories: async () => {
    const { data } = await apiClient.get<ApiResponse<CatalogueCategory[]>>('/catalogue/categories')
    return data.data
  },

  getCategory: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<CatalogueCategory>>(`/catalogue/categories/${id}`)
    return data.data
  },

  createCategory: async (payload: CatalogueCategoryPayload) => {
    const { data } = await apiClient.post<ApiResponse<CatalogueCategory>>('/catalogue/categories', payload)
    return data.data
  },

  deleteCategory: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/catalogue/categories/${id}`)
    return data
  },

  listProducts: async (filters: CatalogueProductFilters = {}) => {
    const { data } = await apiClient.get(
      `/catalogue/produits${buildQueryString(filters)}`
    )

    return extractPaginatedResponse<CatalogueProduct>(data)
  },

  getProduct: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<CatalogueProduct>>(`/catalogue/produits/${id}`)
    return data.data
  },

  createProduct: async (payload: CatalogueProductCreatePayload) => {
    const { data } = await apiClient.post<ApiResponse<CatalogueProduct>>('/catalogue/produits', payload)
    return data.data
  },

  updateProduct: async (id: number, payload: CatalogueProductUpdatePayload) => {
    const { data } = await apiClient.put<ApiResponse<CatalogueProduct>>(`/catalogue/produits/${id}`, payload)
    return data.data
  },

  deleteProduct: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/catalogue/produits/${id}`)
    return data
  },

  importProducts: async (formData: FormData) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      '/catalogue/produits/import',
      formData,
    )

    return data.data
  },

  listMatieres: async (filters: CatalogueMatiereFilters = {}) => {
    const { data } = await apiClient.get(
      `/catalogue/matieres-premieres${buildQueryString(filters)}`
    )

    return extractPaginatedResponse<CatalogueMatiere>(data)
  },

  getMatiere: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<CatalogueMatiere>>(`/catalogue/matieres-premieres/${id}`)
    return data.data
  },

  createMatiere: async (payload: CatalogueMatiereCreatePayload) => {
    const { data } = await apiClient.post<ApiResponse<CatalogueMatiere>>('/catalogue/matieres-premieres', payload)
    return data.data
  },

  updateMatiere: async (id: number, payload: CatalogueMatiereUpdatePayload) => {
    const { data } = await apiClient.put<ApiResponse<CatalogueMatiere>>(`/catalogue/matieres-premieres/${id}`, payload)
    return data.data
  },

  deleteMatiere: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/catalogue/matieres-premieres/${id}`)
    return data
  },

  importMatieres: async (formData: FormData) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      '/catalogue/matieres-premieres/import',
      formData,
    )

    return data.data
  },
}