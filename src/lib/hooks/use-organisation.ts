// src/lib/hooks/use-organisation.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organisationApi } from '@/lib/api/organisation'
import type {
  OrganisationLocationPayload,
  OrganisationRolePayload,
  OrganisationUtilisateurFilters,
  OrganisationUtilisateurPayload,
} from '@/lib/organisation.types'

export const ORGANISATION_KEYS = {
  roles: ['organisation', 'roles'] as const,
  locations: ['organisation', 'locations'] as const,
  users: ['organisation', 'users'] as const,
}

export function useRoles() {
  return useQuery({
    queryKey: ORGANISATION_KEYS.roles,
    queryFn: organisationApi.listRoles,
    staleTime: 60_000,
  })
}

export function useLocations() {
  return useQuery({
    queryKey: ORGANISATION_KEYS.locations,
    queryFn: organisationApi.listLocations,
    staleTime: 60_000,
  })
}

export function useUsers(filters: OrganisationUtilisateurFilters = {}) {
  return useQuery({
    queryKey: [...ORGANISATION_KEYS.users, filters],
    queryFn: () => organisationApi.listUsers(filters),
    staleTime: 30_000,
  })
}

export function useCreateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OrganisationRolePayload) => organisationApi.createRole(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.roles })
      toast.success('Rôle créé.')
    },
    onError: () => toast.error('Erreur lors de la création du rôle.'),
  })
}

export function useUpdateRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<OrganisationRolePayload> }) =>
      organisationApi.updateRole(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.roles })
      toast.success('Rôle mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour du rôle.'),
  })
}

export function useDeleteRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => organisationApi.deleteRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.roles })
      toast.success('Rôle supprimé.')
    },
    onError: () => toast.error('Impossible de supprimer ce rôle.'),
  })
}

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OrganisationLocationPayload) => organisationApi.createLocation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.locations })
      toast.success('Location créée.')
    },
    onError: () => toast.error('Erreur lors de la création de la location.'),
  })
}

export function useUpdateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<OrganisationLocationPayload> }) =>
      organisationApi.updateLocation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.locations })
      toast.success('Location mise à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour de la location.'),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => organisationApi.deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.locations })
      toast.success('Location supprimée.')
    },
    onError: () => toast.error('Impossible de supprimer cette location.'),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: OrganisationUtilisateurPayload) => organisationApi.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.users })
      toast.success('Utilisateur créé.')
    },
    onError: () => toast.error('Erreur lors de la création de l’utilisateur.'),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<OrganisationUtilisateurPayload> }) =>
      organisationApi.updateUser(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.users })
      toast.success('Utilisateur mis à jour.')
    },
    onError: () => toast.error('Erreur lors de la mise à jour de l’utilisateur.'),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => organisationApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.users })
      toast.success('Utilisateur supprimé.')
    },
    onError: () => toast.error('Impossible de supprimer cet utilisateur.'),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => organisationApi.toggleUserActive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ORGANISATION_KEYS.users })
      toast.success('Statut utilisateur mis à jour.')
    },
    onError: () => toast.error('Erreur lors du changement de statut.'),
  })
}