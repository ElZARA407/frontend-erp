import type { Machine, PaginatedResponse } from '@/lib/types'

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
  type?: string
}

export interface RecyclageStatutRef {
  valeur: RecyclageStatut
  libelle: string
}

export interface BtSessionCalcul {
  id: number
  quantite_brute_utilisee: number
  quantite_restituee: number
  quantite_nette_consomme: number
  quantite_broyee_obtenue: number
  perte: number
  rendement: number
  taux_perte: number
  temps_brut: number
  temps_pause: number
  temps_panne: number
  temps_autre: number
  temps_effectif: number
  details_json?: unknown
  calcule_le?: string | null
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
    matricule?: string | null
    poste?: { id: number; nom: string } | null
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
  session_numero: string
  date_session: string
  machine_id: number | null
  machine_broyage?: string | null
  machine?: Machine | null
  ecarts: number
  statut: RecyclageSessionStatut
  quantite_sortie: number
  quantite_restituee: number
  quantite_nette_consomme: number
  quantite_entree: number
  matieres?: RecyclageSessionMatiere[]
  employes?: RecyclageSessionEmploye[]
  evenements?: RecyclageSessionEvenement[]
  calcul?: BtSessionCalcul | null
  created_at?: string
}

export interface BonTransformation {
  id: number
  numero: string
  date: string
  machine_id: number | null
  machine_broyage?: string | null
  machine?: Machine | null
  quantite_entree: number
  quantite_nette_consomme: number
  quantite_broyee: number
  perte: number
  taux_rendement: number
  taux_perte: number
  taux_avancement: number
  observations?: string | null
  statut: RecyclageStatutRef
  location?: RecyclageLocationRef
  matiere_brute?: RecyclageMatiereRef
  sessions?: RecyclageSession[]
  created_at?: string
}

export interface BonTransformationPayload {
  date: string
  location_id: number
  matiere_brute_id: number
  machine_id: number
  quantite_entree: number
  observations?: string | null
}

export interface BtSessionPayload {
  date_session: string
  machine_id: number
  sorties: Array<{
    quantite_utilisee: number
    quantite_restituee?: number
  }>
  entrees: Array<{
    matiere_id: number
    quantite: number
  }>
  employes?: Array<{
    employe_id: number
    heures_brutes?: number
  }>
  evenements?: Array<{
    type_evenement: RecyclageEvenementType
    heure_debut: string
    heure_fin?: string | null
    description?: string | null
  }>
}

export interface RecyclageFilters {
  search?: string
  location_id?: number
  matiere_brute_id?: number
  machine_id?: number
  statut?: string
  date_debut?: string
  date_fin?: string
  page?: number
  per_page?: number
  [key: string]: unknown
}

export type RecyclagePage = PaginatedResponse<BonTransformation>