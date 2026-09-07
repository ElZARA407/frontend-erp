import apiClient from './client'
import type { ApiResponse } from '@/lib/types'
import { buildQueryString } from '@/lib/utils'
import type {
  CatalogueCategory,
  CatalogueCategoryPayload,
  CatalogueMatiere,
  CatalogueMatiereCreatePayload,
  CatalogueMatiereFilters,
  CatalogueMatiereUpdatePayload,
  CatalogueProduct,
  CatalogueProductClassment,
  CatalogueProductCreatePayload,
  CatalogueProductFilters,
  CatalogueProductUpdatePayload,
} from '@/lib/catalogue.types'
import { extractPaginatedResponse } from './pagination'


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

  listClassments: async () => {
  const { data } = await apiClient.get<ApiResponse<CatalogueProductClassment[]>>(
    '/catalogue/classements'
  )

  return Array.isArray(data.data) ? data.data : []
},
}