import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { facturesApi } from '../api/factures'
import { DASHBOARD_KEY } from './use-dashboard'
import { COMMERCIAL_DETAIL_KEYS } from './use-commercial-details'
import { LIVRAISONS_KEY } from './use-livraisons'
import type {
  Facture,
  FactureCreatePayload,
  FactureFilters,
  FacturePayerPayload,
} from '../factures.types'

export const FACTURES_KEY = ['factures']

export function useFactures(filters: FactureFilters = {}) {
  return useQuery({
    queryKey: [...FACTURES_KEY, filters],
    queryFn: () => facturesApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useFacture(id: number) {
  return useQuery<Facture>({
    queryKey: [...FACTURES_KEY, id],
    queryFn: () => facturesApi.get(id),
    enabled: !!id,
  })
}


export function useCreateFacture() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: FactureCreatePayload) => facturesApi.creerDepuisLivraison(payload.livraison_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FACTURES_KEY })
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      toast.success('Facture créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la facture.'),
  })
}

export function usePayerFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mode_paiement }: { id: number; mode_paiement: FacturePayerPayload['mode_paiement'] }) =>
      facturesApi.payer(id, mode_paiement),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FACTURES_KEY })
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      toast.success('Paiement enregistré.')
    },
    onError: () => toast.error("Erreur lors de l'enregistrement."),
  })
}

export function useAnnulerFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => facturesApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FACTURES_KEY })
      qc.invalidateQueries({ queryKey: LIVRAISONS_KEY })
      qc.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      toast.success('Facture annulée.')
    },
    onError: () => toast.error('Erreur lors de l’annulation.'),
  })
}