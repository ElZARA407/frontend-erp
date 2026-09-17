export type BrouillonModule =
  | 'bon_reception'
  | 'bon_sortie'
  | 'vente_directe'
  | 'livraison'

export interface BrouillonUtilisateur {
  id: number
  nom: string
}

export interface BrouillonDocument<TPayload = Record<string, unknown>> {
  uuid: string
  module: BrouillonModule
  statut: 'ouvert' | 'finalise'
  payload: TPayload
  version: number
  created_at: string | null
  updated_at: string | null
  createur: BrouillonUtilisateur | null
  modificateur: BrouillonUtilisateur | null
}