import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bonsSortieApi } from '@/lib/api/bons-sortie'
import type { BonSortieFilters, BonSortiePayload } from '@/lib/bons-sortie.types'

export const BONS_SORTIE_KEYS = {
  bons: ['bons-sortie'] as const,
}

export function useBonsSortie(filters: BonSortieFilters = {}) {
  return useQuery({
    queryKey: [...BONS_SORTIE_KEYS.bons, filters],
    queryFn: () => bonsSortieApi.list(filters),
    staleTime: 30_000,
  })
}

export function useBonSortie(id: number) {
  return useQuery({
    queryKey: [...BONS_SORTIE_KEYS.bons, id],
    queryFn: () => bonsSortieApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useCreateBonSortie() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BonSortiePayload) => bonsSortieApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BONS_SORTIE_KEYS.bons })
      toast.success('Bon de sortie créé.')
    },
    onError: () => toast.error('Erreur lors de la création du bon de sortie.'),
  })
}

export function useValiderBonSortie() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bonsSortieApi.valider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BONS_SORTIE_KEYS.bons })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      toast.success('Bon de sortie validé.')
    },
    onError: () => toast.error('Erreur lors de la validation du bon de sortie.'),
  })
}