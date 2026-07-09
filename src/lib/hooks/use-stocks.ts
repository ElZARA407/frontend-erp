import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stocksApi } from '../api/stocks'
import type { AjustementStockValues } from '../schemas/stock.schema'

export const STOCKS_KEY = ['stocks'] as const

export function useStocks(filters: Parameters<typeof stocksApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'list', filters],
    queryFn: () => stocksApi.list(filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useStockAlerts(filters: Parameters<typeof stocksApi.alertes>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'alertes', filters],
    queryFn: () => stocksApi.alertes(filters),
    staleTime: 60 * 1000,
  })
}

export function useRuptures(filters: Parameters<typeof stocksApi.ruptures>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'ruptures', filters],
    queryFn: () => stocksApi.ruptures(filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useMouvements(filters: Parameters<typeof stocksApi.mouvements>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'mouvements', filters],
    queryFn: () => stocksApi.mouvements(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useMouvementStock(id: number) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'mouvements', id],
    queryFn: () => stocksApi.mouvement(id),
    enabled: id > 0,
    staleTime: 60 * 1000,
  })
}

export function useImportStocks() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: FormData) => stocksApi.import(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOCKS_KEY })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Stocks importés.')
    },
    onError: () => toast.error('Erreur lors de l’import Excel des stocks.'),
  })
}

export function useAjusterInventaire() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: AjustementStockValues) => stocksApi.ajusterInventaire(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STOCKS_KEY })
      toast.success('Ajustement inventaire enregistre.')
    },
    onError: () => toast.error('Erreur lors de l’ajustement inventaire.'),
  })
}