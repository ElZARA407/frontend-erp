// src/lib/hooks/use-clients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { clientsApi, type ClientFilters } from '../api/clients'
import type { ClientSchema } from '../schemas/client.schema'
import { notifyApiError } from '../api-error'

export const CLIENTS_KEY = ['clients']

export function useClients(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: [...CLIENTS_KEY, filters],
    queryFn:  () => clientsApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useClient(id: number) {
  return useQuery({
    queryKey: [...CLIENTS_KEY, id],
    queryFn:  () => clientsApi.get(id),
    enabled:  !!id,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientSchema) => clientsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY })
      toast.success('Client créé.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de créer ce client.'),
  })
}

export function useUpdateClient(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ClientSchema>) => clientsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY })
      toast.success('Client mis à jour.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de mettre à jour ce client.'),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY })
      toast.success('Client archivé.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer ce client.'),
  })
}