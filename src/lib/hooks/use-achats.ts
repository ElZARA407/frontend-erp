// src/lib/hooks/use-achats.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { achatsApi } from '../api/achats'
import type { AchatSchema } from '../schemas/achat.schema'

export const ACHATS_KEY = ['achats']

export function useAchats(filters: Parameters<typeof achatsApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...ACHATS_KEY, filters],
    queryFn: () => achatsApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useAchat(id: number) {
  return useQuery({
    queryKey: [...ACHATS_KEY, id],
    queryFn: () => achatsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateAchat() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: AchatSchema) => achatsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACHATS_KEY })
      toast.success('Bon de réception créé.')
    },
    onError: () => toast.error('Erreur lors de la création du BR.'),
  })
}

export function useValiderAchat() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => achatsApi.valider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACHATS_KEY })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      toast.success('BR validé. Stocks mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la validation.'),
  })
}