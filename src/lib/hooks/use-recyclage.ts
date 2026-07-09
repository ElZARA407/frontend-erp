import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recyclageApi } from '@/lib/api/recyclage'
import type {
  BonTransformationPayload,
  BtEmployePayload,
  BtEvenementPayload,
  BtMatierePayload,
  BtSessionPayload,
  RecyclageFilters,
} from '@/lib/recyclage.types'

export const RECYCLAGE_KEYS = {
  bons: ['recyclage', 'bons-transformation'] as const,
  sessions: ['recyclage', 'sessions'] as const,
}

export function useBonTransformations(filters: RecyclageFilters = {}) {
  return useQuery({
    queryKey: [...RECYCLAGE_KEYS.bons, filters],
    queryFn: () => recyclageApi.list(filters),
    staleTime: 30_000,
  })
}

export function useBonTransformation(id: number) {
  return useQuery({
    queryKey: [...RECYCLAGE_KEYS.bons, id],
    queryFn: () => recyclageApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useBtSessions(btId: number) {
  return useQuery({
    queryKey: [...RECYCLAGE_KEYS.sessions, btId],
    queryFn: () => recyclageApi.sessions.list(btId),
    enabled: !!btId,
    staleTime: 30_000,
  })
}

export function useCreateBonTransformation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: BonTransformationPayload) => recyclageApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      toast.success('Bon de transformation créé.')
    },
    onError: () => toast.error('Erreur lors de la création du BT.'),
  })
}

export function useUpdateBonTransformation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BonTransformationPayload> }) =>
      recyclageApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      toast.success('Bon de transformation mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour du BT.'),
  })
}

export function useClotureBonTransformation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => recyclageApi.cloture(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      toast.success('Bon de transformation clôturé.')
    },
    onError: () => toast.error('Erreur lors de la clôture du BT.'),
  })
}

export function useCreateBtSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ btId, payload }: { btId: number; payload: BtSessionPayload }) =>
      recyclageApi.sessions.create(btId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      toast.success('Session créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la session.'),
  })
}

export function useValidateBtSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: number) => recyclageApi.sessions.validate(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Session validée. Stocks mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la validation de la session.'),
  })
}

export function useAddBtMatiere() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BtMatierePayload }) =>
      recyclageApi.sessions.addMatiere(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      toast.success('Matière ajoutée à la session.')
    },
    onError: () => toast.error('Erreur lors de l’ajout de matière.'),
  })
}

export function useAddBtEmploye() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BtEmployePayload }) =>
      recyclageApi.sessions.addEmploye(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      toast.success('Employé ajouté à la session.')
    },
    onError: () => toast.error('Erreur lors de l’ajout d’employé.'),
  })
}

export function useAddBtEvenement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: number; payload: BtEvenementPayload }) =>
      recyclageApi.sessions.addEvenement(sessionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      toast.success('Événement ajouté à la session.')
    },
    onError: () => toast.error('Erreur lors de l’ajout de l’événement.'),
  })
}