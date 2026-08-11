import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  livraisonsApi,
  type LivraisonCreatePayload,
  type LivraisonUpdatePayload,
} from '../api/livraisons'
import { notifyApiError } from '../api-error'
import { COMMERCIAL_DETAIL_KEYS } from './use-commercial-details'

export const LIVRAISONS_KEY = ['livraisons'] as const

export function useLivraisons(filters: Parameters<typeof livraisonsApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...LIVRAISONS_KEY, filters],
    queryFn: () => livraisonsApi.list(filters),
    staleTime: 30_000,
  })
}

export function useCreateLivraison() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: LivraisonCreatePayload) => livraisonsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      toast.success('Livraison préparée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de préparer cette livraison.'),
  })
}

export function useUpdateLivraison() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LivraisonUpdatePayload }) =>
      livraisonsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison mise à jour.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de modifier cette livraison.'),
  })
}

export function useDeleteLivraisonPreparee() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => livraisonsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison préparée supprimée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer cette livraison préparée.'),
  })
}

export function useConfirmerLivraison() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => livraisonsApi.confirmer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['commandes'] })
      qc.invalidateQueries({ queryKey: ['ventes-directes'] })
      qc.invalidateQueries({ queryKey: ['factures'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison confirmée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de confirmer cette livraison.'),
  })
}

export function useAnnulerLivraison() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => livraisonsApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['commandes'] })
      qc.invalidateQueries({ queryKey: ['ventes-directes'] })
      qc.invalidateQueries({ queryKey: ['factures'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison annulée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible d’annuler cette livraison.'),
  })
}