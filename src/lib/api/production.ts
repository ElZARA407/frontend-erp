import apiClient from './client'
import type { ApiResponse, PaginatedResponse, BonProduction, BpSession, Machine } from '../types'
import { buildQueryString } from '../utils'

export interface BpFilters {
  location_id?: number
  statut?: string
  produit_id?: number
  date_debut?: string
  date_fin?: string
  per_page?: number
  page?: number
  [key: string]: unknown
}

export interface BpMatierePayload {
  matiere_id: number
  quantite_utilisee: number
  quantite_restituee?: number
}

export interface BpObtenuPayload {
  produit_id: number
  classement_id: number
  quantite_produite: number
  destination_location_id: number
}

export interface BpEmployePayload {
  employe_id: number
  heures_brutes: number
}

export interface BpEvenementPayload {
  type_evenement: 'production' | 'panne' | 'autre'
  heure_debut: string
  heure_fin?: string
  description?: string
}

export interface BpSessionCreatePayload {
  date_session: string
  machine_id: number
  cout_electricite?: number
  matieres?: BpMatierePayload[]
  obtenus?: BpObtenuPayload[]
  employes?: BpEmployePayload[]
  evenements?: BpEvenementPayload[]
}

export interface MachinePayload {
  nom: string
  description?: string | null
}

export const productionApi = {
  list: async (filters: BpFilters = {}) => {
    const { data } = await apiClient.get<PaginatedResponse<BonProduction>>(
      `/production/bons-production${buildQueryString(filters)}`
    )
    return data
  },

  get: async (id: number) => {
    const { data } = await apiClient.get<ApiResponse<BonProduction>>(
      `/production/bons-production/${id}`
    )
    return data.data
  },

  listMachines: async (filters: { actif?: boolean; search?: string } = {}) => {
    const { data } = await apiClient.get<ApiResponse<Machine[]>>(
      `/production/machines${buildQueryString(filters)}`
    )
    return Array.isArray(data.data) ? data.data : []
  },

  createMachine: async (payload: MachinePayload) => {
    const { data } = await apiClient.post<ApiResponse<Machine>>(
      '/production/machines',
      payload
    )
    return data.data
  },

  create: async (payload: {
    date: string
    location_id: number
    produit_id: number
    machine_id: number
    quantite_cible: number
  }) => {
    const { data } = await apiClient.post<ApiResponse<BonProduction>>(
      '/production/bons-production',
      payload
    )
    return data.data
  },

  cloture: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<BonProduction>>(
      `/production/bons-production/${id}/cloture`
    )
    return data.data
  },

  annuler: async (id: number) => {
    const { data } = await apiClient.post<ApiResponse<null>>(
      `/production/bons-production/${id}/annuler`
    )
    return data
  },

  createSession: async (bpId: number, payload: BpSessionCreatePayload) => {
    const { data } = await apiClient.post<ApiResponse<BpSession>>(
      `/production/bons-production/${bpId}/sessions`,
      payload
    )
    return data.data
  },

  validerSession: async (sessionId: number) => {
    const { data } = await apiClient.post<ApiResponse<BpSession>>(
      `/production/sessions/${sessionId}/valider`
    )
    return data.data
  },

  addMatiere: async (sessionId: number, payload: BpMatierePayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/production/sessions/${sessionId}/matieres`,
      payload
    )
    return data.data
  },

  addObtenu: async (sessionId: number, payload: BpObtenuPayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/production/sessions/${sessionId}/obtenus`,
      payload
    )
    return data.data
  },

  addEmploye: async (sessionId: number, payload: BpEmployePayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/production/sessions/${sessionId}/employes`,
      payload
    )
    return data.data
  },

  addEvenement: async (sessionId: number, payload: BpEvenementPayload) => {
    const { data } = await apiClient.post<ApiResponse<unknown>>(
      `/production/sessions/${sessionId}/evenements`,
      payload
    )
    return data.data
  },
}