// src/lib/api/dashboard.ts
import apiClient from './client'
import type { ApiResponse, DashboardKpi } from '../types'

export const dashboardApi = {
  index: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardKpi>>('/dashboard')
    return data.data
  },
}