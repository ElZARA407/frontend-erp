// src/lib/hooks/use-dashboard.ts
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.index,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}