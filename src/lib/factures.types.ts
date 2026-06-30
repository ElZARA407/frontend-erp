import type { PaginatedResponse } from '@/lib/types'

export type FactureStatutValeur =
  | 'en_attente'
  | 'emise'
  | 'partiellement_payee'
  | 'payee'
  | 'annulee'

export type ModePaiementValeur =
  | 'espece'
  | 'virement'
  | 'cheque'
  | 'mobile_money'

export interface FactureStatut {
  valeur: FactureStatutValeur
  libelle: string
  couleur: string
}

export interface FactureLivraison {
  id: number
  numero: string
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  reference_bc: string | null
  reference_facture: string | null
}

export interface FactureLigne {
  id: number
  quantite: number
  prix_unitaire: number
  total_ligne: number
  classement?: {
    id: number
    designation: string
  }
}

export interface Facture {
  id: number
  numero: string
  date: string
  total: number
  statut: FactureStatut
  echeance_paiement: string | null
  date_paiement: string | null
  mode_paiement: string | null
  en_retard: boolean
  jours_retard: number
  notes: string | null
  client?: { id: number; nom: string } | null
  livraison?: FactureLivraison | null
  lignes?: FactureLigne[]
  created_at?: string
  
}

export interface FactureFilters {
  client_id?: number
  statut?: string
  en_retard?: boolean
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}

export interface FactureCreatePayload {
  livraison_id: number
}

export interface FacturePayerPayload {
  mode_paiement: ModePaiementValeur
}

export type FacturesPage = PaginatedResponse<Facture>