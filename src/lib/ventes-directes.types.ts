import type { PaginatedResponse } from '@/lib/types'
import type { BrouillonDocument } from '@/lib/brouillons.types'

export type ViewStatus = 'validees' | 'livrees' | 'annulees' | 'brouillons'
export type VenteDirecteStatut = 'brouillon' | 'validee' | 'annulee' | 'livree'

export interface VenteDirecteClientRef {
  id: number
  nom: string
}

export interface VenteDirecteLocationRef {
  id: number
  nom: string
}

export interface VenteDirecteProduitRef {
  id: number
  nomencla: string
  designation: string
}

export interface VenteDirecteClassementRef {
  id: number
  designation?: string | null
  qualite?: string | null
  libelle?: string | null
}

export interface VenteDirecteLine {
  id: number
  produit_id: number
  classement_id: number
  quantite: number
  quantite_restante?: number
  prix_unitaire: number
  total_ligne: number
  produit?: VenteDirecteProduitRef | null
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
    id?: number
    produit_id: number
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

export type ConfirmAction =
  | { type: 'finaliser'; brouillon: BrouillonDocument<VenteDirectePayload> }
  | { type: 'supprimer'; brouillon: BrouillonDocument<VenteDirectePayload> }
  | { type: 'annuler'; vente: VenteDirecte }
  | null

export interface LocalPagination {
  current_page: number
  last_page: number
  total: number
  from: number
  to: number
}

export function formatLivraisonStatut(statut: string) {
  if (statut === 'livre') return 'Confirmé'
  if (statut === 'prepare') return 'Préparé'
  if (statut === 'retourne') return 'Retourné'
  return statut
}

export function formatVenteStatut(statut: VenteDirecte['statut']) {
  if (statut === 'validee') return 'Validée'
  if (statut === 'livree') return 'Livrée'
  if (statut === 'annulee') return 'Annulée'
  return statut
}

/**
 * Pagination côté client pour des listes déjà chargées en mémoire
 * (ex. les brouillons, dont l'API ne pagine pas encore côté serveur).
 */
export function paginateLocally<T>(items: T[], page: number, perPage: number): LocalPagination & { data: T[] } {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(Math.max(1, page), lastPage)
  const start = total === 0 ? 0 : (currentPage - 1) * perPage
  const end = total === 0 ? 0 : Math.min(start + perPage, total)

  return {
    data: items.slice(start, end),
    current_page: currentPage,
    last_page: lastPage,
    total,
    from: total === 0 ? 0 : start + 1,
    to: end,
  }
}

export type VentesDirectesPage = PaginatedResponse<VenteDirecte>