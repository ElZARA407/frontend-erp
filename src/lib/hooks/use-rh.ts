// src/lib/hooks/use-rh.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { rhApi } from '@/lib/api/rh'
import type {
  RhEmployeFilters,
  RhEmployePayload,
  RhPosteFilters,
  RhPostePayload,
} from '@/lib/rh.types'

export const RH_KEYS = {
  postes: ['rh', 'postes'] as const,
  employes: ['rh', 'employes'] as const,
}

export function usePostes(filters: RhPosteFilters = {}) {
  return useQuery({
    queryKey: [...RH_KEYS.postes, filters],
    queryFn: () => rhApi.listPostes(filters),
    staleTime: 60_000,
  })
}

export function useEmployes(filters: RhEmployeFilters = {}) {
  return useQuery({
    queryKey: [...RH_KEYS.employes, filters],
    queryFn: () => rhApi.listEmployes(filters),
    staleTime: 30_000,
  })
}

export function useCreatePoste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RhPostePayload) => rhApi.createPoste(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RH_KEYS.postes })
      toast.success('Poste créé.')
    },
    onError: () => toast.error('Erreur lors de la création du poste.'),
  })
}

export function useUpdatePoste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RhPostePayload> }) =>
      rhApi.updatePoste(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RH_KEYS.postes })
      toast.success('Poste mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour du poste.'),
  })
}

export function useDeletePoste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rhApi.deletePoste(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RH_KEYS.postes })
      toast.success('Poste supprimé.')
    },
    onError: () => toast.error('Impossible de supprimer ce poste.'),
  })
}

export function useCreateEmploye() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RhEmployePayload) => rhApi.createEmploye(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RH_KEYS.employes })
      toast.success('Employé créé.')
    },
    onError: () => toast.error('Erreur lors de la création de l’employé.'),
  })
}

export function useUpdateEmploye() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RhEmployePayload> }) =>
      rhApi.updateEmploye(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RH_KEYS.employes })
      toast.success('Employé mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour de l’employé.'),
  })
}

export function useDeleteEmploye() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => rhApi.deleteEmploye(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RH_KEYS.employes })
      toast.success('Employé archivé.')
    },
    onError: () => toast.error('Impossible d’archiver cet employé.'),
  })
}