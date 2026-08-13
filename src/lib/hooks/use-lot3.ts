// src/lib/hooks/use-lot3.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { lot3Api } from '@/lib/api/lot3'
import type {
  ContratFilters,
  ContratPayload,
  DemandeAchatFilters,
  DemandeAchatPayload,
  DemandeAchatUpdatePayload,
  FournisseurFilters,
  FournisseurPayload,
} from '@/lib/lot3.types'
import { notifyApiError } from '../api-error'

export const LOT3_KEYS = {
  fournisseurs: ['lot3', 'fournisseurs'] as const,
  contrats: ['lot3', 'contrats'] as const,
  demandes: ['lot3', 'demandes-achat'] as const,
}

export function useFournisseurs(filters: FournisseurFilters = {}) {
  return useQuery({
    queryKey: [...LOT3_KEYS.fournisseurs, filters],
    queryFn: () => lot3Api.fournisseurs.list(filters),
    staleTime: 30_000,
  })
}

export function useContrats(filters: ContratFilters = {}) {
  return useQuery({
    queryKey: [...LOT3_KEYS.contrats, filters],
    queryFn: () => lot3Api.contrats.list(filters),
    staleTime: 30_000,
  })
}

export function useDemandesAchat(filters: DemandeAchatFilters = {}) {
  return useQuery({
    queryKey: [...LOT3_KEYS.demandes, filters],
    queryFn: () => lot3Api.demandesAchat.list(filters),
    staleTime: 30_000,
  })
}

export function useDemandeAchat(id: number) {
  return useQuery({
    queryKey: [...LOT3_KEYS.demandes, id],
    queryFn: () => lot3Api.demandesAchat.get(id),
    enabled: !!id,
  })
}

export function useCreateFournisseur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: FournisseurPayload) => lot3Api.fournisseurs.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.fournisseurs })
      toast.success('Fournisseur créé.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la création du fournisseur.'),
  })
}

export function useUpdateFournisseur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<FournisseurPayload> }) =>
      lot3Api.fournisseurs.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.fournisseurs })
      toast.success('Fournisseur mis à jour.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la mise à jour du fournisseur.'),
  })
}

export function useDeleteFournisseur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lot3Api.fournisseurs.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.fournisseurs })
      toast.success('Fournisseur supprimé.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer ce fournisseur.'),
  })
}

export function useImportFournisseurs() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: lot3Api.fournisseurs.importExcel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.fournisseurs })
      toast.success('Import fournisseurs terminé.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de l’import Excel des fournisseurs.'),
  })
}

export function useCreateContrat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ContratPayload) => lot3Api.contrats.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.contrats })
      toast.success('Contrat créé.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la création du contrat.'),
  })
}

export function useToggleContratActif() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, actif }: { id: number; actif: boolean }) =>
      lot3Api.contrats.update(id, { actif }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.contrats })
      toast.success('Statut du contrat mis à jour.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors du changement de statut du contrat.'),
  })
}

export function useDeleteContrat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lot3Api.contrats.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.contrats })
      toast.success('Contrat desactive.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer ce contrat.'),
  })
}

export function useCreateDemandeAchat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: DemandeAchatPayload) => lot3Api.demandesAchat.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.demandes })
      toast.success('Demande d’achat créée.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la création de la demande.'),
  })
}

export function useUpdateDemandeAchat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DemandeAchatUpdatePayload }) =>
      lot3Api.demandesAchat.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.demandes })
      toast.success('Demande d’achat mise à jour.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la mise à jour de la demande.'),
  })
}

export function useSubmitDemandeAchat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lot3Api.demandesAchat.soumettre(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.demandes })
      toast.success('Demande soumise.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de la soumission.'),
  })
}

export function useApproveDemandeAchat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lot3Api.demandesAchat.approuver(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.demandes })
      toast.success('Demande approuvée.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors de l’approbation.'),
  })
}

export function useRejectDemandeAchat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lot3Api.demandesAchat.rejeter(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.demandes })
      toast.success('Demande rejetée.')
    },
    onError: (error) => notifyApiError(error, 'Erreur lors du rejet.'),
  })
}

export function useDeleteDemandeAchat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => lot3Api.demandesAchat.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOT3_KEYS.demandes })
      toast.success('Demande supprimée.')
    },
    onError: (error) => notifyApiError(error, 'Impossible de supprimer cette demande.'),
  })
}