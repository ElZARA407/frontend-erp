import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bonsSortieApi } from '@/lib/api/bons-sortie'
import { notifyApiError } from '@/lib/api-error'
import type { BonSortieFilters, BonSortiePayload } from '@/lib/bons-sortie.types'
import { CACHE_KEYS, invalidateCommercialImpact, invalidateStockImpact } from './cache-keys'

export const BONS_SORTIE_KEYS = {
  bons: CACHE_KEYS.bonsSortie,
}

export function useBonsSortie(filters: BonSortieFilters = {}) {
  return useQuery({
    queryKey: [...BONS_SORTIE_KEYS.bons, filters],
    queryFn: () => bonsSortieApi.list(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useBonSortie(id: number) {
  return useQuery({
    queryKey: [...BONS_SORTIE_KEYS.bons, id],
    queryFn: () => bonsSortieApi.get(id),
    enabled: id > 0,
    staleTime: 60_000,
  })
}

export function useCreateBonSortie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BonSortiePayload) => bonsSortieApi.create(payload),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Bon de sortie créé.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de créer ce bon de sortie.'),
  })
}

export function useUpdateBonSortie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BonSortiePayload> }) =>
      bonsSortieApi.update(id, payload),
    onSuccess: (_data, variables) => {
      invalidateCommercialImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: [...BONS_SORTIE_KEYS.bons, variables.id] })
      toast.success('Bon de sortie mis à jour.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de mettre à jour ce bon de sortie.'),
  })
}

export function useDeleteBonSortie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => bonsSortieApi.delete(id),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Bon de sortie supprimé.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer ce bon de sortie.'),
  })
}

export function useValiderBonSortie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => bonsSortieApi.valider(id),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      invalidateStockImpact(queryClient)
      toast.success('Bon de sortie validé.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de valider ce bon de sortie.'),
  })
}