// src/lib/api/catalogue.ts
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
  CatalogueProductsPage,
  CatalogueMatieresPage,
} from '@/lib/catalogue.types'

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
    const { data } = await apiClient.get<PaginatedResponse<CatalogueProduct>>(
      `/catalogue/produits${buildQueryString(filters)}`
    )
    return data
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

  listMatieres: async (filters: CatalogueMatiereFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<CatalogueMatiere>>(
      `/catalogue/matieres-premieres${buildQueryString(filters)}`
    )
    return data
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
}