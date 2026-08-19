import apiClient from './client'
import type { ApiResponse, DashboardAlerte, DashboardKpi, LegacyDashboardKpi } from '../types'
import { buildQueryString } from '../utils'

export interface DashboardFilters {
  date_debut?: string
  date_fin?: string
  produit_id?: number
  [key: string]: unknown
}

export const dashboardApi = {
  index: async (filters: DashboardFilters = {}) => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi>>(
      `/dashboard${buildQueryString(filters)}`,
    )
    return data.data
  },

  production: async () => {
    const { data } = await apiClient.get<ApiResponse<LegacyDashboardKpi['production']>>('/dashboard/production')
    return data.data
  },

  stock: async () => {
    const { data } = await apiClient.get<ApiResponse<LegacyDashboardKpi['stock']>>('/dashboard/stock')
    return data.data
  },

  commercial: async () => {
    const { data } = await apiClient.get<ApiResponse<LegacyDashboardKpi['commercial']>>('/dashboard/commercial')
    return data.data
  },

  finance: async () => {
    const { data } = await apiClient.get<ApiResponse<LegacyDashboardKpi['finance']>>('/dashboard/finance')
    return data.data
  },

  pilotage: async () => {
    const { data } = await apiClient.get<ApiResponse<{ alertes: DashboardAlerte[]; generated_at: string }>>(
      '/dashboard/pilotage',
    )
    return data.data
  },
}