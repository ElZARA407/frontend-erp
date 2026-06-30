// src/lib/lot3.types.ts
import type { PaginatedResponse } from '@/lib/types'

export interface Fournisseur {
  id: number
  nom: string
  reference: string
  NIF: string | null
  STAT: string | null
  adresse: string
  email: string | null
  contact: string
  interlocutaire: string | null
  code_compta: string | null
  actif: boolean
  created_at?: string
}

export interface FournisseurPayload {
  nom: string
  reference: string
  NIF?: string | null
  STAT?: string | null
  adresse: string
  email?: string | null
  contact: string
  interlocutaire?: string | null
  code_compta?: string | null
  actif: boolean
}

export interface LigneContrat {
  id: number
  quantite_contractuelle: number
  quantite_livree_ytd: number
  quantite_restante: number
  est_solde: boolean
  frequence: 'hebdomadaire' | 'bimensuel' | 'mensuel'
  statut: 'disponible' | 'indisponible' | 'en_cours'
  prix_unitaire: number
  classement?: {
    id: number
    designation: string
  }
}

export interface Contrat {
  id: number
  numero: string
  mois: string
  actif: boolean
  total_contractuel: number
  taux_execution: number
  client?: {
    id: number
    nom: string
    reference: string
  }
  lignes?: LigneContrat[]
  created_at?: string
}

export interface ContratPayload {
  client_id: number
  mois: string
  lignes: Array<{
    classement_id: number
    quantite_contractuelle: number
    frequence: 'hebdomadaire' | 'bimensuel' | 'mensuel'
    prix_unitaire: number
  }>
}

export interface LigneDemandeAchat {
  id: number
  entite_type: 'matiere' | 'produit'
  entite_id: number
  quantite: number
  observation_ligne: string | null
}

export interface DemandeAchat {
  id: number
  numero: string
  date_demande: string
  statut: 'brouillon' | 'soumise' | 'approuvee' | 'rejetee'
  observations: string | null
  demandeur?: {
    id: number
    nom: string
  }
  lignes?: LigneDemandeAchat[]
  created_at?: string
}

export interface DemandeAchatPayload {
  date_demande: string
  observations?: string | null
  lignes: Array<{
    entite_type: 'matiere' | 'produit'
    entite_id: number
    quantite: number
    observation_ligne?: string | null
  }>
}

export interface DemandeAchatUpdatePayload {
  date_demande: string
  observations?: string
}

export interface FournisseurFilters {
  search?: string
  actif?: boolean
  page?: number
  per_page?: number
  [key: string]: unknown
}

export interface ContratFilters {
  client_id?: number
  mois?: string
  actif?: boolean
  page?: number
  per_page?: number
  [key: string]: unknown
}

export interface DemandeAchatFilters {
  statut?: string
  demandeur_id?: number
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type FournisseursPage = PaginatedResponse<Fournisseur>
export type ContratsPage = PaginatedResponse<Contrat>
export type DemandesAchatPage = PaginatedResponse<DemandeAchat>