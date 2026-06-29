// src/lib/hooks/use-production.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  productionApi,
  type BpEmployePayload,
  type BpEvenementPayload,
  type BpFilters,
  type BpMatierePayload,
  type BpObtenuPayload,
} from '../api/production'
import type { BonProductionSchema, SessionSchema } from '../schemas/production.schema'

export const PRODUCTION_KEY = ['production']

export function useBonsProduction(filters: BpFilters = {}) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, filters],
    queryFn: () => productionApi.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useBonProduction(id: number) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, id],
    queryFn: () => productionApi.get(id),
    enabled: !!id,
  })
}

export function useCreateBonProduction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: BonProductionSchema) => productionApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Bon de production créé.')
    },
    onError: () => toast.error('Erreur lors de la création.'),
  })
}

export function useClotureBP() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionApi.cloture(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('BP clôturé.')
    },
    onError: () => toast.error('Erreur lors de la clôture.'),
  })
}

export function useCreateSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ bpId, payload }: { bpId: number; payload: SessionSchema }) =>
      productionApi.createSession(bpId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Session créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la session.'),
  })
}

export function useValiderSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: number) => productionApi.validerSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Session validée. Stocks mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la validation.'),
  })
}

export function useAddProductionMatiere() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BpMatierePayload }) =>
      productionApi.addMatiere(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Matière ajoutée à la session.')
    },
    onError: () => toast.error('Erreur lors de l’ajout de la matière.'),
  })
}

export function useAddProductionObtenu() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BpObtenuPayload }) =>
      productionApi.addObtenu(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Produit obtenu ajouté.')
    },
    onError: () => toast.error('Erreur lors de l’ajout du produit obtenu.'),
  })
}

export function useAddProductionEmploye() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BpEmployePayload }) =>
      productionApi.addEmploye(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Employé ajouté à la session.')
    },
    onError: () => toast.error('Erreur lors de l’ajout de l’employé.'),
  })
}

export function useAddProductionEvenement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BpEvenementPayload }) =>
      productionApi.addEvenement(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Événement ajouté à la session.')
    },
    onError: () => toast.error('Erreur lors de l’ajout de l’événement.'),
  })
}