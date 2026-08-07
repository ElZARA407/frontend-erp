import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  FacturePreviewPayload,
} from '../factures.types'

export const FACTURES_KEY = ['factures'] as const

export function useFactures(filters: FactureFilters = {}) {
  return useQuery({
    queryKey: [...FACTURES_KEY, filters],
    queryFn: () => facturesApi.list(filters),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useFacture(id: number) {
  return useQuery<Facture>({
    queryKey: [...FACTURES_KEY, id],
    queryFn: () => facturesApi.get(id),
    enabled: !!id,
  })
}

export function useFacturePreview(livraisonIds: number[] = []) {
  const ids = [...new Set(livraisonIds)].filter((id) => id > 0).sort((a, b) => a - b)

  return useQuery({
    queryKey: [...FACTURES_KEY, 'preview', ids],
    queryFn: () => facturesApi.preview({ livraison_ids: ids }),
    enabled: ids.length > 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

export function useCreateFacture() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: FactureCreatePayload) => facturesApi.creerDepuisLivraison(payload),
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
    mutationFn: (payload: { id: number; mode_paiement: FacturePayerPayload['mode_paiement']; montant_paye: number }) =>
      facturesApi.payer(payload.id, {
        mode_paiement: payload.mode_paiement,
        montant_paye: payload.montant_paye,
      }),
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