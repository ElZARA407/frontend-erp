import type { PaginatedResponse } from '@/lib/types'

export type BonSortieStatut = 'brouillon' | 'valide'

export type BonSortieMotif =
  | 'transfert'
  | 'echantillon'
  | 'perte'
  | 'casse'
  | 'consommation_interne'
  | 'don'
  | 'destruction'
  | 'autre'
  | 'usage_interne'

export interface BonSortieClientRef {
  id: number
  nom: string
  reference?: string | null
}

export interface BonSortieLocationRef {
  id: number
  nom: string
}

export interface BonSortieUserRef {
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
  motif_libelle?: string | null
  motif_detail?: string | null
  statut: BonSortieStatut
  observations: string | null
  client?: BonSortieClientRef | null
  location?: BonSortieLocationRef | null
  destination_location?: BonSortieLocationRef | null
  createur?: BonSortieUserRef | null
  valideur?: BonSortieUserRef | null
  lignes?: BonSortieLine[]
  created_at?: string
}

export interface BonSortiePayload {
  location_id: number
  destination_location_id?: number | null
  date: string
  motif: BonSortieMotif
  motif_detail?: string | null
  client_id?: number | null
  observations?: string | null
  lignes: Array<{
    produit_id: number
    classement_id: number
    quantite: number
  }>
}

export interface BonSortieFilters {
  search?: string
  location_id?: number
  destination_location_id?: number
  client_id?: number
  created_by?: number
  produit_id?: number
  statut?: string
  motif?: string
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
  sort_by?: string
sort_dir?: 'asc' | 'desc'
}

export type BonsSortiePage = PaginatedResponse<BonSortie>