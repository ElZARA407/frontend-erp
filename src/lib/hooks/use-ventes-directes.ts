import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ventesDirectesApi } from '@/lib/api/ventes-directes'
import { notifyApiError } from '@/lib/api-error'
import type {
  VenteDirecteFilters,
  VenteDirectePayload,
} from '@/lib/ventes-directes.types'
import { CACHE_KEYS, invalidateCommercialImpact } from './cache-keys'

export const VENTES_DIRECTES_KEYS = {
  ventes: CACHE_KEYS.ventesDirectes,
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
    enabled: id > 0,
    staleTime: 60_000,
  })
}

export function useCreateVenteDirecte() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: VenteDirectePayload
      idempotencyKey: string
    }) => ventesDirectesApi.create(payload, idempotencyKey),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Vente directe créée.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible de créer cette vente directe.'),
  })
}

export function useValiderVenteDirecte() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      idempotencyKey,
    }: {
      id: number
      idempotencyKey: string
    }) => ventesDirectesApi.valider(id, idempotencyKey),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Vente directe validée.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible de valider cette vente directe.'),
  })
}

export function useAnnulerVenteDirecte() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      idempotencyKey,
    }: {
      id: number
      idempotencyKey: string
    }) => ventesDirectesApi.annuler(id, idempotencyKey),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Vente directe annulée.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible d’annuler cette vente directe.'),
  })
}

export function useUpdateVenteDirecte() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<VenteDirectePayload> }) =>
      ventesDirectesApi.update(id, payload),
    onSuccess: (_data, variables) => {
      invalidateCommercialImpact(queryClient)
      queryClient.invalidateQueries({
        queryKey: [...VENTES_DIRECTES_KEYS.ventes, variables.id],
      })
      toast.success('Vente directe modifiée.')
    },
    onError: (error) =>
      notifyApiError(error, 'Impossible de modifier cette vente directe.'),
  })
}