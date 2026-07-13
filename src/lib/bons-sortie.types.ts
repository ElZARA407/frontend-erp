import type { PaginatedResponse } from '@/lib/types'

export type BonSortieStatut = 'brouillon' | 'valide'
export type BonSortieMotif = 'usage_interne' | 'perte' | 'echantillon' | 'don' | 'autre'

export interface BonSortieClientRef {
  id: number
  nom: string
}

export interface BonSortieLocationRef {
  id: number
  nom: string
}

export interface BonSortieProduitRef {
  id: number
  nomencla: string
  designation: string
}

export interface BonSortieClassementRef {
  id: number
  qualite?: string | null
  libelle?: string | null
  designation?: string | null
}

export interface BonSortieLine {
  id: number
  produit_id: number
  classement_id: number
  quantite: number
  produit?: BonSortieProduitRef | null
  classement?: BonSortieClassementRef | null
}

export interface BonSortie {
  id: number
  numero: string
  date: string
  motif: BonSortieMotif
  statut: BonSortieStatut
  observations: string | null
  client?: BonSortieClientRef | null
  location?: BonSortieLocationRef | null
  lignes?: BonSortieLine[]
  created_at?: string
}

export interface BonSortiePayload {
  location_id: number
  date: string
  motif: BonSortieMotif
  client_id?: number | null
  observations?: string | null
  lignes: Array<{
    produit_id: number
    classement_id: number
    quantite: number
  }>
}

export interface BonSortieFilters {
  location_id?: number
  statut?: string
  motif?: string
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type BonsSortiePage = PaginatedResponse<BonSortie>