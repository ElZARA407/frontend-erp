import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ventesDirectesApi } from '@/lib/api/ventes-directes'
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
      toast.success('Vente directe creee.')
    },
    onError: () => toast.error('Erreur lors de la creation de la vente directe.'),
  })
}

export function useValiderVenteDirecte() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ventesDirectesApi.valider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTES_DIRECTES_KEYS.ventes })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      toast.success('Vente directe validee.')
    },
    onError: () => toast.error('Erreur lors de la validation de la vente directe.'),
  })
}

export function useAnnulerVenteDirecte() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ventesDirectesApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTES_DIRECTES_KEYS.ventes })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      toast.success('Vente directe annulee.')
    },
    onError: () => toast.error('Erreur lors de l annulation de la vente directe.'),
  })
}