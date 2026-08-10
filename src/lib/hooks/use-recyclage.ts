import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { recyclageApi } from '@/lib/api/recyclage'
import type {
  BonTransformationPayload,
  BtSessionPayload,
  RecyclageFilters,
} from '@/lib/recyclage.types'
import { notifyApiError } from '../api-error'

export const RECYCLAGE_KEYS = {
  bons: ['recyclage', 'bons-transformation'] as const,
  sessions: ['recyclage', 'sessions'] as const,
}

export function useBonTransformations(filters: RecyclageFilters = {}) {
  return useQuery({
    queryKey: [...RECYCLAGE_KEYS.bons, filters],
    queryFn: () => recyclageApi.list(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useBonTransformation(id: number) {
  return useQuery({
    queryKey: [...RECYCLAGE_KEYS.bons, id],
    queryFn: () => recyclageApi.get(id),
    enabled: id > 0,
  })
}

export function useBtSessions(btId: number) {
  return useQuery({
    queryKey: [...RECYCLAGE_KEYS.sessions, btId],
    queryFn: () => recyclageApi.sessions.list(btId),
    enabled: btId > 0,
  })
}

export function useCreateBonTransformation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: BonTransformationPayload) => recyclageApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Bon de transformation créé.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la création du BT.'),
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
    onError: (error) => notifyApiError(error, 'Erreur lors de la mise à jour du BT.'),
  })
}

export function useClotureBonTransformation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => recyclageApi.cloture(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Bon de transformation clôturé.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la clôture du BT.'),
  })
}

export function useCreateBtSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ btId, payload }: { btId: number; payload: BtSessionPayload }) =>
      recyclageApi.sessions.create(btId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      toast.success('Session de transformation créée.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la création de la session.'),
  })
}

export function useValidateBtSession() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: number) => recyclageApi.sessions.validate(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.bons })
      qc.invalidateQueries({ queryKey: RECYCLAGE_KEYS.sessions })
      qc.invalidateQueries({ queryKey: ['stocks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Session validée. Stocks mis à jour.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la validation de la session.'),
  })
}