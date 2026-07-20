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

export interface FactureLineOverridePayload {
  ligne_id: number
  prix_unitaire: number
}

export interface FactureLivraison {
  id: number
  numero: string
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  reference_bc: string | null
  reference_facture: string | null
  total_livraison?: number | null
  lignes_count?: number | null
}

export interface FactureLigne {
  id: number
  produit_id: number
  classement_id: number
  quantite: number
  prix_unitaire: number
  total_ligne: number
  produit?: {
    id: number
    nomencla: string
    designation: string
  } | null
  classement?: {
    id: number
    designation: string
    libelle?: string | null
  } | null
}

export interface Facture {
  id: number
  numero: string
  date: string
  total: number
  montant_paye: number
  reste_a_payer: number
  peut_recevoir_paiement: boolean
  statut: FactureStatut
  echeance_paiement: string | null
  date_paiement: string | null
  mode_paiement: string | null
  en_retard: boolean
  jours_retard: number
  notes: string | null
  client?: { id: number; nom: string } | null
  livraison?: FactureLivraison | null
  livraisons?: FactureLivraison[]
  lignes?: FactureLigne[]
  created_at?: string
}

export interface FacturePayerPayload {
  mode_paiement: ModePaiementValeur
  montant_paye: number
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
  livraison_id?: number
  livraison_ids: number[]
  lignes?: FactureLineOverridePayload[]
}

export interface FacturePreviewPayload {
  livraison_id?: number
  livraison_ids: number[]
  lignes?: FactureLineOverridePayload[]
}

export interface FacturePreviewLine {
  livraison_id: number
  livraison_numero: string
  ligne_id: number
  produit_id: number
  classement_id: number
  quantite: number
  prix_unitaire: number
  total_ligne: number
  produit?: {
    id: number
    nomencla: string
    designation: string
  } | null
  classement?: {
    id: number
    qualite?: string | null
    libelle?: string | null
    designation?: string | null
  } | null
}


export interface FacturePreviewLivraison {
  id: number
  numero: string
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  reference_bc: string | null
  reference_facture: string | null
  total_livraison: number
  lignes_count: number
  lignes: FacturePreviewLine[]
}

export interface FacturePreview {
  client: { id: number; nom: string } | null
  livraison_count: number
  ligne_count: number
  total: number
  livraisons: FacturePreviewLivraison[]
  lignes: FacturePreviewLine[]
}


export type FacturesPage = PaginatedResponse<Facture>