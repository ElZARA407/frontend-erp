import type { PaginatedResponse } from '@/lib/types'

export type VenteDirecteStatut = 'brouillon' | 'validee' | 'annulee' | 'livree'

export interface VenteDirecteClientRef {
  id: number
  nom: string
}

export interface VenteDirecteLocationRef {
  id: number
  nom: string
}

export interface VenteDirecteClassementRef {
  id: number
  designation: string
}

export interface VenteDirecteLine {
  id: number
  quantite: number
  prix_unitaire: number
  total_ligne: number
  classement?: VenteDirecteClassementRef | null
}

export interface VenteDirecteLivraisonRef {
  id: number
  numero: string
  source_type: 'commande' | 'vente_directe'
  source_id: number
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  est_facturee: boolean
  created_at?: string
}

export interface VenteDirecte {
  id: number
  numero: string
  date: string
  statut: VenteDirecteStatut
  total: number
  client?: VenteDirecteClientRef | null
  location?: VenteDirecteLocationRef | null
  lignes?: VenteDirecteLine[]
  livraisons?: VenteDirecteLivraisonRef[]
  created_at?: string
}

export interface VenteDirectePayload {
  client_id: number
  date: string
  location_id: number
  lignes: Array<{
    classement_id: number
    quantite: number
    prix_unitaire: number
  }>
}

export interface VenteDirecteFilters {
  client_id?: number
  statut?: string
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type VentesDirectesPage = PaginatedResponse<VenteDirecte>