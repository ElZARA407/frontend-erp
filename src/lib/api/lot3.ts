// src/lib/api/lot3.ts
import apiClient from './client'
import type { ApiResponse } from '@/lib/types'
import { buildQueryString } from '@/lib/utils'
import type {
  Contrat,
  ContratFilters,
  ContratPayload,
  ContratsPage,
  DemandeAchat,
  DemandeAchatFilters,
  DemandeAchatPayload,
  DemandesAchatPage,
  Fournisseur,
  FournisseurFilters,
  FournisseurPayload,
  FournisseursPage,
} from '@/lib/lot3.types'

export const lot3Api = {
  fournisseurs: {
    list: async (filters: FournisseurFilters = {}) => {
      const { data } = await apiClient.get<FournisseursPage>(
        `/commercial/fournisseurs${buildQueryString(filters)}`
      )
      return data
    },

    get: async (id: number) => {
      const { data } = await apiClient.get<ApiResponse<Fournisseur>>(`/commercial/fournisseurs/${id}`)
      return data.data
    },

    create: async (payload: FournisseurPayload) => {
      const { data } = await apiClient.post<ApiResponse<Fournisseur>>('/commercial/fournisseurs', payload)
      return data.data
    },

    update: async (id: number, payload: Partial<FournisseurPayload>) => {
      const { data } = await apiClient.put<ApiResponse<Fournisseur>>(`/commercial/fournisseurs/${id}`, payload)
      return data.data
    },

    delete: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/commercial/fournisseurs/${id}`)
      return data
    },
  },

  contrats: {
    list: async (filters: ContratFilters = {}) => {
      const { data } = await apiClient.get<ContratsPage>(`/commercial/contrats${buildQueryString(filters)}`)
      return data
    },

    get: async (id: number) => {
      const { data } = await apiClient.get<ApiResponse<Contrat>>(`/commercial/contrats/${id}`)
      return data.data
    },

    create: async (payload: ContratPayload) => {
      const { data } = await apiClient.post<ApiResponse<Contrat>>('/commercial/contrats', payload)
      return data.data
    },

    update: async (id: number, payload: Partial<{ actif: boolean }>) => {
      const { data } = await apiClient.put<ApiResponse<Contrat>>(`/commercial/contrats/${id}`, payload)
      return data.data
    },

    delete: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/commercial/contrats/${id}`)
      return data
    },
  },

  demandesAchat: {
    list: async (filters: DemandeAchatFilters = {}) => {
      const { data } = await apiClient.get<DemandesAchatPage>(
        `/achats/demandes${buildQueryString(filters)}`
      )
      return data
    },

    get: async (id: number) => {
      const { data } = await apiClient.get<ApiResponse<DemandeAchat>>(`/achats/demandes/${id}`)
      return data.data
    },

    create: async (payload: DemandeAchatPayload) => {
      const { data } = await apiClient.post<ApiResponse<DemandeAchat>>('/achats/demandes', payload)
      return data.data
    },

    update: async (id: number, payload: Partial<{ date_demande: string; observations: string | null }>) => {
      const { data } = await apiClient.put<ApiResponse<DemandeAchat>>(`/achats/demandes/${id}`, payload)
      return data.data
    },

    delete: async (id: number) => {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/achats/demandes/${id}`)
      return data
    },

    soumettre: async (id: number) => {
      const { data } = await apiClient.post<ApiResponse<DemandeAchat>>(`/achats/demandes/${id}/soumettre`)
      return data.data
    },

    approuver: async (id: number) => {
      const { data } = await apiClient.post<ApiResponse<DemandeAchat>>(`/achats/demandes/${id}/approuver`)
      return data.data
    },

    rejeter: async (id: number) => {
      const { data } = await apiClient.post<ApiResponse<DemandeAchat>>(`/achats/demandes/${id}/rejeter`)
      return data.data
    },
  },
}