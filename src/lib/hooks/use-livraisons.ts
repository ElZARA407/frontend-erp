import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  livraisonsApi,
  type LivraisonCreatePayload,
  type LivraisonUpdatePayload,
} from '../api/livraisons'
import { notifyApiError } from '../api-error'
import { COMMERCIAL_DETAIL_KEYS } from './use-commercial-details'
import { CACHE_KEYS, invalidateCommercialImpact, invalidateStockImpact } from './cache-keys'

export const LIVRAISONS_KEY = CACHE_KEYS.livraisons

export function useLivraisons(filters: Parameters<typeof livraisonsApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...LIVRAISONS_KEY, filters],
    queryFn: () => livraisonsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useCreateLivraison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LivraisonCreatePayload) => livraisonsApi.create(payload),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Livraison préparée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de préparer cette livraison.'),
  })
}

export function useUpdateLivraison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LivraisonUpdatePayload }) =>
      livraisonsApi.update(id, payload),
    onSuccess: (_data, variables) => {
      invalidateCommercialImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: [...LIVRAISONS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison mise à jour.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de modifier cette livraison.'),
  })
}

export function useDeleteLivraisonPreparee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => livraisonsApi.delete(id),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison préparée supprimée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer cette livraison préparée.'),
  })
}

export function useConfirmerLivraison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => livraisonsApi.confirmer(id),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      invalidateStockImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison confirmée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de confirmer cette livraison.'),
  })
}

export function useAnnulerLivraison() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => livraisonsApi.annuler(id),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      invalidateStockImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison annulée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible d’annuler cette livraison.'),
  })
}

export function useCorrectLivraisonAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
      idempotencyKey,
    }: {
      id: number
      payload: import('../api/livraisons').LivraisonCorrectionPayload
      idempotencyKey: string
    }) => livraisonsApi.corrigerAdmin(id, payload, idempotencyKey),

    onSuccess: (_data, variables) => {
      invalidateCommercialImpact(queryClient)
      invalidateStockImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: [...LIVRAISONS_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Correction administrateur de la livraison enregistrée.')
    },

    onError: (error) =>
      notifyApiError(error, 'Impossible de corriger cette livraison.'),
  })
}