import { useQuery } from '@tanstack/react-query'
import { dashboardApi, type DashboardFilters } from '../api/dashboard'

export const DASHBOARD_KEY = ['dashboard'] as const

export function useDashboard(filters: DashboardFilters = {}) {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'overview', filters],
    queryFn: () => dashboardApi.index(filters),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useDashboardProduction() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'production'],
    queryFn: dashboardApi.production,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useDashboardStock() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'stock'],
    queryFn: dashboardApi.stock,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useDashboardCommercial() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'commercial'],
    queryFn: dashboardApi.commercial,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useDashboardFinance() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'finance'],
    queryFn: dashboardApi.finance,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function usePilotage() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, 'pilotage'],
    queryFn: dashboardApi.pilotage,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}