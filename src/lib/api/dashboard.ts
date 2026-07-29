// src/lib/api/dashboard.ts
import apiClient from './client'
import type { ApiResponse, DashboardAlerte, DashboardKpi, LegacyDashboardKpi } from '../types'

export const dashboardApi = {
  index: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi>>('/dashboard')
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
      '/dashboard/pilotage'
    )
    return data.data
  },
}