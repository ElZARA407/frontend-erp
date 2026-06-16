// src/lib/rh.types.ts
import type { PaginatedResponse } from '@/lib/types'

export interface RhPoste {
  id: number
  nom: string
  taux_horaire: number
  salaire_mensuel: number | null
  cout_journalier?: number
  employes_count?: number
  created_at?: string
}

export interface RhEmploye {
  id: number
  matricule: string
  nom: string
  prenom: string
  nom_complet?: string
  date_embauche: string
  date_depart: string | null
  actif: boolean
  anciennete?: string
  poste?: {
    id: number
    nom: string
    taux_horaire: number
  }
  created_at?: string
}

export interface RhPostePayload {
  nom: string
  taux_horaire: number
  salaire_mensuel?: number | null
}

export interface RhEmployePayload {
  matricule: string
  nom: string
  prenom: string
  poste_id: number
  date_embauche: string
  date_depart?: string | null
  actif: boolean
}

export interface RhPosteFilters {
  search?: string
  [key: string]: unknown
}

export interface RhEmployeFilters {
  search?: string
  poste_id?: number
  actif?: boolean
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type RhEmployesPage = PaginatedResponse<RhEmploye>