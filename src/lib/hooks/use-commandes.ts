// src/lib/hooks/use-commandes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commandesApi, type CommandeFilters, type CreateCommandePayload } from '../api/commandes'

export const COMMANDES_KEY = ['commandes']

export function useCommandes(filters: CommandeFilters = {}) {
  return useQuery({
    queryKey: [...COMMANDES_KEY, filters],
    queryFn:  () => commandesApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useCommande(id: number) {
  return useQuery({
    queryKey: [...COMMANDES_KEY, id],
    queryFn:  () => commandesApi.get(id),
    enabled:  !!id,
  })
}

export function useCreateCommande() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCommandePayload) => commandesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMANDES_KEY })
      toast.success('Commande créée.')
    },
    onError: () => toast.error('Erreur lors de la création.'),
  })
}

export function useDuplicateCommande() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => commandesApi.duplicate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMMANDES_KEY })
      toast.success('Commande dupliquée.')
    },
  })
}