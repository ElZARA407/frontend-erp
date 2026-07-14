// src/lib/types.ts

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    data: T[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

// ── Auth ────────────────────────────────────────────────
export interface Utilisateur {
  id: number
  nom: string
  email: string
  actif: boolean
  role: { id: number; nom: string }
  location: { id: number; nom: string; type: string }
  created_at: string
}

export interface AuthState {
  token: string | null
  utilisateur: Utilisateur | null
}

// ── Organisation ────────────────────────────────────────
export interface Location {
  id: number
  nom: string
  type: 'bureau' | 'usine'
  est_usine: boolean
}

// ── Catalogue ───────────────────────────────────────────
export interface CategorieProduit {
  id: number
  nom: 'INJ' | 'HDPE' | 'PET' | 'MCH'
}

export interface ClassementProduit {
  id: number
  qualite: '1er' | '2e' | 'casse'
  qualite_libelle: string
  prix_specifique: number | null
  actif: boolean
  stock_disponible?: number
  produit?: { id: number; nomencla: string; designation: string }
}

export interface Produit {
  id: number
  nomencla: string
  designation: string
  contenance: string | null
  format: string | null
  unite: string
  colisage: number
  poids: string
  actif: boolean
  categorie?: CategorieProduit
  classements?: ClassementProduit[]
}

export interface MatierePremiere {
  id: number
  reference: string
  nom: string
  type: string
  description: string | null
  unite: string
  prix_moyen: number
  actif: boolean
  stock_total?: number
  en_rupture?: boolean
}

// ── Commercial ──────────────────────────────────────────
export interface Client {
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
  facturation: string | null
  actif: boolean
  created_at: string
}

export interface Fournisseur {
  id: number
  nom: string
  reference: string
  NIF: string | null
  adresse: string
  contact: string
  actif: boolean
}

export interface LigneCommande {
  id: number
  produit_id: number
  classement_id: number
  produit?: { id: number; nomencla: string; designation: string }
  classement?: ClassementProduit
  quantite: number
  quantite_restante: number
  prix_unitaire: number
  total_ligne: number
  etat: 'disponible' | 'indisponible' | 'en_cours'
  est_soldee: boolean
}

export interface StatutCommande {
  valeur: 'livree' | 'non_livree' | 'partielle'
  libelle: string
  couleur: string
}

export interface Commande {
  id: number
  numero: string
  date: string
  date_livraison_prevue: string | null
  statut: StatutCommande
  echeance: number
  total: number
  en_retard: boolean
  client?: { id: number; nom: string; reference: string }
  location?: { id: number; nom: string }
  lignes?: LigneCommande[]
  created_at: string
}

// ── Stock ───────────────────────────────────────────────
export interface StockArticleRef {
  id: number
  designation?: string | null
  nomencla?: string | null
  nom?: string | null
  reference?: string | null
  seuil?: number | null
}

export interface Stock {
  id: number
  entite_type: 'matiere' | 'produit'
  entite_id: number
  stock_total: number
  en_rupture: boolean
  seuil?: number | null
  sous_seuil_alerte?: boolean
  location?: Location
  classement?: { id: number; qualite?: string; libelle?: string; designation?: string }
  entite?: StockArticleRef
  updated_at: string
}

export interface MouvementStock {
  id: number
  entite_type: string
  entite_id: number
  type: { valeur: string; libelle: string }
  quantite: number
  impact_stock: number
  reference_type: string
  reference_id: number
  motif?: string | null
  stock_theorique?: number | null
  stock_physique?: number | null
  ecart?: number | null
  date_mouvement: string
  location?: { id: number; nom: string }
  utilisateur?: { id: number; nom: string }
  entite?: StockArticleRef
  classement?: { id: number; designation?: string; libelle?: string }
}

export interface StockAjustementResult {
  stock: Stock
  mouvement: MouvementStock
}

// ── Machines ────────────────────────────────────────────
export interface Machine {
  id: number
  nom: string
  description?: string | null
  actif: boolean
  created_at?: string
}

// ── Achats ──────────────────────────────────────────────
export interface JournalAchat {
  id: number
  numero: string
  date: string
  vehicule: string | null
  statut: 'brouillon' | 'valide'
  total: number
  observations: string | null
  fournisseur?: { id: number; nom: string }
  location?: { id: number; nom: string }
  lignes?: Array<{
    id: number
    matiere: { id: number; nom: string; reference: string; unite: string }
    quantite: number
    prix_unitaire: number
    total_ligne: number
  }>
}

// ── Production ──────────────────────────────────────────
export interface StatutProduction {
  valeur: 'ouvert' | 'en_cours' | 'cloture' | 'annule'
  libelle: string
}

export interface BonProduction {
  id: number
  numero: string
  date: string
  machine_id: number | null
  quantite_cible: number
  quantite_produite: number
  taux_realisation: number
  cout_total: number
  statut: StatutProduction
  location?: { id: number; nom: string }
  produit?: { id: number; nomencla: string; designation: string }
  machine?: Machine
  sessions?: BpSession[]
  created_at: string
}

export interface BpSession {
  id: number
  session_numero: string
  date_session: string
  machine_id: number | null
  cout_electricite: number
  cout_total: number
  statut: 'ouverte' | 'validee'
  machine?: Machine
  calcul?: BpSessionCalcul
}

export interface BpSessionCalcul {
  id: number
  temps_brut: number
  temps_pause: number
  temps_panne: number
  temps_effectif: number
  quantite_totale_produite: number
  cout_matieres_total: number
  cout_main_oeuvre_total: number
  cout_electricite: number
  cout_global: number
  cout_unitaire: number
  details_json?: {
    matieres?: Array<{
      matiere_id: number
      reference?: string | null
      nom?: string | null
      quantite_utilisee: number
      quantite_restituee: number
      quantite_nette: number
      prix_moyen: number
      cout: number
    }>
    employes?: Array<{
      employe_id: number
      nom_complet?: string | null
      matricule?: string | null
      heures_brutes: number
      heures_effectives: number
      taux_horaire: number
      cout: number
    }>
    evenements?: Array<{
      type_evenement: string
      heure_debut: string
      heure_fin?: string | null
      description?: string | null
      duree: number
    }>
  } | null
  calcule_le?: string | null
}

// ── Livraisons ──────────────────────────────────────────
export interface Livraison {
  id: number
  numero: string
  source_type: 'commande' | 'vente_directe'
  source_id: number
  date_livraison: string | null
  statut: 'prepare' | 'livre' | 'retourne'
  reference_bc: string | null
  reference_facture: string | null
  chauffeur: string | null
  vehicule: string | null
  est_facturee: boolean
  client?: { id: number; nom: string }
  created_at: string
}

// ── Finance ─────────────────────────────────────────────
export interface StatutFacture {
  valeur: 'en_attente' | 'emise' | 'partiellement_payee' | 'payee' | 'annulee'
  libelle: string
  couleur: string
}

// ── Dashboard ───────────────────────────────────────────
export interface DashboardKpi {
  production: {
    bp_actifs: number
    bp_clotures_mois: number
    cout_production_mois: number
  }
  stock: {
    total_references: number
    references_rupture: number
    valeur_stock_mp: number
  }
  commercial: {
    commandes_en_cours: number
    commandes_en_retard: number
    ca_mois: number
  }
  finance: {
    factures_impayees: number
    montant_impaye: number
    factures_en_retard: number
    montant_retard: number
  }
}
