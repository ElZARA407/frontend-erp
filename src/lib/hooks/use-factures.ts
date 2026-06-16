// src/lib/hooks/use-factures.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { facturesApi } from '../api/factures'

export const FACTURES_KEY = ['factures']

export function useFactures(filters: Parameters<typeof facturesApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...FACTURES_KEY, filters],
    queryFn:  () => facturesApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useFacture(id: number) {
  return useQuery({
    queryKey: [...FACTURES_KEY, id],
    queryFn:  () => facturesApi.get(id),
    enabled:  !!id,
  })
}

export function usePayerFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mode_paiement }: { id: number; mode_paiement: string }) =>
      facturesApi.payer(id, mode_paiement),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FACTURES_KEY })
      toast.success('Paiement enregistré.')
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement.'),
  })
}

export function useAnnulerFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => facturesApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FACTURES_KEY })
      toast.success('Facture annulée.')
    },
  })
}