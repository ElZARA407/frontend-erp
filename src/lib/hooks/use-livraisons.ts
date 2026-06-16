// src/lib/hooks/use-livraisons.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { livraisonsApi } from '../api/livraisons'

export const LIVRAISONS_KEY = ['livraisons']

export function useLivraisons(filters: Parameters<typeof livraisonsApi.list>[0] = {}) {
  return useQuery({
    queryKey: [...LIVRAISONS_KEY, filters],
    queryFn:  () => livraisonsApi.list(filters),
    staleTime: 30 * 1000,
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
      toast.success('Livraison confirmée.')
    },
    onError: () => toast.error('Erreur lors de la confirmation.'),
  })
}