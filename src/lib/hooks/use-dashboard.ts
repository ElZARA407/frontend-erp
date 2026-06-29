// src/lib/hooks/use-dashboard.ts
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'

export const DASHBOARD_KEY = ['dashboard'] as const

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEY,
    queryFn: dashboardApi.index,
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