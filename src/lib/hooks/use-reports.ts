import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { downloadReportBlob, reportsApi, type ReportExportSection } from '@/lib/api/reports'
import type { ReportsFilters } from '@/lib/reports.types'
import { notifyApiError } from '../api-error'

export const REPORTS_KEY = ['reports'] as const

export function useReports(filters: ReportsFilters = {}) {
  return useQuery({
    queryKey: [...REPORTS_KEY, filters],
    queryFn: () => reportsApi.overview(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ section, filters }: { section: ReportExportSection; filters: ReportsFilters }) =>
      reportsApi.export(section, filters),
    onSuccess: (blob, variables) => {
      downloadReportBlob(blob, variables.section)
      toast.success('Export Excel généré.')
    },
    onError: (error) => {
      notifyApiError(error, 'Export Excel impossible.')
    },
  })
}