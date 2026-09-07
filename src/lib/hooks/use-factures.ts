import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { facturesApi } from '../api/factures'
import { notifyApiError } from '../api-error'
import { DASHBOARD_KEY } from './use-dashboard'
import { COMMERCIAL_DETAIL_KEYS } from './use-commercial-details'
import { LIVRAISONS_KEY } from './use-livraisons'
import type {
  Facture,
  FactureCreatePayload,
  FactureFilters,
  FacturePayerPayload,
} from '../factures.types'

export const FACTURES_KEY = ['factures'] as const

export function useFactures(filters: FactureFilters = {}) {
  return useQuery({
    queryKey: [...FACTURES_KEY, filters],
    queryFn: () => facturesApi.list(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useFacture(id: number) {
  return useQuery<Facture>({
    queryKey: [...FACTURES_KEY, id],
    queryFn: () => facturesApi.get(id),
    enabled: id > 0,
  })
}

export function useFacturePreview(livraisonIds: number[] = []) {
  const ids = [...new Set(livraisonIds)]
    .filter((id) => id > 0)
    .sort((a, b) => a - b)

  return useQuery({
    queryKey: [...FACTURES_KEY, 'preview', ids],
    queryFn: () => facturesApi.preview({ livraison_ids: ids }),
    enabled: ids.length > 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

function invalidateFactureImpact(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: FACTURES_KEY })
  queryClient.invalidateQueries({ queryKey: LIVRAISONS_KEY })
  queryClient.invalidateQueries({ queryKey: COMMERCIAL_DETAIL_KEYS.livraison })
  queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY })
}

export function useCreateFacture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      idempotencyKey,
    }: {
      payload: FactureCreatePayload
      idempotencyKey: string
    }) => facturesApi.creerDepuisLivraison(payload, idempotencyKey),
    onSuccess: () => {
      invalidateFactureImpact(queryClient)
      toast.success('Facture créée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de créer cette facture.'),
  })
}

export function usePayerFacture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
      idempotencyKey,
    }: {
      id: number
      payload: FacturePayerPayload
      idempotencyKey: string
    }) => facturesApi.payer(id, payload, idempotencyKey),
    onSuccess: () => {
      invalidateFactureImpact(queryClient)
      toast.success('Paiement enregistré.')
    },
    onError: (error) => notifyApiError(error, 'Impossible d’enregistrer ce paiement.'),
  })
}

export function useAnnulerFacture() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      idempotencyKey,
    }: {
      id: number
      idempotencyKey: string
    }) => facturesApi.annuler(id, idempotencyKey),
    onSuccess: () => {
      invalidateFactureImpact(queryClient)
      toast.success('Facture annulée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible d’annuler cette facture.'),
  })
}