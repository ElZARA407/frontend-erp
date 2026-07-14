import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  productionApi,
  type BpEmployePayload,
  type BpEvenementPayload,
  type BpFilters,
  type BpMatierePayload,
  type BpObtenuPayload,
  type BpSessionCreatePayload,
  type MachinePayload,
} from '../api/production'
import type { BonProductionSchema } from '../schemas/production.schema'

export const PRODUCTION_KEY = ['production'] as const
export const DASHBOARD_KEY = ['dashboard'] as const

export function useBonsProduction(filters: BpFilters = {}) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, filters],
    queryFn: () => productionApi.list(filters),
    staleTime: 30_000,
  })
}

export function useBonProduction(id: number) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, id],
    queryFn: () => productionApi.get(id),
    enabled: id > 0,
  })
}

export function useMachines(filters: { actif?: boolean; search?: string } = {}) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, 'machines', filters],
    queryFn: () => productionApi.listMachines(filters),
    staleTime: 60_000,
  })
}

export function useCreateMachine() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: MachinePayload) => productionApi.createMachine(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...PRODUCTION_KEY, 'machines'] })
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      toast.success('Machine créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la machine.'),
  })
}

export function useCreateBonProduction() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: BonProductionSchema) => productionApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
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
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      toast.success('BP clôturé.')
    },
    onError: () => toast.error('Erreur lors de la clôture.'),
  })
}

export function useAnnulerBP() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productionApi.annuler(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTION_KEY })
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      toast.success('BP annulé.')
    },
    onError: () => toast.error('Erreur lors de l’annulation.'),
  })
}

export function useCreateSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ bpId, payload }: { bpId: number; payload: BpSessionCreatePayload }) =>
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
      qc.invalidateQueries({ queryKey: DASHBOARD_KEY })
      qc.invalidateQueries({ queryKey: ['stocks'] })
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
      toast.success('Matière ajoutée.')
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
      toast.success('Employé ajouté.')
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
      toast.success('Événement ajouté.')
    },
    onError: () => toast.error('Erreur lors de l’ajout de l’événement.'),
  })
}

export function useCoutMoyenProduit(
  produitId: number,
  params: { date_debut?: string; date_fin?: string } = {}
) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, 'cout-moyen-produit', produitId, params],
    queryFn: () => productionApi.coutMoyenProduit(produitId, params),
    enabled: produitId > 0,
    staleTime: 30_000,
  })
}

export function useCoutMoyenBonProduction(bpId: number) {
  return useQuery({
    queryKey: [...PRODUCTION_KEY, 'cout-moyen-bp', bpId],
    queryFn: () => productionApi.coutMoyenBp(bpId),
    enabled: bpId > 0,
    staleTime: 30_000,
  })
}
