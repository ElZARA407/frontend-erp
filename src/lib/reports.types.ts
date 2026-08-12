export interface ReportPeriod {
  date_debut: string
  date_fin: string
}

export interface ReportAmountPoint {
  date: string
  total: number
}

export interface ReportItem {
  id: number
  reference?: string | null
  libelle: string
  total?: number
  quantite?: number
  cout?: number
  reste?: number
  objectif?: number
  realise?: number
  taux?: number
}

export interface ReportCommandeNonLivree {
  id: number
  numero: string
  date: string
  date_livraison_prevue: string | null
  statut: string
  client: string
  quantite_restante: number
}

export interface ReportCommercialDocument {
  id: number
  numero: string
  date: string
  date_livraison_prevue?: string | null
  statut: string
  client: string
  quantite_commandee: number
  quantite_livree: number
  quantite_restante: number
  total: number
}

export interface ReportCommercialLivraison {
  id: number
  numero: string
  source_type: 'commande' | 'vente_directe'
  source_id: number
  date_livraison: string | null
  statut: string
  client: string
  reference_bc: string | null
  reference_facture: string | null
  lignes_count: number
  quantite_livree: number
}

export interface ReportStockItem {
  id: number
  reference?: string | null
  libelle: string
  classement?: string | null
  stock_total: number
  seuil: number
}

export interface ReportStockMovement {
  date: string
  type: 'entree' | 'sortie' | 'retour' | string
  quantite: number
}

export interface ReportRecyclePoint {
  mois?: string
  type: string
  quantite: number
}

export interface ReportsOverview {
  periode: ReportPeriod
  commercial: {
    ventes_par_periode: ReportAmountPoint[]
    ventes_par_produit: ReportItem[]
    ventes_par_client: ReportItem[]
    commandes_detaillees: ReportCommercialDocument[]
    ventes_directes_detaillees: ReportCommercialDocument[]
    livraisons_detaillees: ReportCommercialLivraison[]
    commandes_non_livrees: ReportCommandeNonLivree[]
  }
  stock: {
    etat_stock: {
      references: number
      references_positives: number
      ruptures: number
      valeur_matieres: number
    }
    mouvements: ReportStockMovement[]
    produits_sous_minimum: ReportStockItem[]
    matieres_sous_minimum: ReportStockItem[]
  }
  production: {
    objectif_vs_realise: ReportItem[]
    production_par_machine: ReportItem[]
    consommation_matiere: ReportItem[]
    cout_production: {
      cout_total: number
    }
  }
  recyclage: {
    quantite_transformee: ReportRecyclePoint[]
    evolution_mensuelle: ReportRecyclePoint[]
  }
  finance: {
    chiffre_affaires: number
    factures_emises: number
    factures_en_attente: number
    factures_en_retard: number
    clients_debiteurs: ReportItem[]
  }
  mouvements: ReportMouvements
  generated_at: string
}

export interface ReportsFilters {
  date_debut?: string
  date_fin?: string
    mouvement_entite_type?: 'produit' | 'matiere'
  mouvement_entite_id?: number
  mouvement_motif?: string
  [key: string]: unknown
}

export interface ReportMouvementRow {
  date_mouvement: string
  reference: string | null
  designation: string | null
  classement: string | null
  sorties: number
  entree_fabrication: number
  autres_entrees: number
  retours: number
  stock_depart: number
  stock_a_jour: number
  cout_unitaire_pondere: number
  valeur_stock: number
  source_reference: string | null
  source_label: string | null
  motif: string | null
  tiers: string | null
}

export interface ReportMouvements {
  motifs: string[]
  lignes: ReportMouvementRow[]
}