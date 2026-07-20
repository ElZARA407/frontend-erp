import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { livraisonsApi, type LivraisonCreatePayload } from '../api/livraisons'
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
      qc.invalidateQueries({ queryKey: ['commandes'] })
      qc.invalidateQueries({ queryKey: ['ventes-directes'] })
      toast.success('Livraison créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la livraison.'),
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
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison confirmée.')
    },
    onError: () => toast.error('Erreur lors de la confirmation.'),
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
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      toast.success('Livraison annulée.')
    },
    onError: () => toast.error('Erreur lors de l’annulation.'),
  })
}