import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ventesDirectesApi } from '@/lib/api/ventes-directes'
import { notifyApiError } from '@/lib/api-error'
import type { VenteDirecteFilters, VenteDirectePayload } from '@/lib/ventes-directes.types'

export const VENTES_DIRECTES_KEYS = {
  ventes: ['ventes-directes'] as const,
}

export function useVentesDirectes(filters: VenteDirecteFilters = {}) {
  return useQuery({
    queryKey: [...VENTES_DIRECTES_KEYS.ventes, filters],
    queryFn: () => ventesDirectesApi.list(filters),
    staleTime: 30_000,
  })
}

export function useVenteDirecte(id: number) {
  return useQuery({
    queryKey: [...VENTES_DIRECTES_KEYS.ventes, id],
    queryFn: () => ventesDirectesApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useCreateVenteDirecte() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: VenteDirectePayload) => ventesDirectesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTES_DIRECTES_KEYS.ventes })
      toast.success('Vente directe créée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de créer cette vente directe.'),
  })
}

export function useValiderVenteDirecte() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ventesDirectesApi.valider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTES_DIRECTES_KEYS.ventes })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Vente directe validée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de valider cette vente directe.'),
  })
}

export function useAnnulerVenteDirecte() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ventesDirectesApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTES_DIRECTES_KEYS.ventes })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Vente directe annulée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible d’annuler cette vente directe.'),
  })
}