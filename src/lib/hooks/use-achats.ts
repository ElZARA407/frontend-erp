// src/lib/hooks/use-achats.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { achatsApi } from '../api/achats'

export const ACHATS_KEY = ['achats']

export function useAchats(filters: Parameters<typeof achatsApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...ACHATS_KEY, filters],
    queryFn:  () => achatsApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useAchat(id: number) {
  return useQuery({
    queryKey: [...ACHATS_KEY, id],
    queryFn:  () => achatsApi.get(id),
    enabled:  !!id,
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