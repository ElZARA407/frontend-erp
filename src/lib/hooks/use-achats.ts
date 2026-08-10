import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { achatsApi } from '../api/achats'
import { notifyApiError } from '../api-error'
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
    onError: (error) => notifyApiError(error, 'Impossible de créer ce bon de réception.'),
  })
}

export function useValiderAchat() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => achatsApi.valider(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACHATS_KEY })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('BR validé. Stocks mis à jour.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de valider ce bon de réception.'),
  })
}