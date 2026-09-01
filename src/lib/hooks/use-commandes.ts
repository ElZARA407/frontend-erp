// src/lib/hooks/use-commandes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { commandesApi, type CommandeFilters, type CreateCommandePayload } from '../api/commandes'
import { notifyApiError } from '../api-error'
import { Commande } from '../types'

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
    onError: (error) => notifyApiError(error, 'Erreur lors de la création.'),
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

export function useUpdateCommande() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateCommandePayload> }) =>
      commandesApi.update(id, payload as Partial<Commande>),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: COMMANDES_KEY })
      qc.invalidateQueries({ queryKey: [...COMMANDES_KEY, variables.id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Commande modifiée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de modifier cette commande.'),
  })
}