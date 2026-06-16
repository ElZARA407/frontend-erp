// src/lib/hooks/use-stocks.ts
import { useQuery } from '@tanstack/react-query'
import { stocksApi } from '../api/stocks'

export const STOCKS_KEY = ['stocks']

export function useStocks(filters: Parameters<typeof stocksApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, filters],
    queryFn:  () => stocksApi.list(filters),
    staleTime: 60 * 1000,
  })
}

export function useRuptures() {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'ruptures'],
    queryFn:  stocksApi.ruptures,
    staleTime: 60 * 1000,
  })
}

export function useMouvements(filters: Parameters<typeof stocksApi.mouvements>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'mouvements', filters],
    queryFn:  () => stocksApi.mouvements(filters),
    staleTime: 30 * 1000,
  })
}