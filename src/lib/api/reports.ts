import apiClient from './client'
import type { ApiResponse } from '@/lib/types'
import { buildQueryString } from '@/lib/utils'
import type { ReportsFilters, ReportsOverview } from '@/lib/reports.types'

export type ReportExportSection =
  | 'commercial'
  | 'stock'
  | 'production'
  | 'recyclage'
  | 'finance'
  | 'mouvements'

export const reportsApi = {
  overview: async (filters: ReportsFilters = {}) => {
    const { data } = await apiClient.get<ApiResponse<ReportsOverview>>(
      `/rapports${buildQueryString(filters)}`
    )

    return data.data
  },

  export: async (section: ReportExportSection, filters: ReportsFilters = {}) => {
    const { data } = await apiClient.get<Blob>(
      `/rapports/export${buildQueryString({ ...filters, section })}`,
      { responseType: 'blob' }
    )

    return data
  },
}

export function downloadReportBlob(blob: Blob, section: ReportExportSection) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `rapport-${section}.xlsx`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}