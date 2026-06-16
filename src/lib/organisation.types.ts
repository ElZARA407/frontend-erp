// src/lib/organisation.types.ts
import type { PaginatedResponse } from '@/lib/types'

export interface OrganisationRole {
  id: number
  nom: string
  description: string | null
  utilisateurs_count?: number
  created_at?: string
}

export interface OrganisationLocation {
  id: number
  nom: string
  type: 'bureau' | 'usine'
  est_usine: boolean
  utilisateurs_count?: number
  created_at?: string
}

export interface OrganisationUtilisateur {
  id: number
  nom: string
  email: string
  actif: boolean
  role: {
    id: number
    nom: string
  } | null
  location: {
    id: number
    nom: string
    type: string
  } | null
  created_at?: string
}

export interface OrganisationRolePayload {
  nom: string
  description?: string | null
}

export interface OrganisationLocationPayload {
  nom: string
  type: 'bureau' | 'usine'
}

export interface OrganisationUtilisateurPayload {
  nom: string
  email: string
  password?: string
  role_id: number
  location_id: number
  actif: boolean
}

export interface OrganisationUtilisateurFilters {
  search?: string
  role_id?: number
  location_id?: number
  actif?: boolean
  page?: number
  per_page?: number
  [key: string]: unknown

}

export type OrganisationUsersPage = PaginatedResponse<OrganisationUtilisateur>