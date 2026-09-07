import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { stocksApi } from '../api/stocks'
import { notifyApiError } from '../api-error'
import type {
  AjustementStockValues,
  StockInitialValues,
} from '../schemas/stock.schema'

export const STOCKS_KEY = ['stocks'] as const

export function useStocks(filters: Parameters<typeof stocksApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'list', filters],
    queryFn: () => stocksApi.list(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useStockAlerts(
  filters: Parameters<typeof stocksApi.alertes>[0] = {},
) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'alertes', filters],
    queryFn: () => stocksApi.alertes(filters),
    staleTime: 60_000,
  })
}

export function useRuptures(
  filters: Parameters<typeof stocksApi.ruptures>[0] = {},
) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'ruptures', filters],
    queryFn: () => stocksApi.ruptures(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}

export function useMouvements(
  filters: Parameters<typeof stocksApi.mouvements>[0] = {},
) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'mouvements', filters],
    queryFn: () => stocksApi.mouvements(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useMouvementStock(id: number) {
  return useQuery({
    queryKey: [...STOCKS_KEY, 'mouvements', id],
    queryFn: () => stocksApi.mouvement(id),
    enabled: id > 0,
    staleTime: 60_000,
  })
}

function invalidateStockImpact(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: STOCKS_KEY })
  queryClient.invalidateQueries({ queryKey: ['dashboard'] })
}

export function useCreateInitialStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: StockInitialValues
      idempotencyKey: string
    }) => stocksApi.createInitial(payload, idempotencyKey),
    onSuccess: () => {
      invalidateStockImpact(queryClient)
      toast.success('Stock initial déclaré. Mouvement inventaire créé.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible de déclarer ce stock initial.'),
  })
}

export function useImportStocks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      formData,
      idempotencyKey,
    }: {
      formData: FormData
      idempotencyKey: string
    }) => stocksApi.import(formData, idempotencyKey),
    onSuccess: () => {
      invalidateStockImpact(queryClient)
      toast.success('Stocks importés.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible d’importer ce fichier de stock.'),
  })
}

export function useAjusterInventaire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: AjustementStockValues
      idempotencyKey: string
    }) => stocksApi.ajusterInventaire(payload, idempotencyKey),
    onSuccess: () => {
      invalidateStockImpact(queryClient)
      toast.success('Ajustement inventaire enregistré.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible d’enregistrer cet ajustement inventaire.'),
  })
}