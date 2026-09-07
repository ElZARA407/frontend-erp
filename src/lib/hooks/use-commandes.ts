import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  commandesApi,
  type CommandeFilters,
  type CreateCommandePayload,
  type UpdateCommandePayload,
} from '../api/commandes'
import { notifyApiError } from '../api-error'
import { CACHE_KEYS, invalidateCommercialImpact } from './cache-keys'

export const COMMANDES_KEY = CACHE_KEYS.commandes

export function useCommandes(filters: CommandeFilters = {}) {
  return useQuery({
    queryKey: [...COMMANDES_KEY, filters],
    queryFn: () => commandesApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useCommande(id: number) {
  return useQuery({
    queryKey: [...COMMANDES_KEY, id],
    queryFn: () => commandesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateCommande() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCommandePayload) => commandesApi.create(payload),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Commande créée.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la création de la commande.'),
  })
}

export function useDuplicateCommande() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => commandesApi.duplicate(id),
    onSuccess: () => {
      invalidateCommercialImpact(queryClient)
      toast.success('Commande dupliquée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de dupliquer cette commande.'),
  })
}

export function useUpdateCommande() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCommandePayload }) =>
      commandesApi.update(id, payload),
    onSuccess: (_data, variables) => {
      invalidateCommercialImpact(queryClient)
      queryClient.invalidateQueries({ queryKey: [...COMMANDES_KEY, variables.id] })
      toast.success('Commande modifiée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de modifier cette commande.'),
  })
}