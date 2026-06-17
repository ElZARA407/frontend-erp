import type { PaginatedResponse } from '@/lib/types'

export type RecyclageStatut = 'ouvert' | 'en_cours' | 'cloture' | 'annule'
export type RecyclageSessionStatut = 'ouverte' | 'validee'
export type RecyclageMouvementType = 'entree' | 'sortie'
export type RecyclageEvenementType = 'broyage' | 'pause' | 'panne' | 'autre'

export interface RecyclageLocationRef {
  id: number
  nom: string
}

export interface RecyclageMatiereRef {
  id: number
  nom: string
  reference: string
}

export interface RecyclageStatutRef {
  valeur: RecyclageStatut
  libelle: string
}

export interface RecyclageSessionMatiere {
  id: number
  type: RecyclageMouvementType
  quantite: number
  quantite_restituee: number
  matiere: RecyclageMatiereRef
}

export interface RecyclageSessionEmploye {
  id: number
  heures_brutes: number
  heures_effectives?: number
  taux_horaire: number
  cout?: number
  employe: {
    id: number
    nom_complet: string
  }
}

export interface RecyclageSessionEvenement {
  id: number
  type_evenement: RecyclageEvenementType | string
  heure_debut: string
  heure_fin: string | null
  description: string | null
  operateur?: {
    id: number
    nom: string
  } | null
}

export interface RecyclageSession {
  id: number
  session_numero: number
  date_session: string
  machine_broyage: string
  ecarts: number
  statut: RecyclageSessionStatut
  quantite_entree: number
  quantite_sortie: number
  matieres?: RecyclageSessionMatiere[]
  employes?: RecyclageSessionEmploye[]
  evenements?: RecyclageSessionEvenement[]
  created_at?: string
}

export interface BonTransformation {
  id: number
  numero: string
  date: string
  machine_broyage: string
  quantite_entree: number
  quantite_broyee: number
  taux_rendement: number
  taux_perte: number
  statut: RecyclageStatutRef
  location?: RecyclageLocationRef
  matiere_brute?: RecyclageMatiereRef
  matiere_broyee?: RecyclageMatiereRef
  sessions?: RecyclageSession[]
  created_at?: string
}

export interface BonTransformationPayload {
  date: string
  location_id: number
  matiere_brute_id: number
  matiere_broyee_id: number
  machine_broyage: string
  quantite_entree: number
}

export interface BtSessionPayload {
  date_session: string
  machine_broyage: string
}

export interface BtMatierePayload {
  matiere_id: number
  type: RecyclageMouvementType
  quantite: number
  quantite_restituee?: number | null
}

export interface BtEmployePayload {
  employe_id: number
  heures_brutes: number
}

export interface BtEvenementPayload {
  type_evenement: RecyclageEvenementType
  heure_debut: string
  heure_fin?: string | null
  description?: string | null
}

export interface RecyclageFilters {
  location_id?: number
  statut?: string
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type RecyclagePage = PaginatedResponse<BonTransformation>