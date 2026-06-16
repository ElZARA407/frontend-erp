// src/lib/api/organisation.ts
import apiClient from './client'
import type { ApiResponse } from '@/lib/types'
import { buildQueryString } from '@/lib/utils'
import type {
  OrganisationLocation,
  OrganisationLocationPayload,
  OrganisationRole,
  OrganisationRolePayload,
  OrganisationUtilisateur,
  OrganisationUtilisateurFilters,
  OrganisationUtilisateurPayload,
  OrganisationUsersPage,
} from '@/lib/organisation.types'

export const organisationApi = {
  listRoles: async () => {
    const { data } = await apiClient.get<ApiResponse<OrganisationRole[]>>('/organisation/roles')
    return data.data
  },

  getRole: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<OrganisationRole>>(`/organisation/roles/${id}`)
    return data.data
  },

  createRole: async (payload: OrganisationRolePayload) => {
    const { data } = await apiClient.post<ApiResponse<OrganisationRole>>('/organisation/roles', payload)
    return data.data
  },

  updateRole: async (id: number, payload: Partial<OrganisationRolePayload>) => {
    const { data } = await apiClient.put<ApiResponse<OrganisationRole>>(`/organisation/roles/${id}`, payload)
    return data.data
  },

  deleteRole: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organisation/roles/${id}`)
    return data
  },

  listLocations: async () => {
    const { data } = await apiClient.get<ApiResponse<OrganisationLocation[]>>('/organisation/locations')
    return data.data
  },

  getLocation: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<OrganisationLocation>>(`/organisation/locations/${id}`)
    return data.data
  },

  createLocation: async (payload: OrganisationLocationPayload) => {
    const { data } = await apiClient.post<ApiResponse<OrganisationLocation>>('/organisation/locations', payload)
    return data.data
  },

  updateLocation: async (id: number, payload: Partial<OrganisationLocationPayload>) => {
    const { data } = await apiClient.put<ApiResponse<OrganisationLocation>>(`/organisation/locations/${id}`, payload)
    return data.data
  },

  deleteLocation: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organisation/locations/${id}`)
    return data
  },

  listUsers: async (filters: OrganisationUtilisateurFilters = {}) => {
    const { data } = await apiClient.get<ApiResponse<OrganisationUsersPage>>(
      `/organisation/utilisateurs${buildQueryString(filters)}`
    )
    return data.data
  },

  getUser: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<OrganisationUtilisateur>>(`/organisation/utilisateurs/${id}`)
    return data.data
  },

  createUser: async (payload: OrganisationUtilisateurPayload) => {
    const { data } = await apiClient.post<ApiResponse<OrganisationUtilisateur>>('/organisation/utilisateurs', payload)
    return data.data
  },

  updateUser: async (id: number, payload: Partial<OrganisationUtilisateurPayload>) => {
    const { data } = await apiClient.put<ApiResponse<OrganisationUtilisateur>>(`/organisation/utilisateurs/${id}`, payload)
    return data.data
  },

  deleteUser: async (id: number) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organisation/utilisateurs/${id}`)
    return data
  },

  toggleUserActive: async (id: number) => {
    const { data } = await apiClient.patch<ApiResponse<OrganisationUtilisateur>>(
      `/organisation/utilisateurs/${id}/toggle-actif`
    )
    return data.data
  },
}