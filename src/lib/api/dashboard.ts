// src/lib/api/dashboard.ts
import apiClient from './client'
import type { ApiResponse, DashboardKpi } from '../types'

export const dashboardApi = {
  index: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi>>('/dashboard')
    return data.data
  },

  production: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi['production']>>('/dashboard/production')
    return data.data
  },

  stock: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi['stock']>>('/dashboard/stock')
    return data.data
  },

  commercial: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi['commercial']>>('/dashboard/commercial')
    return data.data
  },

  finance: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi['finance']>>('/dashboard/finance')
    return data.data
  },
}